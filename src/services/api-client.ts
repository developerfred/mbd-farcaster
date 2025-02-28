import { elizaLogger } from "@elizaos/core";
import type { MBDEnvironment, MBDError } from "../types/common-types";

/**
 * API Client for making requests to the MBD API
 */
export class ApiClient {
    private baseUrl: string;
    private headers: Record<string, string>;
    private debug: boolean;

    /**
     * Create a new API client
     * @param baseUrl Base URL for the API
     * @param env Environment configuration
     */
    constructor(baseUrl: string, env: MBDEnvironment) {
        this.baseUrl = baseUrl;
        this.debug = env.debug;

        // Set up headers
        this.headers = {
            'content-type': 'application/json',
            'accept': 'application/json',
            'HTTP-Referer': env.appUrl,
            'X-Title': env.appName,
        };

        // Add API key if available
        if (env.apiKey) {
            this.headers['Authorization'] = `Bearer ${env.apiKey}`;
        }

        if (this.debug) {
            elizaLogger.debug("MBD API Client initialized with:", {
                baseUrl: this.baseUrl,
                appName: env.appName,
                appUrl: env.appUrl,
                hasApiKey: !!env.apiKey
            });
        }
    }

    /**
     * Make a POST request to the API
     * @param endpoint API endpoint
     * @param body Request body
     * @returns Response data
     */
    async post<T>(endpoint: string, body: Record<string, any>): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        if (this.debug) {
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
                const error = new Error(`MBD API error (${response.status}): ${errorText}`) as MBDError;
                error.status = response.status;
                error.context = endpoint;
                throw error;
            }

            const data = await response.json();

            if (this.debug) {
                elizaLogger.debug(`Response from ${endpoint}:`, data);
            }

            return data as T;
        } catch (error) {
            if (error instanceof Error) {
                elizaLogger.error(`Error calling MBD API at ${endpoint}:`, error);

                // Enhance error with context if it's not already an MBDError
                if (!('status' in error)) {
                    const mbdError = error as MBDError;
                    mbdError.context = endpoint;
                    throw mbdError;
                }
            }

            // Re-throw original error
            throw error;
        }
    }
}