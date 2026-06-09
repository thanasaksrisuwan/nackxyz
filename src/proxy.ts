import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // Protect /admin and /dashboard
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/dashboard")) {
    const authorization = request.headers.get("Authorization");

    if (authorization) {
      try {
        const basicAuth = authorization.split(" ")[1];
        // Using atob for compatibility in Edge/Serverless runtimes
        const credentials = atob(basicAuth);
        const [username, password] = credentials.split(":");

        const expectedUsername = process.env.ADMIN_USERNAME || "admin";
        const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (username === expectedUsername && password === expectedPassword) {
          return NextResponse.next();
        }
      } catch (e) {
        console.error("Basic auth parsing failed", e);
      }
    }

    return new NextResponse("Authentication Required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
