import { z } from 'zod';

export const environmentSchema = z.object({
    MBD_API_KEY: z.string().optional().describe('API key for MBD (Mind Blockchain Data)'),
    MBD_APP_NAME: z.string().optional().default('eliza_mbd_plugin').describe('Application name for MBD API identification'),
    MBD_APP_URL: z.string().optional().default('https://docs.mbd.xyz/').describe('Application URL for MBD API identification'),
    MBD_DEBUG: z.boolean().optional().default(false).describe('Enable debug mode for detailed logging'),
});

export type EnvironmentVariables = z.infer<typeof environmentSchema>;

export function validateEnvironment(runtime: any): EnvironmentVariables {
    const env = {
        MBD_API_KEY: runtime.getSetting('MBD_API_KEY'),
        MBD_APP_NAME: runtime.getSetting('MBD_APP_NAME'),
        MBD_APP_URL: runtime.getSetting('MBD_APP_URL'),
        MBD_DEBUG: runtime.getSetting('MBD_DEBUG') === 'true',
    };

    return environmentSchema.parse(env);
}