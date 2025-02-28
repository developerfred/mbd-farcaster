import {
    elizaLogger,
    Service,
    IAgentRuntime,
    ServiceType,
} from "@elizaos/core";

import {
    MBDCastFeedResponse,
    MBDSemanticSearchResponse,
    MBDLabelsResponse,
    MBDTextLabelsResponse,
    MBDUserFeedResponse,
    MBDUserSearchResponse,
    LabelCategory,
    EventType,
    IMBDService,
    MBD_SERVICE_TYPE
} from '../types/mbd-types';

export class MBDFarcasterService extends Service implements IMBDService {
    baseUrl: string;
    headers: {
        [key: string]: string;
    };
    settings: {
        appName: string;
        appUrl: string;
        debug: boolean;
    };
    apiKey: string;

    static get serviceType(): ServiceType {
        return MBD_SERVICE_TYPE;
    }

    get serviceType(): ServiceType {
        return MBD_SERVICE_TYPE;
    }

    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.apiKey = runtime.getSetting("MBD_API_KEY");
        this.baseUrl = "https://api.mbd.xyz/v2/farcaster";
        this.headers = {
            'content-type': 'application/json',
            'accept': 'application/json',
        };

        
        const appUrl = runtime.getSetting("MBD_APP_URL") || "https://docs.mbd.xyz/";
        const appName = runtime.getSetting("MBD_APP_NAME") || "eliza_mbd_plugin";

        this.headers['HTTP-Referer'] = appUrl;
        this.headers['X-Title'] = appName;

        
        if (this.apiKey) {
            this.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        this.settings = {
            appName,
            appUrl,
            debug: runtime.getSetting("MBD_DEBUG") === "true"
        };

        if (this.settings.debug) {
            elizaLogger.debug("MBD Farcaster Service initialized with:", {
                baseUrl: this.baseUrl,
                appName: this.settings.appName,
                appUrl: this.settings.appUrl,
                hasApiKey: !!this.apiKey
            });
        }
    }

