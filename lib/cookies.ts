"use server";

import { cookies } from "next/headers";

const JIRA_EMAIL_COOKIE = "jira_email";
const JIRA_TOKEN_COOKIE = "jira_token";
const JIRA_DOMAIN_COOKIE = "jira_domain";

export interface JiraCredentials {
  email: string;
  token: string;
  domain: string;
}

export async function setJiraCredentials(credentials: JiraCredentials) {
  const cookieStore = await cookies();
  
  cookieStore.set(JIRA_EMAIL_COOKIE, credentials.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });
  
  cookieStore.set(JIRA_TOKEN_COOKIE, credentials.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });
  
  cookieStore.set(JIRA_DOMAIN_COOKIE, credentials.domain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });
}

export async function getJiraCredentials(): Promise<JiraCredentials | null> {
  const cookieStore = await cookies();
  
  const email = cookieStore.get(JIRA_EMAIL_COOKIE)?.value;
  const token = cookieStore.get(JIRA_TOKEN_COOKIE)?.value;
  const domain = cookieStore.get(JIRA_DOMAIN_COOKIE)?.value;
  
  if (!email || !token || !domain) {
    return null;
  }
  
  return { email, token, domain };
}

export async function clearJiraCredentials() {
  const cookieStore = await cookies();
  
  cookieStore.delete(JIRA_EMAIL_COOKIE);
  cookieStore.delete(JIRA_TOKEN_COOKIE);
  cookieStore.delete(JIRA_DOMAIN_COOKIE);
}

export async function encodeBasicAuth(email: string, token: string): Promise<string> {
  return Buffer.from(`${email}:${token}`).toString("base64");
}
