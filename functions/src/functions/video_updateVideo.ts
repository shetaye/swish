import * as functions from 'firebase-functions';
import { ISchemaVideo } from '../definitions';
import { db, addLog, log } from '../globals';
import { videoSchemaFromFirestore, resolveVideo } from '../converters';

export const video_updateVideo = functions.https.onCall(async (data, context) => {
    if(!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to make this request');
    }
    // Check video existence
    const videoId = data.video;
    if(!(typeof videoId === 'string') || videoId.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Video does not exist');
    }
    const videoDoc = db.doc(`videos/${videoId}`);
    const videoSnap = await videoDoc.get();
    const videoData = videoSnap.data();
    if(!videoSnap.exists || !videoData) {
        throw new functions.https.HttpsError('invalid-argument', 'Channel does not exist');
    }
    const video = videoSchemaFromFirestore(videoData);

    // Get channel
    const channel = (await resolveVideo(db, video)).channel;

    // Check owner
    if(context.auth.uid != channel.owner || context.auth.uid != video.author) {
        throw new functions.https.HttpsError('permission-denied', 'User must be owner of video to update it');
    }

    // Get fields to edit
    let willEditTitle = false;
    let willEditDescription = false;
    const newVideo: ISchemaVideo = video;

    if(data.title) {
        if(!(typeof data.title === 'string') || data.title.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid video title');
        }
        willEditTitle = true;
        newVideo.title = data.title;
    }

    if(data.description) {
        if(!(typeof data.description === 'string') || data.description.length === 0 || data.description.length > 5000) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid description');
        }
        willEditDescription = true;
        newVideo.description = data.description;
    }

    await videoDoc.update(newVideo);

    await addLog(log, 'deleteChannel', {
        eventSource: 'channel',
        value: newVideo,
        message: `Channel ${channel.id} : ${channel.name} updated ${willEditTitle ? 't' : ''}${willEditDescription ? 'd' : ''}`
    });
    return channel;
});