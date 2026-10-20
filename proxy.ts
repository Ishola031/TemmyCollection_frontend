import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {

    const { pathname } = req.nextUrl;

    /*
    |--------------------------------------------------------------------------
    | USER AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    let userAccessToken =
        req.cookies.get("access_token")?.value ||
        req.headers.get("x-middleware-access-token");

    const userRefreshToken =
        req.cookies.get("refresh_token")?.value;

    const userAuthPages = [
        "/signin",
        "/signup",
        "/signup/form",
        "/signup/verifyemail",
    ];

    const userProtectedRoutes = [
        "/checkout",
        "/dashboard",
        "/payment-status",
    ];

    const isUserAuthPage =
        userAuthPages.includes(pathname);

    const isUserProtectedRoute =
        userProtectedRoutes.some((route) =>
            pathname.startsWith(route)
        );

    /*
    |--------------------------------------------------------------------------
    | ADMIN AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    let adminAccessToken =
        req.cookies.get("admin_access_token")?.value;

    const adminRefreshToken =
        req.cookies.get("admin_refresh_token")?.value;

    const adminAuthPages = [
        "/admin/login",
    ];

    const adminProtectedRoutes = [
        "/admin/dashboard",
        "/admin/users",
        "/admin/products",
        "/admin/orders",
        "/admin/customers",
        "/admin/messages",
        "/admin/notifications",
        "/admin/settings",
    ];

    const isAdminAuthPage =
        adminAuthPages.includes(pathname);

    const isAdminProtectedRoute =
        adminProtectedRoutes.some((route) =>
            pathname.startsWith(route)
        );

    /*
    |--------------------------------------------------------------------------
    | ADMIN TOKEN REFRESH
    |--------------------------------------------------------------------------
    */

    let adminTokenRefreshed = false;

    if (!adminAccessToken && adminRefreshToken) {

        try {

            const djangoRes = await fetch(
                "http://localhost:8000/api/admin/refresh/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Cookie": `admin_refresh_token=${adminRefreshToken}`,
                    },

                    body: JSON.stringify({
                        refresh: adminRefreshToken,
                    }),

                    cache: "no-store",
                }
            );

            if (!djangoRes.ok) {
                throw new Error(
                    "Admin refresh token invalid."
                );
            }

            const rawSetCookieHeader =
                djangoRes.headers.get("set-cookie");

            if (rawSetCookieHeader) {

                const match =
                    rawSetCookieHeader.match(
                        /access_token=([^;]+)/
                    );

                if (match && match[1]) {

                    adminAccessToken = match[1];

                    adminTokenRefreshed = true;
                }
            }

        } catch (error) {

            if (isAdminProtectedRoute) {

                const loginUrl =
                    new URL("/admin/login", req.url);

                loginUrl.searchParams.set(
                    "next",
                    pathname
                );

                const loginResponse =
                    NextResponse.redirect(loginUrl);

                loginResponse.cookies.delete(
                    "admin_access_token"
                );

                loginResponse.cookies.delete(
                    "admin_refresh_token"
                );

                return loginResponse;
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | USER TOKEN REFRESH
    |--------------------------------------------------------------------------
    */

    let userTokenRefreshed = false;

    if (!userAccessToken && userRefreshToken) {

        try {

            const djangoRes = await fetch(
                "http://localhost:8000/api/a/token/refresh/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "Cookie":
                            `refresh_token=${userRefreshToken}`,
                    },

                    body: JSON.stringify({
                        refresh: userRefreshToken,
                    }),

                    cache: "no-store",
                }
            );

            if (!djangoRes.ok) {
                throw new Error(
                    "Django refresh token invalid."
                );
            }

            const rawSetCookieHeader =
                djangoRes.headers.get("set-cookie");

            if (rawSetCookieHeader) {

                const match =
                    rawSetCookieHeader.match(
                        /access_token=([^;]+)/
                    );

                if (match && match[1]) {

                    userAccessToken = match[1];

                    userTokenRefreshed = true;
                }
            }

        } catch (error) {

            if (isUserProtectedRoute) {

                const loginUrl =
                    new URL("/signin", req.url);

                loginUrl.searchParams.set(
                    "next",
                    pathname
                );

                const loginResponse =
                    NextResponse.redirect(loginUrl);

                loginResponse.cookies.delete(
                    "access_token"
                );

                loginResponse.cookies.delete(
                    "refresh_token"
                );

                return loginResponse;
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN ROUTE GUARD
    |--------------------------------------------------------------------------
    */

    if (isAdminProtectedRoute && !adminAccessToken) {

        const loginUrl =
            new URL("/admin/login", req.url);

        loginUrl.searchParams.set(
            "next",
            pathname
        );

        return NextResponse.redirect(loginUrl);
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN LOGIN PAGE
    |--------------------------------------------------------------------------
    */

    if (isAdminAuthPage && adminAccessToken) {

        return NextResponse.redirect(
            new URL(
                "/admin/dashboard",
                req.url
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | USER PROTECTED ROUTES
    |--------------------------------------------------------------------------
    */

    if (isUserProtectedRoute && !userAccessToken) {

        const loginUrl =
            new URL("/signin", req.url);

        loginUrl.searchParams.set(
            "next",
            pathname
        );

        return NextResponse.redirect(loginUrl);
    }

    /*
    |--------------------------------------------------------------------------
    | USER AUTH PAGES
    |--------------------------------------------------------------------------
    */

    if (userAccessToken && isUserAuthPage) {

        return NextResponse.redirect(
            new URL("/", req.url)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    const requestHeaders =
        new Headers(req.headers);

    /*
    |--------------------------------------------------------------------------
    | USER REFRESHED TOKEN
    |--------------------------------------------------------------------------
    */

    if (userTokenRefreshed && userAccessToken) {

        requestHeaders.set(
            "x-middleware-access-token",
            userAccessToken
        );

        requestHeaders.set(
            "cookie",
            `access_token=${userAccessToken}; ${req.headers.get("cookie") || ""}`
        );

        const response =
            NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

        response.cookies.set(
            "access_token",
            userAccessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 15,
            }
        );

        return response;
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN REFRESHED TOKEN
    |--------------------------------------------------------------------------
    */

    if (adminTokenRefreshed && adminAccessToken) {

        requestHeaders.set(
            "x-middleware-admin-access-token",
            adminAccessToken
        );

        const response =
            NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

        response.cookies.set(
            "admin_access_token",
            adminAccessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 15,
            }
        );

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/signin",
        "/signup/:path*",
        "/checkout/:path*",
        "/dashboard/:path*",
        "/payment-status/:path*",

        "/admin/login",
        "/admin/dashboard/:path*",
        "/admin/users/:path*",
        "/admin/products/:path*",
        "/admin/orders/:path*",
        "/admin/customers/:path*",
        "/admin/messages/:path*",
        "/admin/notifications/:path*",
        "/admin/settings/:path*",
    ],
};