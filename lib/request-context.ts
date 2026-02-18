import { headers } from "next/headers";

export type RequestContext = {
  requestId: string;
  ip: string;
};

function randomId() {
  return crypto.randomUUID();
}

export async function getRequestContext(): Promise<RequestContext> {
  try {
    const requestHeaders = await headers();
    const requestId = requestHeaders.get("x-request-id") ?? randomId();
    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";

    return {
      requestId,
      ip,
    };
  } catch {
    return {
      requestId: randomId(),
      ip: "unknown",
    };
  }
}

