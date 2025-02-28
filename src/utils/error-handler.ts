import { elizaLogger } from "@elizaos/core";
import { type MBDError } from "../types/common-types";

/**
 * Creates a structured error object from various error types
 */
export function createMBDError(error: unknown, context: string): MBDError {
    if (error instanceof Error) {
        const mbdError = error as MBDError;
        mbdError.context = context;
        return mbdError;
    }

    // Create a new error if the input isn't an Error object
    const newError = new Error(String(error)) as MBDError;
    newError.context = context;
    return newError;
}

/**
 * Log an error with appropriate context
 */
export function logError(error: unknown, context: string): void {
    const formattedError = createMBDError(error, context);
    elizaLogger.error(`Error in ${context}:`, formattedError);
}

/**
 * Handle API-specific errors
 */
export function handleApiError(error: unknown, endpoint: string): MBDError {
    // Convert to MBD error
    const mbdError = createMBDError(error, `API call to ${endpoint}`);

    // Log the error
    elizaLogger.error(`API error for ${endpoint}:`, mbdError);

    // Add API-specific context if missing
    if (!mbdError.status) {
        if (error instanceof TypeError && String(error).includes('fetch')) {
            mbdError.status = 0;
            mbdError.message = `Network error: Could not connect to MBD API - ${mbdError.message}`;
        }
    }

    return mbdError;
}

/**
 * Validate required parameters and throw standardized errors if missing
 */
export function validateRequiredParams(
    params: Record<string, any>,
    requiredFields: string[],
    context: string
): void {
    const missingFields = requiredFields.filter(field => !params[field]);

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required parameters: ${missingFields.join(', ')}`
        ) as MBDError;

        error.context = context;
        throw error;
    }
}