import { type IAgentRuntime, elizaLogger } from "@elizaos/core";
import { z } from 'zod';
import { type  MBDEnvironment } from './types/common-types';

/**
 * Schema for validating environment variables
 */
export const environmentSchema = z.object({
    MBD_API_KEY: z.string().optional().describe('API key for MBD (Mind Blockchain Data)'),
    MBD_APP_NAME: z.string().optional().default('eliza_mbd_plugin').describe('Application name for MBD API identification'),
    MBD_APP_URL: z.string().optional().default('https://docs.mbd.xyz/').describe('Application URL for MBD API identification'),
    MBD_DEBUG: z.preprocess(
        (val) => val === true || val === 'true',
        z.boolean().default(false)
    ).describe('Enable debug mode for detailed logging'),
});

/**
 * Gets and validates environment configuration from runtime settings
 */
export function validateEnvironment(runtime: IAgentRuntime): MBDEnvironment {
    try {
        const env = {
            apiKey: runtime.getSetting('MBD_API_KEY'),
            appName: runtime.getSetting('MBD_APP_NAME') || 'eliza_mbd_plugin',
            appUrl: runtime.getSetting('MBD_APP_URL') || 'https://docs.mbd.xyz/',
            debug: runtime.getSetting('MBD_DEBUG') === 'true',
        };

        // Parse and validate with zod schema
        const validatedEnv = environmentSchema.parse({
            MBD_API_KEY: env.apiKey,
            MBD_APP_NAME: env.appName,
            MBD_APP_URL: env.appUrl,
            MBD_DEBUG: env.debug,
        });

        // Return in the format expected by our application
        return {
            apiKey: validatedEnv.MBD_API_KEY,
            appName: validatedEnv.MBD_APP_NAME,
            appUrl: validatedEnv.MBD_APP_URL,
            debug: validatedEnv.MBD_DEBUG,
        };
    } catch (error) {
        // If validation fails, log error and return defaults
        elizaLogger.error("Environment validation error:", error);

        return {
            appName: 'eliza_mbd_plugin',
            appUrl: 'https://docs.mbd.xyz/',
            debug: false
        };
    }
}