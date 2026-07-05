import { api } from "@/lib/axios";
import { AxiosRequestConfig } from "axios";
import { z } from "zod";

// 1. The Types (from your snippet)
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string | null;
    data: T;
}

export async function fetchFromApi<T>(
    url: string,
    schema?: z.ZodType<T>,
    config?: AxiosRequestConfig
): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, config);
    const json = response.data;

    if (json.status === 'error') {
        throw new Error(json.message || "Unknown API Error");
    }

    if (schema) {
        const validation = schema.safeParse(json.data);
        if (!validation.success) {
            console.error("Validation errors:", validation.error);
            throw new Error("Data validation failed from backend.");
        }
        return validation.data;
    }

    return json.data;
}

export async function postToApi<TResponse, TBody>(
    url: string,
    body: TBody,
    schema?: z.ZodType<TResponse>,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const response = await api.post<ApiResponse<TResponse>>(url, body, config);

    if (response.data.status === 'error') {
        throw new Error(response.data.message || "Submission failed");
    }

    if (schema) {
        const validation = schema.safeParse(response.data.data);
        if (!validation.success) {
            console.error("Validation errors:", validation.error);
            throw new Error("Data validation failed from backend.");
        }
        return validation.data;
    }

    return response.data.data;
}

export async function putToApi<TResponse, TBody>(
    url: string,
    body: TBody,
    schema?: z.ZodType<TResponse>,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const response = await api.put<ApiResponse<TResponse>>(url, body, config);

    if (response.data.status === 'error') {
        throw new Error(response.data.message || "Update failed");
    }

    if (schema) {
        const validation = schema.safeParse(response.data.data);
        if (!validation.success) {
            throw new Error("Data validation failed from backend.");
        }
        return validation.data;
    }

    return response.data.data;
}

export async function deleteFromApi(
    url: string,
    config?: AxiosRequestConfig
): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(url, config);

    if (response.data.status === 'error') {
        throw new Error(response.data.message || "Delete failed");
    }
}

export async function patchToApi<TResponse, TBody>(
    url: string,
    body: TBody,
    schema?: z.ZodType<TResponse>,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const response = await api.patch<ApiResponse<TResponse>>(url, body, config);

    if (response.data.status === 'error') {
        throw new Error(response.data.message || "Update failed");
    }

    if (schema) {
        const validation = schema.safeParse(response.data.data);
        if (!validation.success) {
            console.error("Validation errors:", validation.error);
            throw new Error("Data validation failed from backend.");
        }
        return validation.data;
    }

    return response.data.data;
}