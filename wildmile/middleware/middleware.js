// export function middleware(request) {
//   const currentUser = request.cookies.get("currentUser")?.value;
//   console.log("Middleware currentUser", currentUser);

//   if (currentUser && !request.nextUrl.pathname.startsWith("/dashboard")) {
//     return Response.redirect(new URL("/dashboard", request.url));
//   }

//   if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
//     return Response.redirect(new URL("/login", request.url));
//   }
// }

// export const config = {
//   //   matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
// };
