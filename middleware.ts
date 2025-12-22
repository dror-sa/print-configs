import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl // הוספנו את host

  console.log(`[Middleware] Path: ${pathname}, Host: ${host}`)

  // 1. החרגה עבור localhost - מאפשר עבודה מקומית ללא אימות
  if (host.includes("localhost")) {
    console.log(`[Middleware] Skipping auth check for localhost`)
    return NextResponse.next()
  }

  // 2. נתיבים ציבוריים שתמיד מותרים
  if (
    pathname.startsWith("/_next") || // קבצי מערכת
    pathname.startsWith("/api/auth") || // נתיבי אימות
    pathname === "/login" || // דף הכניסה
    pathname === "/favicon.ico" || // אייקון
    pathname.startsWith("/api/drivers/lookup") // <--- הוספנו את הנתיב הזה
  ) {
    console.log(`[Middleware] Skipping auth check for public path: ${pathname}`)
    return NextResponse.next()
  }

  // 3. בדיקה אם המשתמש מחובר
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  console.log(`[Middleware] Token status for ${pathname}:`, token ? "Found" : "Missing")

  // 4. אם לא מחובר - הפניה לדף הכניסה
  if (!token) {
    console.log(`[Middleware] Redirecting to login from: ${pathname}`)
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // 5. אם מחובר - המשך כרגיל
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
