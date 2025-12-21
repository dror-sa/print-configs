import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`[Middleware] Path: ${pathname}`)

  // 1. נתיבים ציבוריים שתמיד מותרים
  if (
    pathname.startsWith("/_next") || // קבצי מערכת
    pathname.startsWith("/api/auth") || // נתיבי אימות
    pathname === "/login" || // דף הכניסה
    pathname === "/favicon.ico" // אייקון
  ) {
    console.log(`[Middleware] Skipping auth check for public path: ${pathname}`)
    return NextResponse.next()
  }

  // 2. בדיקה אם המשתמש מחובר
  // אנחנו מעבירים את ה-secret במפורש ליתר ביטחון
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  console.log(`[Middleware] Token status for ${pathname}:`, token ? "Found" : "Missing")

  // 3. אם לא מחובר - הפניה לדף הכניסה
  if (!token) {
    console.log(`[Middleware] Redirecting to login from: ${pathname}`)
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // 4. אם מחובר - המשך כרגיל
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
