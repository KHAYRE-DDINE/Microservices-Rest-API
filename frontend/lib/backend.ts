import { NextRequest, NextResponse } from "next/server";

const serviceBases: Record<string, { env?: string; docker: string; local: string }> = {
  affiliate: {
    env: process.env.AFFILIATE_SERVICE_URL,
    docker: "http://affiliate-service:8081",
    local: "http://localhost:8081",
  },
  campaign: {
    env: process.env.CAMPAIGN_SERVICE_URL,
    docker: "http://campaign-service:8082",
    local: "http://localhost:8082",
  },
  conversion: {
    env: process.env.CONVERSION_SERVICE_URL,
    docker: "http://conversion-service:8083",
    local: "http://localhost:8083",
  },
  payment: {
    env: process.env.PAYMENT_SERVICE_URL,
    docker: "http://payment-gateway-service:8084",
    local: "http://localhost:8084",
  },
  product: {
    env: process.env.PRODUCT_SERVICE_URL,
    docker: "http://product-service:8085",
    local: "http://localhost:8085",
  },
};

type RouteContext = {
  params: Promise<{
    service: string;
    path?: string[];
  }>;
};

export async function proxyBackendRequest(request: NextRequest, context: RouteContext) {
  const { service, path = [] } = await context.params;
  const serviceBase = serviceBases[service];

  if (!serviceBase) {
    return NextResponse.json({ message: `Unknown backend service: ${service}` }, { status: 404 });
  }

  const baseCandidates = serviceBase.env ? [serviceBase.env] : [serviceBase.docker, serviceBase.local];

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("expect"); // Next.js undici fetch throws UND_ERR_NOT_SUPPORTED if expect header is present

  const isMutation = !["GET", "HEAD"].includes(request.method);
  const requestBody = isMutation ? await request.text() : undefined;
  // Give mutations (POST/PUT/DELETE) more time — Java services chain 3+ cross-service HTTP calls
  const timeoutMs = isMutation ? 30000 : 5000;

  for (const baseUrl of baseCandidates) {
    const upstreamUrl = new URL(path.join("/"), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    upstreamUrl.search = request.nextUrl.search;

    try {
      const response = await fetch(upstreamUrl, {
        method: request.method,
        headers,
        body: requestBody,
        signal: AbortSignal.timeout(timeoutMs),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return NextResponse.json(await response.json(), { status: response.status });
      }

      return new NextResponse(await response.text(), {
        status: response.status,
        headers: { "content-type": contentType || "text/plain" },
      });
    } catch (error) {
      console.error(`Failed to reach ${service} service at ${baseUrl}`, error);
    }
  }

  return NextResponse.json(
    { message: `${service} service is unavailable` },
    { status: 503 },
  );
}
