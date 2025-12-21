import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  // Protects all routes, including api/trpc routes
  // Please edit this to allow other routes to be public as needed.
  // We exclude:
  // - api/auth (NextAuth routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
