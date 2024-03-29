import { tID, IError, IServiceInvocationContext } from '@/definitions';
import {
  storageInstance,
  pubsubSubscription,
  appConfig,
  swishflakeGenerator,
} from '@/sharedInstances';
import {
  IVideoContent,
  IVideoContentSchema,
  IMuxAssetDeletedEvent,
  IMuxAssetReadyEvent,
} from './definitions';
import * as VideoDataService from '@services/VideoDataService';
import * as SearchService from '@services/SearchService';
import axios from 'axios';
import {
  ResourceNotFoundError,
  AuthorizationError,
  InternalError,
} from '@/errors';
import { Message } from '@google-cloud/pubsub';
import { toNamespaced } from '@/utils';
import { IVideo } from '@services/VideoDataService/definitions';
import { knexInstance } from './db';

// Auth Token
const username =
  appConfig.environment === 'prod'
    ? process.env.PROD_MUXID
    : process.env.DEV_MUXID;
const password =
  appConfig.environment === 'prod'
    ? process.env.PROD_MUXSECRET
    : process.env.DEV_MUXSECRET;
const authToken = Buffer.from(
  `${(username ? username : '').replace('\n', '')}:${(password
    ? password
    : ''
  ).replace('\n', '')}`,
  'utf8',
).toString('base64');

// #region Pubsub handler registration
pubsubSubscription.on('message', async (message: Message) => {
  // Process the message and parse it into something we understand
  const bodyData: any = JSON.parse(message.data.toString());
  message.ack();

  // Call muxWebhook
  try {
    switch (bodyData.type) {
      case 'video.asset.ready':
        await handleMuxAssetReady({
          type: 'ready',
          assetID: bodyData.object.id,
          playbackID: bodyData.data.playback_ids.find(
            (id: any) => id.policy === 'public',
          ).id,
          duration: bodyData.data.duration,
          videoID: bodyData.data.passthrough.split(':')[0],
          contentID: bodyData.data.passthrough.split(':')[1],
          environment: {
            name: bodyData.environment.name,
            id: bodyData.environment.id,
          },
        });
        break;
      case 'video.asset.deleted':
        await handleMuxAssetDeleted({
          type: 'deleted',
          assetID: bodyData.object.id,
          videoID: bodyData.data.passthrough.split(':')[0],
          contentID: bodyData.data.passthrough.split(':')[1],
          environment: {
            name: bodyData.environment.name,
            id: bodyData.environment.id,
          },
        });
        break;
      default:
        break;
    }
  } catch (e) {
    // Log the error since there is no point in throwing
    console.error(e); // tslint:disable-line:no-console
  }
});
pubsubSubscription.on('error', (error) => {
  // Log the error since there is no point in throwing
  console.error(`Received PubSub error: ${error}`); // tslint:disable-line:no-console
});
// #endregion Pubsub handler registration

/**
 * Handles the mux AssetReady event.  Creates the content record and updates the video reference it.
 * @param muxEvent The mux event to respond to
 */
export async function handleMuxAssetReady(
  muxEvent: IMuxAssetReadyEvent,
): Promise<void> {
  // Create a new video content record
  const videoContent: IVideoContent = {
    id: muxEvent.contentID,
    assetID: muxEvent.assetID,
    playbackID: muxEvent.playbackID,
    duration: muxEvent.duration,
  };
  await knexInstance.table<IVideoContentSchema>('content').insert({
    id: videoContent.id,
    asset_id: videoContent.assetID,
    playback_id: videoContent.playbackID,
    duration: videoContent.duration,
  });

  // Notify the VideoDataService so it can update the record
  await VideoDataService.updateContent(
    null,
    muxEvent.videoID,
    muxEvent.contentID,
  );

  // Add to search index
  // Refetch the video so it has content and an uploadDate
  const videoData = await VideoDataService.getVideo(
    {
      auth: {
        elevated: true,
        userID: null,
        token: null,
        userIDInt: null,
      },
    },
    muxEvent.videoID,
  );
  await SearchService.addVideo(
    {
      auth: {
        elevated: true,
        userID: null,
        token: null,
        userIDInt: null,
      },
    },
    videoData,
  );
}

