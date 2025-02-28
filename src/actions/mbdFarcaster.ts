import {
    elizaLogger,
    ActionExample,
    Memory,
    IAgentRuntime,
    State,
    type Action,
    HandlerCallback,
} from "@elizaos/core";

import { MBDFarcasterService } from "../services/mbd.service";
import { EventType, LabelCategory } from "../types/mbd-types";

// Action to retrieve Farcaster feeds (for-you, trending, popular)
export const getFarcasterFeed: Action = {
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
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Optional validation: check if API key is configured
        const apiKey = runtime.getSetting("MBD_API_KEY");
        if (!apiKey) {
            elizaLogger.warn("MBD_API_KEY not defined, plugin may operate with rate limitations");
        }
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: {
            feedType?: string;
            userId?: string;
            top_k?: number;
            page_size?: number;
            page_number?: number;
            [key: string]: any;
        },
        callback?: HandlerCallback
    ) => {
        // Initialize the MBD service
        const mbdService = new MBDFarcasterService();
        await mbdService.initialize(runtime);

        // Ensure state exists or generate a new one
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

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
            elizaLogger.error("Error processing MBD feed request:", error);
            if (callback) {
                callback({
                    text: `Error processing the request: ${error.message}`,
                    content: { error: error.message }
                });
            }
            return false;
        }
    },
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

// Action for semantic search of casts
export const searchFarcasterCasts: Action = {
    name: "SEARCH_FARCASTER_CASTS",
    similes: [
        "SEARCH_CASTS",
        "FIND_FARCASTER_CONTENT",
        "SEMANTIC_SEARCH",
        "QUERY_FARCASTER",
    ],
    description:
        "Perform semantic search for content on Farcaster based on a text query.",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: {
            query?: string;
            top_k?: number;
            return_ai_labels?: boolean;
            return_metadata?: boolean;
            [key: string]: any;
        },
        callback?: HandlerCallback
    ) => {
        // Initialize the MBD service
        const mbdService = new MBDFarcasterService();
        await mbdService.initialize(runtime);

        // Ensure state exists or generate a new one
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        try {
            // Use query from options or directly from the message
            const query = options.query || message.content.text;

            if (!query) {
                if (callback) {
                    callback({
                        text: "Please provide a query for semantic search.",
                        content: { error: "Query not provided" }
                    });
                }
                return false;
            }

            elizaLogger.log(`Performing semantic search for: "${query}"`);

            const searchOptions = {
                top_k: options.top_k || 10,
                return_ai_labels: options.return_ai_labels !== undefined ? options.return_ai_labels : true,
                return_metadata: options.return_metadata !== undefined ? options.return_metadata : true,
                filters: options.filters
            };

            const response = await mbdService.semanticSearch(query, searchOptions);

            let responseText = `Search results for "${query}":\n\n`;
            responseText += mbdService.formatCastsResponse(response);

            if (callback) {
                callback({
                    text: responseText,
                    content: { ...response }
                });
            }
            return true;

        } catch (error) {
            elizaLogger.error("Error processing MBD semantic search:", error);
            if (callback) {
                callback({
                    text: `Error processing the search: ${error.message}`,
                    content: { error: error.message }
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find posts on Farcaster about blockchain and web3",
                    action: "SEARCH_FARCASTER_CASTS",
                    query: "blockchain web3 developments 2025",
                    top_k: 5
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Search for casts about NFTs and digital art",
                    action: "SEARCH_FARCASTER_CASTS",
                    query: "NFT digital art market trends",
                    top_k: 10,
                    return_ai_labels: true
                },
            },
        ],
    ] as ActionExample[][],
};

