import * as Sentry from "@sentry/nextjs";

type LogMeta = Record<string, unknown>;

function stringifyMeta(meta?: LogMeta) {
  if (!meta) return "";
  try {
    return JSON.stringify(meta);
  } catch {
    return "[meta-unserializable]";
  }
}

export function logServerError(scope: string, error: unknown, meta?: LogMeta) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const formattedMeta = stringifyMeta(meta);

  console.error(`[SERVER_ERROR][${scope}] ${message} ${formattedMeta}`.trim());

  if (stack) {
    console.error(stack);
  }

  Sentry.withScope((sentryScope) => {
    sentryScope.setTag("scope", scope);

    if (meta) {
      sentryScope.setContext("meta", meta);
      if (typeof meta.requestId === "string") {
        sentryScope.setTag("requestId", meta.requestId);
      }
    }

    Sentry.captureException(error instanceof Error ? error : new Error(message));
  });
}

