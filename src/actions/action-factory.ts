import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    elizaLogger,
    type ActionExample
} from "@elizaos/core";

import { formatErrorResponse } from "../utils/formatters";
import { MBDFarcasterService } from "../services/mbd.service";

export interface ActionConfig {
    name: string;
    similes: string[];
    description: string;
    examples: ActionExample[][];
    validateFn?: (runtime: IAgentRuntime, message: Memory) => Promise<boolean>;
}

export type ActionHandler<T> = (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: T,
    callback?: HandlerCallback,
    service?: MBDFarcasterService
) => Promise<boolean>;

/**
 * Factory function to create actions with common behavior
 */
export function createAction<T>(
    config: ActionConfig,
    handler: ActionHandler<T>
): Action {
    return {
        name: config.name,
        similes: config.similes,
        description: config.description,
        validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
            // Run custom validation if provided
            if (config.validateFn) {
                return config.validateFn(runtime, message);
            }

            // Check if API key is configured (optional)
            const apiKey = runtime.getSetting("MBD_API_KEY");
            if (!apiKey) {
                elizaLogger.warn(`${config.name}: MBD_API_KEY not defined, plugin may operate with rate limitations`);
            }

            return true;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            options: any,
            callback?: HandlerCallback
        ): Promise<boolean> => {
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
                // Call the specific handler
                return await handler(runtime, message, state, options as T, callback, mbdService);
            } catch (error) {
                elizaLogger.error(`Error processing ${config.name}:`, error);

                if (callback) {
                    callback({
                        text: formatErrorResponse(error),
                        content: {
                            error: error instanceof Error ? error.message : String(error)
                        }
                    });
                }

                return false;
            }
        },
        examples: config.examples
    };
}