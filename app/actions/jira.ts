"use server";

import { getJiraCredentials, encodeBasicAuth } from "@/lib/cookies";
import { cache } from "react";

// Constante para o campo de link de épico (evita hardcoding)
const EPIC_LINK_FIELD = process.env.NEXT_PUBLIC_JIRA_EPIC_FIELD || "customfield_10014";

// Helper para escapar valores JQL (previne injeção)
function escapeJqlValue(value: string): string {
  // Remove caracteres perigosos e quotes
  return value.replace(/["'\\]/g, "");
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  user?: {
    displayName: string;
    emailAddress: string;
  };
}

export async function testJiraConnection(): Promise<TestConnectionResult> {
  try {
    const credentials = await getJiraCredentials();
    
    if (!credentials) {
      return {
        success: false,
        message: "Credenciais não configuradas",
      };
    }
    
    const auth = await encodeBasicAuth(credentials.email, credentials.token);
    
    // Testa a conexão usando o endpoint /myself do site específico
    const response = await fetch(`https://${credentials.domain}.atlassian.net/rest/api/3/myself`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: "Token inválido ou expirado. Verifique suas credenciais.",
        };
      }
      
      if (response.status === 404) {
        return {
          success: false,
          message: "Domínio do Jira não encontrado. Verifique o domínio.",
        };
      }
      
      return {
        success: false,
        message: `Erro na API do Jira: ${response.status} ${response.statusText}`,
      };
    }
    
    const userData = await response.json();
    
    // Se chegou aqui, a conexão funcionou
    return {
      success: true,
      message: `Conectado como ${userData.displayName || userData.emailAddress}!`,
      user: {
        displayName: userData.displayName,
        emailAddress: userData.emailAddress,
      },
    };
    
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export interface SaveCredentialsResult {
  success: boolean;
  message: string;
}

export interface JiraProject {
  key: string;
  name: string;
  avatarUrls?: {
    "48x48"?: string;
    "24x24"?: string;
    "16x16"?: string;
    "32x32"?: string;
  };
}

// Interface para resposta da API de projetos
interface JiraProjectResponse {
  key: string;
  name: string;
  avatarUrls?: {
    "48x48"?: string;
    "24x24"?: string;
    "16x16"?: string;
    "32x32"?: string;
  };
}

export interface GetProjectsResult {
  success: boolean;
  projects: JiraProject[];
  message?: string;
}

export async function saveAndTestCredentials(
  email: string,
  token: string,
  domain: string
): Promise<SaveCredentialsResult> {
  try {
    // Valida básico
    if (!email || !token || !domain) {
      return {
        success: false,
        message: "Email, token e domínio são obrigatórios",
      };
    }
    
    if (!email.includes("@")) {
      return {
        success: false,
        message: "Email inválido",
      };
    }
    
    // Limpa o domínio (remove https:// e .atlassian.net se o usuário incluir)
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\.atlassian\.net\/?$/, "");
    
    // Testa a conexão usando o endpoint /myself do site específico
    const auth = await encodeBasicAuth(email, token);
    const response = await fetch(`https://${cleanDomain}.atlassian.net/rest/api/3/myself`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: "Token inválido. Verifique se o Personal API Token está correto.",
        };
      }
      
      if (response.status === 404) {
        return {
          success: false,
          message: "Domínio do Jira não encontrado. Verifique se o domínio está correto.",
        };
      }
      
      return {
        success: false,
        message: `Erro na API do Jira: ${response.status}`,
      };
    }
    
    const userData = await response.json();
    
    // Se chegou aqui, salva as credenciais
    const { setJiraCredentials } = await import("@/lib/cookies");
    await setJiraCredentials({ email, token, domain: cleanDomain });
    
    return {
      success: true,
      message: `Conectado como ${userData.displayName || userData.emailAddress}!`,
    };
    
  } catch (error) {
    console.error("Erro ao salvar credenciais:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export const getProjects = cache(async (): Promise<GetProjectsResult> => {
  try {
    const credentials = await getJiraCredentials();

    if (!credentials) {
      return {
        success: false,
        projects: [],
        message: "Credenciais não configuradas",
      };
    }

    const auth = await encodeBasicAuth(credentials.email, credentials.token);

    const response = await fetch(
      `https://${credentials.domain}.atlassian.net/rest/api/3/project`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          projects: [],
          message: "Token inválido ou expirado. Verifique suas credenciais.",
        };
      }

      return {
        success: false,
        projects: [],
        message: `Erro na API do Jira: ${response.status} ${response.statusText}`,
      };
    }

    const projectsData = await response.json();

    const projects: JiraProject[] = projectsData.map((project: JiraProjectResponse) => ({
      key: project.key,
      name: project.name,
      avatarUrls: project.avatarUrls,
    }));

    return {
      success: true,
      projects,
    };
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return {
      success: false,
      projects: [],
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
});

