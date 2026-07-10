'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { apiErrorMessageKey, toApiError } from '@/lib/api-error';

/**
 * Centralized, localized handling for API failures. Normalizes any thrown value
 * into a typed ApiError, maps it to a stable `errors.api.*` translation key, and
 * exposes helpers to resolve or toast the localized message. Use this instead of
 * surfacing raw backend text (which may be untranslated or leak server details).
 */
export function useApiError() {
  const t = useTranslations('errors.api');

  const getErrorMessage = (error: unknown): string =>
    t(apiErrorMessageKey(toApiError(error)));

  const toastError = (error: unknown): void => {
    toast.error(getErrorMessage(error));
  };

  return { getErrorMessage, toastError };
}