    /**
     * Helper method for making requests to the MBD API
     */
    private async makeRequest<T>(endpoint: string, body: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        if (this.settings.debug) {
            elizaLogger.debug(`Making request to ${url} with body:`, body);
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`MBD API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            if (this.settings.debug) {
                elizaLogger.debug(`Response from ${endpoint}:`, data);
            }

            return data as T;
        } catch (error) {
            elizaLogger.error(`Error calling MBD API at ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Get "For You" feed - personalized recommendations for a user
     */
    async getForYouFeed(userId: string, options: any = {}): Promise<MBDCastFeedResponse> {
        const body: any = {
            user_id: userId,
            ...options
        };

        return this.makeRequest<MBDCastFeedResponse>('/casts/feed/for-you', body);
    }

    /**
     * Get trending cast feed
     */
    async getTrendingFeed(options: any = {}): Promise<MBDCastFeedResponse> {
        return this.makeRequest<MBDCastFeedResponse>('/casts/feed/trending', options);
    }

    /**
     * Get popular cast feed
     */
    async getPopularFeed(options: any = {}): Promise<MBDCastFeedResponse> {
        return this.makeRequest<MBDCastFeedResponse>('/casts/feed/popular', options);
    }

    /**
     * Perform semantic cast search
     */
    async semanticSearch(query: string, options: any = {}): Promise<MBDSemanticSearchResponse> {
        const body = {
            query,
            ...options
        };

        return this.makeRequest<MBDSemanticSearchResponse>('/casts/search/semantic', body);
    }

    /**
     * Get AI labels for a cast list
     */
    async getLabelsForItems(itemsList: string[], labelCategory: LabelCategory): Promise<MBDLabelsResponse> {
        const body = {
            items_list: itemsList,
            label_category: labelCategory
        };

        return this.makeRequest<MBDLabelsResponse>('/casts/labels/for-items', body);
    }

    /**
     * Get AI labels for texts
     */
    async getLabelsForText(textInputs: string[], labelCategory: LabelCategory): Promise<MBDTextLabelsResponse> {
        const body = {
            text_inputs: textInputs,
            label_category: labelCategory
        };

        return this.makeRequest<MBDTextLabelsResponse>('/casts/labels/for-text', body);
    }

    /**
     * Get casts with the highest or lowest scores for a given label
     */
    async getTopItemsByLabel(label: string, options: any = {}): Promise<MBDCastFeedResponse> {
        const body = {
            label,
            ...options
        };

        return this.makeRequest<MBDCastFeedResponse>('/casts/labels/top-items', body);
    }

    /**
     * Get users similar to a specific user
     */
    async getSimilarUsers(userId: string, options: any = {}): Promise<MBDUserFeedResponse> {
        const body = {
            user_id: userId,
            ...options
        };

        return this.makeRequest<MBDUserFeedResponse>('/users/feed/similar', body);
    }

    /**
     * Search users based on text
     */
    async searchUsers(query: string, options: any = {}): Promise<MBDUserSearchResponse> {
        const body = {
            query,
            ...options
        };

        return this.makeRequest<MBDUserSearchResponse>('/users/search/semantic', body);
    }

    /**
     * Get users for a channel
     */
    async getUsersForChannel(channel: string, eventType: EventType, options: any = {}): Promise<MBDUserFeedResponse> {
        const body = {
            channel,
            event_type: eventType,
            ...options
        };

        return this.makeRequest<MBDUserFeedResponse>('/users/feed/for-channel', body);
    }

    /**
     * Get users for an item
     */
    async getUsersForItem(itemId: string, eventType: EventType, options: any = {}): Promise<MBDUserFeedResponse> {
        const body = {
            item_id: itemId,
            event_type: eventType,
            ...options
        };

        return this.makeRequest<MBDUserFeedResponse>('/users/feed/for-item', body);
    }

    /**
     * Get users for a topic
     */
    async getUsersForTopic(topic: string, eventType: EventType, options: any = {}): Promise<MBDUserFeedResponse> {
        const body = {
            topic,
            event_type: eventType,
            ...options
        };

        return this.makeRequest<MBDUserFeedResponse>('/users/feed/for-topic', body);
    }

    /**
     * Helper method to format cast response to readable text
     */
    formatCastsResponse(response: MBDCastFeedResponse): string {
        if (!response.success || !response.data || response.data.length === 0) {
            return "No results found.";
        }

        let result = "### Casts on Farcaster\n\n";

        response.data.forEach((cast, index) => {
            const author = cast.author.display_name || cast.author.username;
            const timestamp = new Date(cast.timestamp).toLocaleString();

            result += `**${index + 1}. @${cast.author.username} (${author})**\n`;
            result += `${cast.text}\n`;

            if (cast.likes_count || cast.replies_count || cast.recasts_count) {
                result += `*${cast.likes_count || 0} likes • ${cast.replies_count || 0} reply • ${cast.recasts_count || 0} recasts*\n`;
            }

            result += `*Published in: ${timestamp}*\n\n`;
        });

        return result;
    }

    /**
     * Helper method to format user response to readable text
     */
    formatUsersResponse(response: MBDUserFeedResponse): string {
        if (!response.success || !response.data || response.data.length === 0) {
            return "No users found.";
        }

        let result = "### Farcaster Users\n\n";

        response.data.forEach((user, index) => {
            const name = user.display_name || user.username;

            result += `**${index + 1}. @${user.username} (${name})**\n`;

            if (user.bio) {
                result += `${user.bio}\n`;
            }

            if (user.followers_count || user.following_count) {
                result += `*${user.followers_count || 0} followers • ${user.following_count || 0} following*\n`;
            }

            if (user.score) {
                result += `*Score: ${user.score.toFixed(2)}*\n`;
            }

            result += '\n';
        });

        return result;
    }

    /**
     * Helper method to format label response to readable text
     */
    formatLabelsResponse(response: MBDLabelsResponse): string {
        if (!response.success || !response.data) {
            return "No labels found.";
        }

        let result = "### AI Labels for Content\n\n";

        Object.entries(response.data).forEach(([itemId, labels]) => {
            result += `**Item ID: ${itemId}**\n`;

            Object.entries(labels)
                .sort((a, b) => b[1] - a[1]) 
                .forEach(([label, value]) => {
                    result += `- ${label}: ${(value * 100).toFixed(1)}%\n`;
                });

            result += '\n';
        });

        return result;
    }
}