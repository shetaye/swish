# VideoContentService

Stores videos in the CDN and manages transcoding jobs

## muxWebhook

Subsequent actions depend heavily on event received.

-   Transcoding complete
-   1. Calls [SearchService](../SearchService/README.md)/addVideo for search indexing
-   2. Updates video transcoding data in DB

## getVideo

Returns transcoding information from DB

## uploadVideo

Streams video data to CDN