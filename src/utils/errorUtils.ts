import { ApiError } from '@/services/api';

export interface ParsedApiError {
  formError: string;
  fieldErrors: Record<string, string>;
}

interface ParseApiErrorOptions {
  /**
   * Maps backend field identifiers to one or more frontend field names.
   * Useful for mapping compound fields like `credentials` to both
   * `email` and `password` inputs.
   */
  fieldMap?: Record<string, string[]>;
  defaultMessage?: string;
}

const friendlyMessage = (rawMessage: string | undefined, statusCode?: number): string => {
  if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
    if (statusCode === 0) {
      return 'Unable to reach the server. Please check your connection and try again.';
    }
    return '';
  }

  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('invalid email or password') || normalized.includes('invalid credentials')) {
    return 'The email or password you entered is incorrect. Please try again.';
  }

  if (normalized.includes('account is') && normalized.includes('support')) {
    return rawMessage;
  }

  if (normalized.includes('email') && normalized.includes('already')) {
    return 'This email is already linked to an existing account. Please sign in or use a different email address.';
  }

  if (normalized.includes('phone') && normalized.includes('already')) {
    return 'This phone number is already linked to an existing account. Please use a different phone number.';
  }

  if (normalized.includes('password is required')) {
    return 'Password is required.';
  }

  if (normalized.includes('please provide a valid email')) {
    return 'Enter a valid email address.';
  }

  if (normalized.includes('failed to fetch') || normalized.includes('unable to connect')) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  return rawMessage;
};

const applyFieldMessage = (
  fieldErrors: Record<string, string>,
  fieldKey: string,
  message: string,
  fieldMap?: Record<string, string[]>
) => {
  if (!message) {
    return;
  }

  const mappedFields = fieldMap?.[fieldKey] ?? [fieldKey];
  for (const fieldName of mappedFields) {
    fieldErrors[fieldName] = message;
  }
};

export const parseApiError = (
  error: unknown,
  options: ParseApiErrorOptions = {}
): ParsedApiError => {
  const defaultMessage = options.defaultMessage ?? 'Something went wrong. Please try again.';
  const fieldErrors: Record<string, string> = {};
  let formError = defaultMessage;

  if (error instanceof ApiError) {
    const { statusCode, response } = error;
    const serverMessage = friendlyMessage(
      typeof response?.message === 'string' ? response.message : error.message,
      statusCode
    );

    formError = serverMessage || defaultMessage;

    const responseField = response?.field as string | undefined;
    if (responseField) {
      applyFieldMessage(fieldErrors, responseField, formError, options.fieldMap);
    }

    const validationErrors = Array.isArray(response?.errors) ? response.errors : [];
    for (const err of validationErrors) {
      const path = err?.path ?? err?.param;
      const msg = friendlyMessage(err?.msg ?? '', statusCode) || defaultMessage;
      if (path) {
        applyFieldMessage(fieldErrors, path, msg, options.fieldMap);
      }
    }

    if (statusCode === 401 && Object.keys(fieldErrors).length === 0) {
      const unauthorizedMessage = friendlyMessage(
        serverMessage || 'Invalid email or password',
        statusCode
      ) || 'Invalid email or password';
      applyFieldMessage(fieldErrors, 'credentials', unauthorizedMessage, options.fieldMap);
      formError = unauthorizedMessage;
    }

    if (statusCode === 0) {
      formError = friendlyMessage(serverMessage, statusCode) || defaultMessage;
    }
  } else if (error instanceof Error) {
    formError = friendlyMessage(error.message, undefined) || error.message || defaultMessage;
  }

  if (Object.keys(fieldErrors).length > 0) {
    const hasSpecificMessage = formError && formError !== defaultMessage;
    if (!hasSpecificMessage) {
      formError = 'Please fix the highlighted fields.';
    }
  }

  return {
    formError,
    fieldErrors
  };
};
