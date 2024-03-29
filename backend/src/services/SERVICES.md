# Services

## APIGatewayService

Handles all API requests

## VideoDataService

Provides video data fields and assembles related fields

## VideoContentService

Stores videos in the CDN and manages transcoding jobs

## ChannelDataService

Provides channel data fields and assembles related fields

## ChannelContentService

Uploads channel content to the CDN and preprocesses (resizes, transforms, formats, etc.) them.

## SearchService

Handles search index updating

## WatchTimeService

Tracks watch time on videos

# Interesting or complicated (or both) Flows

## Uploading a video

To create a video, the user first sends a request to "allocate" the video, which hits the /createVideo endpopint in [VideoDataService](./VideoDataService/README.md). A nonuploaded, untranscoded video object is returned (empty schema with no mux fields).

The user then stream a multipart upload to [VideoContentService](./VideoContentService/README.md)/uploadVideo that stream their data to the CDN.

The [VideoContentService](./VideoContentService/README.md) then requests a transcoding job.

Once the transcoding job is complete, the transcoding service calls an API endpoint that authenticates the event and calls back to [VideoContentService](./VideoContentService/README.md)/muxEndpoint. VideoContentervice then marks the video as transcoded and ready, and attaches video transcoding data to the DB object. It also calls [SearchService](./SearchService/README.md)/addVideo to add the video to the index.

## Uploading channel art

This is similar, albeit less complicated without transcoding, to the video upload flow

To upload channel art, the user first begins streaming their art to a streaming endpoint (/uploadIcon for channel icon) provided by [ChannelContentService](./ChannelContentService/README.md), which compresses and resizes channel art, and streams reformatted art to the CDN. Once the stream is complete, it triggers the CDN to delete the old channel art.
