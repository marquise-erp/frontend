import { AxiosError } from "axios";

/**
 * Envelope returned by the backend for every response (success or error).
 * On error, `data` is null and `error_code` is a stable machine-readable code.
 */
export interface ApiEnvelope<T> {
  status: "success" | "error";
  message: string | null;
  data: T;
  error_code?: string | null;
}

/**
 * Stable, machine-readable error codes returned by the backend in `error_code`.
 * Branch on these instead of matching on `message` (which is localized and may change).
 * Add new codes here as the backend introduces them.
 */
export const API_ERROR_CODES = {
  PENDING_INVITATION_EXISTS: "PENDING_INVITATION_EXISTS",
  // Client-side sentinels (never sent by the backend):
  VALIDATION_FAILED: "CLIENT_VALIDATION_FAILED",
  NETWORK: "CLIENT_NETWORK_ERROR",
  UNKNOWN: "CLIENT_UNKNOWN_ERROR",
} as const;

export type ApiErrorCode =
  | (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
  | (string & {});

/**
 * Single error type thrown by the API layer. Carries the backend's
 * machine-readable `code` so any caller can branch on it reliably.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode | null;
  readonly httpStatus: number | null;
  readonly details: unknown;

  constructor(params: {
    message: string;
    code?: ApiErrorCode | null;
    httpStatus?: number | null;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code ?? null;
    this.httpStatus = params.httpStatus ?? null;
    this.details = params.details ?? null;
    // Restore prototype chain (required when targeting ES5/extending built-ins).
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/**
 * Stable translation keys under the `errors.api` namespace in the message
 * catalogs. Callers translate these instead of surfacing raw backend text.
 */
export type ApiErrorMessageKey =
  | "unauthorized"
  | "notFound"
  | "validation"
  | "conflict"
  | "network"
  | "server"
  | "unknown";

/**
 * Known backend messages that unambiguously signal an authorization failure.
 * Some backends return these with a generic error_code/httpStatus (e.g.
 * INTERNAL_SERVER_ERROR), so we match them as a safety net. Keep this list
 * small and exact; prefer branching on `code`/`httpStatus` when possible.
 */
const UNAUTHORIZED_MESSAGES = new Set([
  "This action is unauthorized.",
  "Unauthenticated.",
  "User does not have the right permissions.",
]);

/**
 * Map a normalized ApiError to a stable translation key. Branches on
 * machine-readable signals (code, then httpStatus) with a message allowlist
 * as a fallback, so the UI never has to interpret localized backend text.
 */
export function apiErrorMessageKey(error: ApiError): ApiErrorMessageKey {
  if (error.code === API_ERROR_CODES.NETWORK) return "network";
  if (error.code === API_ERROR_CODES.VALIDATION_FAILED) return "validation";

  if (error.message && UNAUTHORIZED_MESSAGES.has(error.message.trim())) {
    return "unauthorized";
  }

  switch (error.httpStatus) {
    case 401:
    case 403:
      return "unauthorized";
    case 404:
      return "notFound";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    default:
      if (error.httpStatus != null && error.httpStatus >= 500) return "server";
      return "unknown";
  }
}

/** Build an ApiError from a backend error envelope (HTTP 2xx with status: "error"). */
export function apiErrorFromEnvelope<T>(
  envelope: ApiEnvelope<T>,
  fallbackMessage: string,
  httpStatus: number | null = null,
): ApiError {
  return new ApiError({
    message: envelope.message || fallbackMessage,
    code: envelope.error_code ?? null,
    httpStatus,
    details: envelope.data,
  });
}

/** Normalize any thrown value (AxiosError, ApiError, unknown) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof AxiosError) {
    const envelope = error.response?.data as ApiEnvelope<unknown> | undefined;
    const httpStatus = error.response?.status ?? null;

    if (envelope && typeof envelope === "object" && "status" in envelope) {
      return apiErrorFromEnvelope(envelope, error.message, httpStatus);
    }

    if (error.response == null) {
      return new ApiError({
        message: error.message || "Network error",
        code: API_ERROR_CODES.NETWORK,
        httpStatus: null,
      });
    }

    return new ApiError({
      message: error.message || "Request failed",
      code: API_ERROR_CODES.UNKNOWN,
      httpStatus,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : "Unknown error",
    code: API_ERROR_CODES.UNKNOWN,
  });
}
