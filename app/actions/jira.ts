"use server";

import { getJiraCredentials, encodeBasicAuth } from "@/lib/cookies";
import { cache } from "react";

// Helper para escapar valores JQL (previne injeção)
function escapeJqlValue(value: string): string {
  const clean = value.replace(/["'\\]/g, "");
  return `"${clean}"`;
}

// Interface para resposta da API de boards
interface JiraBoardResponse {
  id: number;
  name: string;
  type: string;
  location?: {
    projectId: number;
    projectKey: string;
    projectName: string;
  };
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

export async function saveAndTestCredentials(
  email: string,
  token: string,
  domain: string
): Promise<SaveCredentialsResult> {
  try {
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
    
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\.atlassian\.net\/?$/, "");
    
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

export const getProjects = cache(async (): Promise<{ success: boolean; projects: JiraProject[]; message?: string }> => {
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

    const projects: JiraProject[] = projectsData.map((project: { key: string; name: string; avatarUrls?: Record<string, string> }) => ({
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

export const getEpics = cache(async (projectKey: string): Promise<{ success: boolean; epics: JiraEpic[]; message?: string }> => {
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

    const jql = `project = ${escapeJqlValue(projectKey)} AND issuetype = Epic ORDER BY created DESC`;
    
    const response = await fetch(
      `https://${credentials.domain}.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=50&fields=id,key,summary`,
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

    const epics: JiraEpic[] = searchData.issues?.map((issue: { id: string; key: string; fields: { summary: string } }) => ({
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

    let jql = `project = ${escapeJqlValue(projectKey)} AND status in ("To Do", "Backlog", "Open") AND sprint is EMPTY`;

    if (epicKey === "none") {
      jql += ` AND parent is EMPTY`;
    } else if (epicKey) {
      jql += ` AND parent = ${escapeJqlValue(epicKey)}`;
    }

    const response = await fetch(
      `https://${credentials.domain}.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&startAt=${startAt}&fields=id,key,summary,status,assignee,parent`,
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
      searchData.issues?.map((issue: { 
        id: string; 
        key: string; 
        fields: { 
          summary: string; 
          status?: { name?: string }; 
          assignee?: { displayName?: string };
          parent?: { 
            key: string; 
            fields?: { 
              summary?: string;
            };
          };
        };
      }) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name || "Unknown",
        assignee: issue.fields.assignee?.displayName || null,
        epicKey: issue.fields.parent?.key,
        epicName: issue.fields.parent?.fields?.summary,
      })) || [];

    const total = searchData.total ?? issues.length;
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

export interface ApplyRanksResult {
  success: boolean;
  applied: string[];
  failed: Array<{ key: string; error: string }>;
  message?: string;
}

export interface GetBoardIdResult {
  success: boolean;
  boardId: number | null;
  message?: string;
}

// Server Action para buscar o board ID do projeto
export async function getBoardIdByProject(projectKey: string): Promise<GetBoardIdResult> {
  try {
    const credentials = await getJiraCredentials();

    if (!credentials) {
      return {
        success: false,
        boardId: null,
        message: "Credenciais não configuradas",
      };
    }

    const auth = await encodeBasicAuth(credentials.email, credentials.token);

    const response = await fetch(
      `https://${credentials.domain}.atlassian.net/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKey)}`,
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
          boardId: null,
          message: "Token inválido ou expirado",
        };
      }
      return {
        success: false,
        boardId: null,
        message: `Erro na API: ${response.status}`,
      };
    }

    const data = await response.json();
    
    if (data.values && data.values.length > 0) {
      // Retorna o ID do primeiro board encontrado
      return {
        success: true,
        boardId: data.values[0].id,
      };
    }

    return {
      success: false,
      boardId: null,
      message: "Nenhum board encontrado para o projeto",
    };
  } catch (error) {
    console.error("Erro ao buscar board ID:", error);
    return {
      success: false,
      boardId: null,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Server Action para aplicar ranks no Jira
// Estratégia: Processa em ordem reversa usando rankBeforeIssue
export async function applyRanks(
  issues: Array<{ key: string; rankAfterKey: string | null }>,
  projectKey: string
): Promise<ApplyRanksResult> {
  try {
    const credentials = await getJiraCredentials();

    if (!credentials) {
      return {
        success: false,
        applied: [],
        failed: issues.map(i => ({ key: i.key, error: "Credenciais não configuradas" })),
        message: "Credenciais não configuradas",
      };
    }

    const auth = await encodeBasicAuth(credentials.email, credentials.token);
    
    const applied: string[] = [];
    const failed: Array<{ key: string; error: string }> = [];
    
    if (issues.length === 0) {
      return {
        success: false,
        applied: [],
        failed: [],
        message: "Nenhuma issue para ordenar",
      };
    }
    
    // Buscar uma issue de referência do backlog que NÃO esteja na nossa lista
    // Isso garante que todas as issues possam ter uma referência válida
    let externalReference: string | null = null;
    let allIssuesInBacklog: string[] = [];
    
    try {
      // Busca todas as issues do backlog para entender o contexto
      const issueKeysInList = issues.map(i => i.key);
      const keysToExclude = issueKeysInList.map(k => `"${k}"`).join(",");
      
      // JQL: pega issues do projeto que NÃO estão na nossa lista, ordenadas por rank
      const jql = `project = ${escapeJqlValue(projectKey)} AND key NOT IN (${keysToExclude}) ORDER BY rank DESC`;
      
      const response = await fetch(
        `https://${credentials.domain}.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=50&fields=key`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.issues && data.issues.length > 0) {
          // Pega a primeira issue que não está na nossa lista (mais prioritária delas)
          externalReference = data.issues[0].key;
          console.log(`Referência externa encontrada: ${externalReference}`);
        }
      }
      
      // Busca a última issue do backlog (independente de estar na lista ou não)
      // Isso é usado como fallback quando todas estão na lista
      const lastJql = `project = ${escapeJqlValue(projectKey)} ORDER BY rank DESC`;
      const lastResponse = await fetch(
        `https://${credentials.domain}.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(lastJql)}&maxResults=1&fields=key`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        }
      );
      
      if (lastResponse.ok) {
        const lastData = await lastResponse.json();
        if (lastData.issues && lastData.issues.length > 0) {
          allIssuesInBacklog = lastData.issues.map((iss: { key: string }) => iss.key);
        }
      }
    } catch (e) {
      console.warn("Não foi possível buscar issues de referência:", e);
    }
    
    // Determina a melhor referência
    const hasExternalRef = externalReference && !issues.some(iss => iss.key === externalReference);
    const lastBacklogIssue = allIssuesInBacklog.length > 0 ? allIssuesInBacklog[0] : null;
    
    // Usa referência externa se disponível, senão usa última do backlog
    const reference = hasExternalRef ? externalReference : lastBacklogIssue;
    
    if (reference) {
      console.log(`Usando referência: ${reference}`);
    } else {
      console.log("Sem referência disponível");
    }
    
    // ESTRATÉGIA SIMPLES: Processa na ORDEM NORMAL
    // - Primeira vai DEPOIS da referência (pro final)
    // - Demais vão DEPOIS da anterior
    // Isso funciona mesmo quando todas estão na lista!
    for (let i = 0; i < issues.length; i++) {
      const { key } = issues[i];
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      
      // Pula se a issue já foi aplicada anteriormente
      if (applied.includes(key) || failed.find(f => f.key === key)) {
        continue;
      }
      
      while (retries < maxRetries && !success) {
        let timeoutId: NodeJS.Timeout | null = null;
        
        try {
          // Delay entre chamadas (rate limiting)
          if (i > 0 || retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          // AbortController para timeout de 15s
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 15000);
          
          // Prepara o payload
          const rankBody: Record<string, unknown> = {
            issues: [key],
            rankCustomFieldId: 10019,
          };
          
          if (i === 0) {
            // PRIMEIRA issue vai DEPOIS da referência
            if (reference && reference !== key) {
              rankBody.rankAfterIssue = reference;
              console.log(`Issue ${key}: rankAfterIssue = ${reference} (referência)`);
            } else {
              console.log(`Issue ${key}: sem referência, vai pro final`);
            }
          } else {
            // Demais vão DEPOIS da anterior
            const prevKey = issues[i - 1].key;
            rankBody.rankAfterIssue = prevKey;
            console.log(`Issue ${key}: rankAfterIssue = ${prevKey} (anterior)`);
          }
          
          const response = await fetch(
            `https://${credentials.domain}.atlassian.net/rest/agile/1.0/issue/rank`,
            {
              method: "PUT",
              headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(rankBody),
              signal: controller.signal,
            }
          );
          
          if (timeoutId) clearTimeout(timeoutId);
          
          if (response.ok) {
            applied.push(key);
            success = true;
          } else if (response.status === 429) {
            // Rate limit
            const retryAfter = response.headers.get("Retry-After");
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // Erros 4xx definitivos
            const errorText = await response.text();
            failed.push({
              key,
              error: `HTTP ${response.status}: ${errorText}`,
            });
            break;
          } else {
            // Erros 5xx - retry
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          if (timeoutId) clearTimeout(timeoutId);
          
          const isTransientError = 
            error instanceof Error && 
            (error.name === "AbortError" ||
             error.message.includes("fetch") ||
             error.message.includes("network"));
          
          if (!isTransientError && error instanceof Error && error.message.includes("HTTP 4")) {
            failed.push({
              key,
              error: error.message,
            });
            break;
          }
          
          retries++;
          if (retries >= maxRetries) {
            failed.push({
              key,
              error: error instanceof Error ? error.message : "Erro desconhecido",
            });
          }
        }
      }
      
      if (!success && !failed.find(f => f.key === key)) {
        failed.push({ key, error: "Máximo de tentativas excedido" });
      }
    }
    
    return {
      success: failed.length === 0,
      applied,
      failed,
      message: failed.length === 0 
        ? `Todos os ${applied.length} issues foram ordenados com sucesso`
        : `${applied.length} issues ordenados, ${failed.length} falhas`,
    };
  } catch (error) {
    console.error("Erro ao aplicar ranks:", error);
    return {
      success: false,
      applied: [],
      failed: issues.map(i => ({ key: i.key, error: "Erro interno" })),
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
