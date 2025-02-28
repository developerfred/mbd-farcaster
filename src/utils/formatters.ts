import type  {
    MBDCastFeedResponse,
    MBDUserFeedResponse,
    MBDLabelsResponse,
    MBDTextLabelsResponse
} from '../types/mbd-types';

/**
 * Format cast response data into readable text
 */
export function formatCastsResponse(response: MBDCastFeedResponse): string {
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
            const likes = cast.likes_count || 0;
            const replies = cast.replies_count || 0;
            const recasts = cast.recasts_count || 0;
            result += `*${likes} likes • ${replies} ${replies === 1 ? 'reply' : 'replies'} • ${recasts} recasts*\n`;
        }

        result += `*Published in: ${timestamp}*\n\n`;
    });

    // Add pagination info if available
    if (response.pagination) {
        const { total, page_size, page_number } = response.pagination;
        const totalPages = Math.ceil(total / page_size);
        result += `Page ${page_number} of ${totalPages} (${total} total results)\n`;
    }

    return result;
}

/**
 * Format user response data into readable text
 */
export function formatUsersResponse(response: MBDUserFeedResponse): string {
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

        if (user.followers_count !== undefined || user.following_count !== undefined) {
            const followers = user.followers_count || 0;
            const following = user.following_count || 0;
            result += `*${followers} followers • ${following} following*\n`;
        }

        if (user.score !== undefined) {
            result += `*Score: ${user.score.toFixed(2)}*\n`;
        }

        result += '\n';
    });

    // Add pagination info if available
    if (response.pagination) {
        const { total, page_size, page_number } = response.pagination;
        const totalPages = Math.ceil(total / page_size);
        result += `Page ${page_number} of ${totalPages} (${total} total results)\n`;
    }

    return result;
}

/**
 * Format label response data into readable text
 */
export function formatLabelsResponse(response: MBDLabelsResponse): string {
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

/**
 * Format text labels response data into readable text
 */
export function formatTextLabelsResponse(response: MBDTextLabelsResponse, textInputs: string[]): string {
    if (!response.success || !response.data) {
        return "No analysis results available.";
    }

    let result = "### AI Labels for Texts\n\n";

    Object.entries(response.data).forEach(([index, labels]) => {
        const textIndex = parseInt(index);
        const text = textInputs[textIndex];

        if (text) {
            result += `**Text ${textIndex + 1}**: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"\n`;

            Object.entries(labels)
                .sort((a, b) => b[1] - a[1])
                .forEach(([label, value]) => {
                    result += `- ${label}: ${(value * 100).toFixed(1)}%\n`;
                });

            result += '\n';
        }
    });

    return result;
}

/**
 * Format error messages into a user-friendly format
 */
export function formatErrorResponse(error: unknown): string {
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }

    return `An unexpected error occurred: ${String(error)}`;
}