import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. נתיבים ציבוריים שתמיד מותרים
  if (
    pathname.startsWith("/_next") || // קבצי מערכת
    pathname.startsWith("/api/auth") || // נתיבי אימות
    pathname === "/login" || // דף הכניסה
    pathname === "/favicon.ico" // אייקון
  ) {
    return NextResponse.next()
  }

  // 2. בדיקה אם המשתמש מחובר
  const token = await getToken({ req: request })

  // 3. אם לא מחובר - הפניה לדף הכניסה
  if (!token) {
    const url = new URL("/login", request.url)
    // שומרים את הדף המקורי כדי לחזור אליו אחרי הכניסה
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // 4. אם מחובר - המשך כרגיל
  return NextResponse.next()
}

export const config = {
  // חייבים matcher כדי שה-middleware ירוץ
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
