import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verifica se tem credenciais configuradas
  const hasEmail = request.cookies.has("jira_email");
  const hasToken = request.cookies.has("jira_token");
  
  const isConfigured = hasEmail && hasToken;
  const isConfigPage = request.nextUrl.pathname === "/config";
  
  // Se não está configurado e não está na página de config, redireciona
  if (!isConfigured && !isConfigPage) {
    return NextResponse.redirect(new URL("/config", request.url));
  }
  
  // Se está configurado e está na página de config, vai para home
  if (isConfigured && isConfigPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
