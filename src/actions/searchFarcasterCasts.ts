import {
    type ActionExample,
    type HandlerCallback,
    elizaLogger,
} from "@elizaos/core";

import { createAction } from "./action-factory";
import { type SearchRequestOptions } from "../types/common-types";

// Action configuration
const actionConfig = {
    name: "SEARCH_FARCASTER_CASTS",
    similes: [
        "SEARCH_CASTS",
        "FIND_FARCASTER_CONTENT",
        "SEMANTIC_SEARCH",
        "QUERY_FARCASTER",
    ],
    description:
        "Perform semantic search for content on Farcaster based on a text query.",
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

// Handler implementation
const searchHandler = async (
    runtime: any,
    message: any,
    state: any,
    options: SearchRequestOptions,
    callback?: HandlerCallback,
    mbdService?: any
) => {
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
};

// Create and export the action
export const searchFarcasterCasts = createAction<SearchRequestOptions>(
    actionConfig,
    searchHandler
);