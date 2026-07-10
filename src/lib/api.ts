import { api } from "@/lib/axios";
import { AxiosRequestConfig } from "axios";
import { z } from "zod";
import { ApiError, ApiEnvelope, apiErrorFromEnvelope, API_ERROR_CODES } from "@/lib/api-error";

/** @deprecated Use ApiEnvelope from "@/lib/api-error". Kept for backward compat. */
export type ApiResponse<T> = ApiEnvelope<T>;

/** Throws an ApiError if the envelope is an error; otherwise returns the payload. */
function unwrap<T>(envelope: ApiEnvelope<T>, fallbackMessage: string): T {
    if (envelope.status === "error") {
        throw apiErrorFromEnvelope(envelope, fallbackMessage);
    }
    return envelope.data;
}

/** Validates a payload against a schema (if provided), throwing a typed ApiError on failure. */
function validate<T>(data: unknown, schema?: z.ZodType<T>): T {
    if (!schema) return data as T;

    const result = schema.safeParse(data);
    if (!result.success) {
        console.error("Validation errors:", result.error);
        throw new ApiError({
            message: "Data validation failed from backend.",
            code: API_ERROR_CODES.VALIDATION_FAILED,
            details: result.error.issues,
        });
    }
    return result.data;
}

export async function fetchFromApi<T>(
    url: string,
    schema?: z.ZodType<T>,
    config?: AxiosRequestConfig
): Promise<T> {
    const response = await api.get<ApiEnvelope<T>>(url, config);
    const data = unwrap(response.data, "Unknown API Error");
    return validate(data, schema);
}

export async function postToApi<TResponse, TBody>(
    url: string,
    body: TBody,
    schema?: z.ZodType<TResponse>,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const response = await api.post<ApiEnvelope<TResponse>>(url, body, config);
    const data = unwrap(response.data, "Submission failed");
    return validate(data, schema);
}

export async function putToApi<TResponse, TBody>(
    url: string,
    body: TBody,
    schema?: z.ZodType<TResponse>,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const response = await api.put<ApiEnvelope<TResponse>>(url, body, config);
    const data = unwrap(response.data, "Update failed");
    return validate(data, schema);
}

export async function deleteFromApi(
    url: string,
    config?: AxiosRequestConfig
): Promise<void> {
    const response = await api.delete<ApiEnvelope<null>>(url, config);
    unwrap(response.data, "Delete failed");
}

export async function patchToApi<TResponse, TBody>(
    url: string,
    body: TBody,
    schema?: z.ZodType<TResponse>,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const response = await api.patch<ApiEnvelope<TResponse>>(url, body, config);
    const data = unwrap(response.data, "Update failed");
    return validate(data, schema);
}
