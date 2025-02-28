import {
    type ActionExample,
    type HandlerCallback,
    elizaLogger,
} from "@elizaos/core";

import { createAction } from "./action-factory";
import { type FeedRequestOptions } from "../types/common-types";

// Action configuration
const actionConfig = {
    name: "GET_FARCASTER_FEED",
    similes: [
        "FARCASTER_FEED",
        "GET_CASTS",
        "FETCH_FARCASTER_POSTS",
        "DISCOVER_CONTENT",
        "TRENDING_CASTS",
        "POPULAR_CASTS",
    ],
    description:
        "Retrieve content feeds from Farcaster, including personalized, trending, and popular feeds.",
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the most popular casts on Farcaster",
                    action: "GET_FARCASTER_FEED",
                    feedType: "popular",
                    top_k: 5
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are the trending casts right now?",
                    action: "GET_FARCASTER_FEED",
                    feedType: "trending",
                    top_k: 10
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the recommended casts for user 12345",
                    action: "GET_FARCASTER_FEED",
                    feedType: "for-you",
                    userId: "12345",
                    top_k: 5
                },
            },
        ],
    ] as ActionExample[][],
};

// Handler implementation
const feedHandler = async (
    runtime: any,
    message: any,
    state: any,
    options: FeedRequestOptions,
    callback?: HandlerCallback,
    mbdService?: any
) => {
    try {
        let response;
        const feedType = options.feedType || 'trending';
        let responseText = '';

        elizaLogger.log(`Retrieving feed of type: ${feedType}`);

        switch (feedType.toLowerCase()) {
            case 'for-you':
                // For personalized feed, we need a userId
                const userId = options.userId || '';
                if (!userId) {
                    if (callback) {
                        callback({
                            text: "To get a personalized 'for-you' feed, you must provide a user ID (FID).",
                            content: { error: "userId is required for for-you feed" }
                        });
                    }
                    return false;
                }
                response = await mbdService.getForYouFeed(userId, options);
                responseText = `Personalized feed for user ${userId}:\n\n`;
                break;

            case 'popular':
                response = await mbdService.getPopularFeed(options);
                responseText = "Popular casts feed on Farcaster:\n\n";
                break;

            case 'trending':
            default:
                response = await mbdService.getTrendingFeed(options);
                responseText = "Trending casts feed on Farcaster:\n\n";
                break;
        }

        responseText += mbdService.formatCastsResponse(response);

        if (callback) {
            callback({
                text: responseText,
                content: { ...response }
            });
        }
        return true;

    } catch (error) {
        // Error handling is done in the action factory
        throw error;
    }
};

// Create and export the action
export const getFarcasterFeed = createAction<FeedRequestOptions>(
    actionConfig,
    feedHandler
);