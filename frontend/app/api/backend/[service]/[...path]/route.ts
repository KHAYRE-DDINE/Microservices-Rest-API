import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend";

type RouteContext = {
  params: Promise<{
    service: string;
    path?: string[];
  }>;
};

export const dynamic = "force-dynamic";

export function GET(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}
