import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: '/login', // מפנה לדף הכניסה שלנו כשיש צורך
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login (login page)
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
