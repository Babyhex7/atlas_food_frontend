/**
 * Extracts the backend-provided error message from an Axios error response
 * (`{ status: "error", error: { code, message } }`), falling back to a
 * generic message when the error doesn't carry that shape (network error,
 * timeout, etc).
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "error" in err.response.data &&
    err.response.data.error &&
    typeof err.response.data.error === "object" &&
    "message" in err.response.data.error
  ) {
    return String(err.response.data.error.message);
  }
  return fallback;
}
