import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // 1. Look for the access token in cookies, OR check our internal fallback request header
  let accessToken =
    req.cookies.get("access_token")?.value ||
    req.headers.get("x-middleware-access-token");

  const refreshToken = req.cookies.get("refresh_token")?.value;
  const { pathname } = req.nextUrl;

  const authPages = ["/signin", "/signup", "/signup/form", "/signup/verifyemail"];
  const isAuthPage = authPages.includes(pathname);

  const protectedRoutes = ["/checkout", "/dashboard", "/payment-status"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  let tokenRefreshed = false;

  // 2. Handle Token Refreshing
  if (!accessToken && refreshToken) {
    try {
      const djangoRes = await fetch(
        "http://localhost:8000/api/a/token/refresh/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `refresh_token=${refreshToken}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
          cache: 'no-store'
        }
      );

      if (!djangoRes.ok) throw new Error("Django refresh token invalid.");

      const rawSetCookieHeader = djangoRes.headers.get("set-cookie");

      if (rawSetCookieHeader) {
        const match = rawSetCookieHeader.match(/access_token=([^;]+)/);
        if (match && match[1]) {
          accessToken = match[1];
          tokenRefreshed = true;
        }
      }
    } catch (error) {
      if (!isAuthPage) {
        const loginUrl = new URL("/signin", req.url);
        loginUrl.searchParams.set("next", pathname);
        const loginResponse = NextResponse.redirect(loginUrl);
        loginResponse.cookies.delete("access_token");
        loginResponse.cookies.delete("refresh_token");
        return loginResponse;
      }
    }
  }

  // 3. --- ROUTING GUARDS ---
  if (accessToken && isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL("/", req.url));
    if (tokenRefreshed) {
      redirectResponse.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });
    }
    return redirectResponse;
  }

  if (!accessToken && isProtectedRoute) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4. --- RESPONSE COMPILATION ---
  if (tokenRefreshed && accessToken) {
    const requestHeaders = new Headers(req.headers);

    // Synergize both cookie strings and a custom x-header fallback
    requestHeaders.set("cookie", `access_token=${accessToken}; ${req.headers.get("cookie") || ""}`);
    requestHeaders.set("x-middleware-access-token", accessToken);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Write to browser memory storage
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/signin",
    "/signup/:path*",
    "/dashboard/:path*",
  ],
};