// Action for content analysis via AI labels
export const analyzeFarcasterContent: Action = {
    name: "ANALYZE_FARCASTER_CONTENT",
    similes: [
        "CONTENT_ANALYSIS",
        "GET_AI_LABELS",
        "SENTIMENT_ANALYSIS",
        "TOPIC_CLASSIFICATION",
        "EMOTION_ANALYSIS",
    ],
    description:
        "Analyze Farcaster content using AI labels for topics, sentiment, emotion, and moderation.",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: {
            analysisType: 'items' | 'text' | 'top-items';
            labelCategory: LabelCategory;
            itemsList?: string[];
            textInputs?: string[];
            label?: string;
            top_k?: number;
            reverse?: boolean;
            [key: string]: any;
        },
        callback?: HandlerCallback
    ) => {
        // Initialize the MBD service
        const mbdService = new MBDFarcasterService();
        await mbdService.initialize(runtime);

        // Ensure state exists or generate a new one
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        try {
            const analysisType = options.analysisType || 'items';
            const labelCategory = options.labelCategory || LabelCategory.TOPICS;
            let responseText = '';
            let response;

            switch (analysisType) {
                case 'items':
                    // Label analysis for specific casts
                    if (!options.itemsList || options.itemsList.length === 0) {
                        if (callback) {
                            callback({
                                text: "To analyze casts, you must provide a list of cast IDs.",
                                content: { error: "itemsList is required for items analysis" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.getLabelsForItems(options.itemsList, labelCategory);
                    responseText = `${labelCategory} analysis for the provided casts:\n\n`;
                    responseText += mbdService.formatLabelsResponse(response);
                    break;

                case 'text':
                    // Label analysis for texts
                    if (!options.textInputs || options.textInputs.length === 0) {
                        if (callback) {
                            callback({
                                text: "To analyze texts, you must provide a list of texts.",
                                content: { error: "textInputs is required for text analysis" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.getLabelsForText(options.textInputs, labelCategory);
                    responseText = `${labelCategory} analysis for the provided texts:\n\n`;

                    // Manual formatting for text analysis response
                    if (response.success && response.data) {
                        Object.entries(response.data).forEach(([index, labels]) => {
                            const textIndex = parseInt(index);
                            const text = options.textInputs[textIndex];
                            responseText += `**Text ${textIndex + 1}**: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"\n`;

                            Object.entries(labels)
                                .sort((a, b) => b[1] - a[1]) // Sort by value (highest to lowest)
                                .forEach(([label, value]) => {
                                    responseText += `- ${label}: ${(value * 100).toFixed(1)}%\n`;
                                });

                            responseText += '\n';
                        });
                    } else {
                        responseText += "No analysis results available.";
                    }
                    break;

                case 'top-items':
                    // Find items with highest scores for a label
                    if (!options.label) {
                        if (callback) {
                            callback({
                                text: "To search for items by label, you must specify a label.",
                                content: { error: "label is required for top-items analysis" }
                            });
                        }
                        return false;
                    }

                    const topItemsOptions = {
                        top_k: options.top_k || 10,
                        reverse: options.reverse || false,
                        filters: options.filters
                    };

                    response = await mbdService.getTopItemsByLabel(options.label, topItemsOptions);

                    const direction = topItemsOptions.reverse ? "lowest" : "highest";
                    responseText = `Casts with ${direction} scores for the label "${options.label}":\n\n`;
                    responseText += mbdService.formatCastsResponse(response);
                    break;

                default:
                    if (callback) {
                        callback({
                            text: `Invalid analysis type: ${analysisType}. Valid types are: 'items', 'text', 'top-items'.`,
                            content: { error: "Invalid analysis type" }
                        });
                    }
                    return false;
            }

            if (callback) {
                callback({
                    text: responseText,
                    content: { ...response }
                });
            }
            return true;

        } catch (error) {
            elizaLogger.error("Error processing MBD content analysis:", error);
            if (callback) {
                callback({
                    text: `Error processing the analysis: ${error.message}`,
                    content: { error: error.message }
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Analyze the sentiment of these casts: ['123456', '789012']",
                    action: "ANALYZE_FARCASTER_CONTENT",
                    analysisType: "items",
                    labelCategory: LabelCategory.SENTIMENT,
                    itemsList: ["123456", "789012"]
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Classify these texts by topic: 'Web3 is transforming finance' and 'NFTs are revolutionizing digital art'",
                    action: "ANALYZE_FARCASTER_CONTENT",
                    analysisType: "text",
                    labelCategory: LabelCategory.TOPICS,
                    textInputs: ["Web3 is transforming finance", "NFTs are revolutionizing digital art"]
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find the most positive casts on Farcaster",
                    action: "ANALYZE_FARCASTER_CONTENT",
                    analysisType: "top-items",
                    label: "positive",
                    top_k: 5
                },
            },
        ],
    ] as ActionExample[][],
};

// Action for user discovery on Farcaster
export const discoverFarcasterUsers: Action = {
    name: "DISCOVER_FARCASTER_USERS",
    similes: [
        "FIND_USERS",
        "USER_DISCOVERY",
        "SIMILAR_USERS",
        "SEARCH_USERS",
        "USER_RECOMMENDATIONS",
    ],
    description:
        "Discover users on Farcaster through semantic search, similarity, or by channels/topics/items.",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: {
            discoveryType: 'similar' | 'search' | 'channel' | 'item' | 'topic';
            userId?: string;
            query?: string;
            channel?: string;
            itemId?: string;
            topic?: string;
            eventType?: EventType;
            top_k?: number;
            [key: string]: any;
        },
        callback?: HandlerCallback
    ) => {
        // Initialize the MBD service
        const mbdService = new MBDFarcasterService();
        await mbdService.initialize(runtime);

        // Ensure state exists or generate a new one
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        try {
            const discoveryType = options.discoveryType || 'search';
            const eventType = options.eventType || EventType.ALL;
            let responseText = '';
            let response;

            switch (discoveryType) {
                case 'similar':
                    // Find users similar to a specific user
                    if (!options.userId) {
                        if (callback) {
                            callback({
                                text: "To find similar users, you must provide a user ID (FID).",
                                content: { error: "userId is required for similar discovery" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.getSimilarUsers(options.userId, { top_k: options.top_k || 10 });
                    responseText = `Users similar to user ${options.userId}:\n\n`;
                    break;

                case 'search':
                    // Semantic search for users
                    const query = options.query || message.content.text;

                    if (!query) {
                        if (callback) {
                            callback({
                                text: "Please provide a query for user search.",
                                content: { error: "Query not provided" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.searchUsers(query, { top_k: options.top_k || 10 });
                    responseText = `Users related to the query "${query}":\n\n`;
                    break;

                case 'channel':
                    // Find users by channel
                    if (!options.channel) {
                        if (callback) {
                            callback({
                                text: "To search users by channel, you must provide a channel.",
                                content: { error: "channel is required for channel discovery" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.getUsersForChannel(options.channel, eventType, options);
                    responseText = `Users in channel ${options.channel} (event type: ${eventType}):\n\n`;
                    break;

                case 'item':
                    // Find users by item
                    if (!options.itemId) {
                        if (callback) {
                            callback({
                                text: "To search users by item, you must provide an item ID.",
                                content: { error: "itemId is required for item discovery" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.getUsersForItem(options.itemId, eventType, options);
                    responseText = `Users who interacted with item ${options.itemId} (event type: ${eventType}):\n\n`;
                    break;

                case 'topic':
                    // Find users by topic
                    if (!options.topic) {
                        if (callback) {
                            callback({
                                text: "To search users by topic, you must provide a topic.",
                                content: { error: "topic is required for topic discovery" }
                            });
                        }
                        return false;
                    }

                    response = await mbdService.getUsersForTopic(options.topic, eventType, options);
                    responseText = `Users related to topic ${options.topic} (event type: ${eventType}):\n\n`;
                    break;

                default:
                    if (callback) {
                        callback({
                            text: `Invalid discovery type: ${discoveryType}. Valid types are: 'similar', 'search', 'channel', 'item', 'topic'.`,
                            content: { error: "Invalid discovery type" }
                        });
                    }
                    return false;
            }

            responseText += mbdService.formatUsersResponse(response);

            if (callback) {
                callback({
                    text: responseText,
                    content: { ...response }
                });
            }
            return true;

        } catch (error) {
            elizaLogger.error("Error processing MBD user discovery:", error);
            if (callback) {
                callback({
                    text: `Error processing the discovery: ${error.message}`,
                    content: { error: error.message }
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find users similar to user 12345",
                    action: "DISCOVER_FARCASTER_USERS",
                    discoveryType: "similar",
                    userId: "12345",
                    top_k: 5
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Search for Farcaster users who talk about cryptocurrencies",
                    action: "DISCOVER_FARCASTER_USERS",
                    discoveryType: "search",
                    query: "cryptocurrency experts blockchain developers",
                    top_k: 10
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Which users are most active in the 'web3' channel?",
                    action: "DISCOVER_FARCASTER_USERS",
                    discoveryType: "channel",
                    channel: "web3",
                    eventType: EventType.ALL
                },
            },
        ],
    ] as ActionExample[][],
};

// Export all actions for use in index.ts
export default [
    getFarcasterFeed,
    searchFarcasterCasts,
    analyzeFarcasterContent,
    discoverFarcasterUsers
];