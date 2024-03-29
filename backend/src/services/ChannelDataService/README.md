# ChannelDataService

Provides channel data fields and assembles related fields

## /getChannel

Retrieves data from DB

## /queryChannel

Query fields:

-   owner - Filters channels based on owner

## /createChannel

1. Creates DB entry
2. Calls [SearchService](../SearchService/README.md)/createChannel

## /updateChannel

_Channels can only be updated by the owner_

1. Updates DB entry
2. Calls [SearchService](../SearchService/README.md)/updateChannel to update fields

## /deleteChannel

_Channels can only be deleted by the owner_

1. Calls [SearchService](../SearchService/README.md)/deleteChannel to remove from search index
2. Removes from DB