export interface JiraEpic {
  id: string;
  key: string;
  summary: string;
}

// Interface para resposta de busca de issues
interface JiraSearchIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
  };
}

export interface GetEpicsResult {
  success: boolean;
  epics: JiraEpic[];
  message?: string;
}

export const getEpics = cache(async (projectKey: string): Promise<GetEpicsResult> => {
  try {
    const credentials = await getJiraCredentials();

    if (!credentials) {
      return {
        success: false,
        epics: [],
        message: "Credenciais não configuradas",
      };
    }

    const auth = await encodeBasicAuth(credentials.email, credentials.token);

    // Busca épicos do projeto usando JQL (com escaping)
    const jql = `project = ${escapeJqlValue(projectKey)} AND issuetype = Epic ORDER BY created DESC`;
    
    const response = await fetch(
      `https://${credentials.domain}.atlassian.net/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=id,key,summary`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          epics: [],
          message: "Token inválido ou expirado. Verifique suas credenciais.",
        };
      }

      return {
        success: false,
        epics: [],
        message: `Erro na API do Jira: ${response.status} ${response.statusText}`,
      };
    }

    const searchData = await response.json();

    const epics: JiraEpic[] = searchData.issues?.map((issue: JiraSearchIssue) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
    })) || [];

    return {
      success: true,
      epics,
    };
  } catch (error) {
    console.error("Erro ao buscar épicos:", error);
    return {
      success: false,
      epics: [],
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
});

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  assignee?: string;
  epicKey?: string;
  epicName?: string;
}

export interface SearchIssuesResult {
  success: boolean;
  issues: JiraIssue[];
  total: number;
  page: number;
  totalPages: number;
  message?: string;
}

export async function searchIssues(
  projectKey: string,
  epicKey?: string | null,
  page: number = 0
): Promise<SearchIssuesResult> {
  try {
    const credentials = await getJiraCredentials();

    if (!credentials) {
      return {
        success: false,
        issues: [],
        total: 0,
        page: 0,
        totalPages: 0,
        message: "Credenciais não configuradas",
      };
    }

    const auth = await encodeBasicAuth(credentials.email, credentials.token);
    const maxResults = 100;
    const startAt = page * maxResults;

    // JQL base: issues pendentes e fora de sprint (com escaping)
    let jql = `project = ${escapeJqlValue(projectKey)} AND status in ("To Do", "Backlog", "Open") AND sprint is EMPTY`;

    // Adiciona filtro de épico se especificado
    if (epicKey === "none") {
      jql += ` AND "Epic Link" is EMPTY`;
    } else if (epicKey) {
      jql += ` AND "Epic Link" = ${escapeJqlValue(epicKey)}`;
    }

    const response = await fetch(
      `https://${credentials.domain}.atlassian.net/rest/api/3/search?jql=${encodeURIComponent(
        jql
      )}&maxResults=${maxResults}&startAt=${startAt}&fields=id,key,summary,status,assignee,${EPIC_LINK_FIELD}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          issues: [],
          total: 0,
          page,
          totalPages: 0,
          message: "Token inválido ou expirado. Verifique suas credenciais.",
        };
      }

      return {
        success: false,
        issues: [],
        total: 0,
        page,
        totalPages: 0,
        message: `Erro na API do Jira: ${response.status} ${response.statusText}`,
      };
    }

    const searchData = await response.json();

    const issues: JiraIssue[] =
      searchData.issues?.map((issue: { id: string; key: string; fields: { summary: string; status?: { name?: string }; assignee?: { displayName?: string } } }) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name || "Unknown",
        assignee: issue.fields.assignee?.displayName || null,
        epicKey: issue.fields[EPIC_LINK_FIELD as keyof typeof issue.fields] as string | undefined,
      })) || [];

    const total = searchData.total || 0;
    const totalPages = Math.ceil(total / maxResults);

    return {
      success: true,
      issues,
      total,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Erro ao buscar issues:", error);
    return {
      success: false,
      issues: [],
      total: 0,
      page,
      totalPages: 0,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
