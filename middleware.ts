export { default } from "next-auth/middleware"

export const config = {
  // Protect all routes except static files and auth api
  matcher: ["/((?!api/auth|favicon.ico).*)"],
}

