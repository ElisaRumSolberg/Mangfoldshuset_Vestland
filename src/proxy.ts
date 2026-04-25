import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOwnerOnlyPath, roleFromUser, utvalgIdFromUser } from "@/lib/roles";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/logg-inn";

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/logg-inn";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !isLoginRoute && user) {
    const role = roleFromUser(user);
    const pathname = request.nextUrl.pathname;

    if (role === "utvalg") {
      const utvalgId = utvalgIdFromUser(user);
      // Feilkonfigurert bruker (rolle satt uten utvalg_id) skal ikke få tilgang til noe.
      const allowedPath = utvalgId ? `/admin/utvalg/${utvalgId}` : null;
      if (pathname !== allowedPath) {
        const url = request.nextUrl.clone();
        url.pathname = allowedPath ?? "/";
        return NextResponse.redirect(url);
      }
    } else if (role === "editor" && isOwnerOnlyPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/aktiviteter";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
