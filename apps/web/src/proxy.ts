// proxy.ts
import { auth } from "@sagentong/auth"; // Your Better Auth instance
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  console.log("hit");
  // 1. Fetch the session using Better Auth's API
  // Note: Better Auth provides a helper for this in proxy/middleware
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // 2. Define your protection logic
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/settings");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 3. Use matchers to optimize performance
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/register"],
};
