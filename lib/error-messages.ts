/**
 * Maps HTTP error codes and common errors to user-friendly messages
 */
export const ERROR_MESSAGES: Record<number | string, string> = {
  // Client Errors (4xx)
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found. Please try again.',
  405: 'This action is not allowed. Please try a different approach.',
  408: 'Request timed out. Your connection took too long. Please try again.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  410: 'The requested resource is no longer available.',
  413: 'The file or image you uploaded is too large. Please try a smaller file.',
  414: 'The URL is too long. Please shorten your input and try again.',
  415: 'The file format is not supported. Please use a different format.',
  429: 'Too many requests. Please wait a moment and try again.',

  // Server Errors (5xx)
  500: 'Something went wrong on our server. Please try again in a moment.',
  501: 'This feature is not yet available.',
  502: 'Bad Gateway. The server is temporarily unavailable. Please try again.',
  503: 'The service is currently unavailable. Please try again later.',
  504: 'The server took too long to respond. Please try again.',

  // Common API Errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection and try again.',
  TIMEOUT: 'The request took too long. Please check your connection and try again.',
  INVALID_JSON: 'Failed to process the response. Please try again.',
  MISSING_CREDENTIALS: 'Authentication failed. Please log in again.',
  INVALID_IMAGE: 'The image could not be processed. Please try uploading a clear image of a food product.',
  ANALYSIS_FAILED: 'Could not analyze the food image. Please try with a different image.',
  CALCULATION_FAILED: 'Failed to calculate nutrition information. Please try again.',
  SAVE_FAILED: 'Could not save your scan. Please check your connection and try again.',
  SUPABASE_ERROR: 'Database error. Please try again or contact support if the issue persists.',
  API_ERROR: 'API error. Please try again.',
}

/**
 * Parse error response and return user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Response) {
    const status = error.status
    return ERROR_MESSAGES[status] || ERROR_MESSAGES[500]
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT
    }
    if (message.includes('json')) {
      return ERROR_MESSAGES.INVALID_JSON
    }
    if (message.includes('401') || message.includes('unauthorized')) {
      return ERROR_MESSAGES[401]
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return ERROR_MESSAGES[403]
    }
    if (message.includes('image')) {
      return ERROR_MESSAGES.INVALID_IMAGE
    }
    if (message.includes('analyze')) {
      return ERROR_MESSAGES.ANALYSIS_FAILED
    }
    if (message.includes('nutrition')) {
      return ERROR_MESSAGES.CALCULATION_FAILED
    }
    if (message.includes('save') || message.includes('insert')) {
      return ERROR_MESSAGES.SAVE_FAILED
    }
    if (message.includes('supabase') || message.includes('database')) {
      return ERROR_MESSAGES.SUPABASE_ERROR
    }

    // Return the error message if it's already user-friendly
    if (message.length < 100 && !message.includes('error:')) {
      return error.message
    }
  }

  if (typeof error === 'string') {
    return error.length < 150 ? error : ERROR_MESSAGES[500]
  }

  return ERROR_MESSAGES[500]
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      
      // Handle different error response formats
      if (data.error?.message) {
        return data.error.message
      }
      if (data.message) {
        return data.message
      }
      if (data.detail) {
        return data.detail
      }
      if (data.error) {
        return typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
      }
    } else {
      const text = await response.text()
      if (text) {
        return text
      }
    }
  } catch (e) {
    // If parsing fails, fall back to status code
  }

  return ERROR_MESSAGES[response.status] || ERROR_MESSAGES[500]
}