/**
 * Handles the mux AssetDeleted event
 * @param muxEvent The mux event to respond to
 */
export async function handleMuxAssetDeleted(
  muxEvent: IMuxAssetDeletedEvent,
): Promise<void> {
  // Notify VideoDataService so it can update the content reference
  await VideoDataService.updateContent(null, muxEvent.videoID, null);
  // Delete record
  await knexInstance
    .table<IVideoContentSchema>('content')
    .where('id', muxEvent.contentID)
    .del();
}

/**
 * Retrieves a content record
 * @param context Invocation context
 * @param id ID of content record
 */
export async function getVideo(
  context: IServiceInvocationContext,
  id: tID,
): Promise<IVideoContent> {
  const rows = await knexInstance
    .select('*')
    .from<IVideoContentSchema>('content')
    .where('id', id);
  if (rows.length === 0) {
    throw new ResourceNotFoundError('VideoContent', 'videoContent', id);
  }
  if (rows.length > 1) {
    throw new InternalError(
      'VideoContent',
      'More than one content record was found with matching ID',
    );
  }
  const schema = rows[0];
  return {
    id: schema.id,
    playbackID: schema.playback_id,
    assetID: schema.asset_id,
    duration: schema.duration,
  };
}

/**
 * Utility function to pipe data and resolve a promise when the pipe is complete (or reject on error)
 * @param readStream Stream to read from
 * @param writeStream Stream to write to
 */
function promisePiper(
  readStream: NodeJS.ReadableStream,
  writeStream: NodeJS.WritableStream,
): Promise<void> {
  return new Promise((resolve, reject) => {
    readStream.pipe(writeStream);
    writeStream.on('finish', () => {
      resolve();
    });
  });
}

/**
 * Upload a video to the CDN and call the transcoder on complete
 * @param context Invocation context
 * @param id ID of video to upload
 * @param fileStream Filestream of video data
 * @param mime Mimetype of video
 */
export async function uploadVideo(
  context: IServiceInvocationContext,
  id: tID,
  fileStream: NodeJS.ReadableStream,
  mime: string,
): Promise<void> {
  const video = await VideoDataService.getVideo(context, id);
  // Authorization Check
  // Video can only be uploaded by author
  if (context.auth.userID !== video.author) {
    throw new AuthorizationError('VideoContent', 'upload video data');
  }

  // Build our storage path
  const path = `masters/${context.auth.userID}/${id}`;
  const storageObject = storageInstance.bucket(appConfig.bucket).file(path);
  // Create the storage writestream
  const storageWritestream = storageObject.createWriteStream({
    metadata: {
      contentType: mime,
    },
  });
  // Upload
  await promisePiper(fileStream, storageWritestream);
  // Make public for axios
  await storageObject.makePublic();
  // Call transcoder

  // NOTE: Here is where I create the ID for the new content record.
  // The passthrough value takes the form <videoID>:<contentID>
  await axios.post(
    'https://api.mux.com/video/v1/assets',
    {
      input: `https://storage.googleapis.com/${appConfig.bucket}/${path}`,
      playback_policy: ['public'],
      passthrough: `${id}:${swishflakeGenerator.nextID()}`,
    },
    {
      headers: {
        Authorization: `Basic ${authToken}`,
      },
    },
  );
  // We're done here
}

/**
 * Delete a video from the CDN
 * @param context Invocation context
 * @param id ID of a videos content record to delete
 */
export async function deleteVideo(context: IServiceInvocationContext, id: tID) {
  // Retrieve content record
  const contentRecord = await getVideo(context, id);

  // Delete from mux.  Upon successful deletion the content record will be deleted
  await axios.delete(
    `https://api.mux.com/video/v1/assets/${contentRecord.assetID}`,
    {
      headers: {
        Authorization: `Basic ${authToken}`,
      },
    },
  );
}
