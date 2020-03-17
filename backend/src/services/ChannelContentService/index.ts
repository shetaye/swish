import sharp from 'sharp';
import { firestoreInstance, storageInstance } from '../../sharedInstances';
import { tID, IServiceInvocationContext } from '../../definitions';
import { CreateWriteStreamOptions } from '@google-cloud/storage';

const sharpPipeline = sharp().png();
const pipeline_128 = sharpPipeline.clone().resize(128, 128);
const pipeline_64 = sharpPipeline.clone().resize(64, 64);
const pipeline_32 = sharpPipeline.clone().resize(32, 32);

/**
 * Formats and saves a channel icon
 * @param id ID of channel the icon is for
 * @param imageStream Raw upload stream from the user
 */
export async function uploadIcon(
    context: IServiceInvocationContext,
    id: tID,
    imageStream: NodeJS.ReadableStream,
): Promise<void> {
    //TODO: Check auth here
    // Setup storage writestreams
    const path_128 = `channelIcons/${id}_128.png`;
    const path_64 = `channelIcons/${id}_64.png`;
    const path_32 = `channelIcons/${id}_32.png`;
    const storageObject_128 = storageInstance
        .bucket('meteor-videos')
        .file(path_128);
    const storageObject_64 = storageInstance
        .bucket('meteor-videos')
        .file(path_64);
    const storageObject_32 = storageInstance
        .bucket('meteor-videos')
        .file(path_32);
    const storageMetadata: CreateWriteStreamOptions = {
        metadata: {
            contentType: 'image/png',
        },
    };
    const storageWritestream_128 = storageObject_128.createWriteStream(
        storageMetadata,
    );
    const storageWritestream_64 = storageObject_64.createWriteStream(
        storageMetadata,
    );
    const storageWritestream_32 = storageObject_32.createWriteStream(
        storageMetadata,
    );

    // Pipe pipelines
    imageStream.pipe(sharpPipeline);
    pipeline_128.pipe(storageWritestream_128);
    pipeline_64.pipe(storageWritestream_64);
    pipeline_32.pipe(storageWritestream_32);

    // Wait for upload to finish
    const promises = [
        new Promise((resolve, reject) => {
            storageWritestream_128.on('error', reject);
            storageWritestream_128.on('finish', resolve);
        }),
        new Promise((resolve, reject) => {
            storageWritestream_64.on('error', reject);
            storageWritestream_64.on('finish', resolve);
        }),
        new Promise((resolve, reject) => {
            storageWritestream_32.on('error', reject);
            storageWritestream_32.on('finish', resolve);
        }),
    ];
    await Promise.all(promises);

    // Make public
    await storageObject_128.makePublic();
    await storageObject_64.makePublic();
    await storageObject_32.makePublic();
}