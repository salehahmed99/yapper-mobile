/**
 * Extracts error message from various error types
 * Handles Axios errors, Error objects, strings, and unknown error types
 * @param error - The error to extract message from
 * @returns The extracted error message
 */
export const extractErrorMessage = (error: unknown): string => {
  let message = 'Something went wrong';

  if (error instanceof Error) {
    // Check if it's an Axios error with response data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosError = error as any;
    if (axiosError.response?.data?.message) {
      // If message is an array, join it with commas
      if (Array.isArray(axiosError.response.data.message)) {
        message = axiosError.response.data.message.join(', ');
      } else {
        message = axiosError.response.data.message;
      }
    } else {
      message = error.message;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  return message;
};
