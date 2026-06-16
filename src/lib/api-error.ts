export function apiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  const message = error.message;

  if (message.includes("JWT_SECRET is not set")) {
    return "Server misconfigured: JWT_SECRET is missing.";
  }

  if (
    message.includes("Can't reach database") ||
    message.includes("Error querying the database") ||
    message.includes("P1001") ||
    message.includes("P1000") ||
    message.includes("P1012") ||
    message.includes("invalid domain character")
  ) {
    return "Database connection failed. Check DATABASE_URL on the server.";
  }

  if (message.includes("provider") && message.includes("postgresql")) {
    return "Database provider mismatch. Redeploy after setting a PostgreSQL DATABASE_URL.";
  }

  if (process.env.NODE_ENV === "development") {
    return message;
  }

  return fallback;
}
