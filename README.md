# Meteor, an ad free experience

Meteor is a solution to the problem of ads.  Proposed initially by Nicholas Feider, Meteor is a video streaming platform with tight Youtube integration that aims to replace the ad based income that supports the modern day content creator.  

Instead of using the ad revenue generated by free users to support content creators, it has users pay a small (think Netflix) fee per month to use the service, then use this fee to support the content creators that the user chooses to view.  The fee ($10 - $20) is divided proportionally among each of the content creators the user consumes by watch time.

## Terms

### Paid Video

Paid videos are the primary video type.  Meteor videos uploaded as Paid Videos can only be watched by paying users.  Paid videos provide payouts through the proportional payout system, and contribute to a user's paid-seconds.

### Free Video

Free videos are the default video type.  Youtube videos displayed on Meteor and Meteor videos explicitly uploaded are considered Free videos.  Free videos can be watched by both logged in users, paying users, and anonymous users. 

### Meteor Channel

### Meteor Video

Meteor videos are videos that are uploaded explicitly to the platform, or exported from a Youtube channel.

### Youtube Video

### Video Claim

Meteor videos can be claimed by a logged in user.  If a user has reuploaded a Youtube video not owned by them to Meteor, the correct owner can claim the Meteor video.  A claimed Meteor video is exempted from payouts until correct ownership can be confirmed.  If the claim is false, the video's payout will be added to the next billing cycle.  If the claim holds, the video will be tranferred to the claimer's Meteor channel.  If other reuploads of the same video are found, they are deleted, with the video with the largest watch time kept on the proper owner's Meteor Channel.

## Project Plan

Meteor is broken into two major pieces: The **Youtube Client** and the **Creator Platform**

### Youtube Client

* Youtube native video
    * Searching
    * Recommendation
    * Channel listing
    * Comments
    * Subscription

### Creator Platform

* Payouts
* Paid / Free / Anonymous user tiers
* Meteor Native video
    * Everything from Youtube native video
    * Meteor channel listing
    * Youtube Import
    * Upload
* Proportional second tracking 
* Watch time tracking

The Creator Platform allows the creation (through upload and Youtube import) of Meteor videos as both paid and free.  Paid users also exist on the Creator Platform.  When paying users watch paid videos, their watch time is tracked in seconds, and evenly divided from there to video creators using the proportionality system.