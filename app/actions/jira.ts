"use server";

import { getJiraCredentials, encodeBasicAuth } from "@/lib/cookies";

const JIRA_BASE_URL = "https://api.atlassian.com";

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
    
    const auth = encodeBasicAuth(credentials.email, credentials.token);
    
    // Testa a conexão buscando os recursos do usuário (sites/clouds)
    const response = await fetch(`${JIRA_BASE_URL}/oauth/token/accessible-resources`, {
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
      
      return {
        success: false,
        message: `Erro na API do Jira: ${response.status} ${response.statusText}`,
      };
    }
    
    const resources = await response.json();
    
    if (!resources || resources.length === 0) {
      return {
        success: false,
        message: "Nenhum site do Jira encontrado para este token",
      };
    }
    
    // Se chegou aqui, a conexão funcionou
    return {
      success: true,
      message: `Conectado! ${resources.length} site(s) do Jira encontrado(s).`,
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

export async function saveAndTestCredentials(
  email: string,
  token: string
): Promise<SaveCredentialsResult> {
  try {
    // Valida básico
    if (!email || !token) {
      return {
        success: false,
        message: "Email e token são obrigatórios",
      };
    }
    
    if (!email.includes("@")) {
      return {
        success: false,
        message: "Email inválido",
      };
    }
    
    // Testa a conexão primeiro
    const auth = encodeBasicAuth(email, token);
    const response = await fetch(`${JIRA_BASE_URL}/oauth/token/accessible-resources`, {
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
      
      return {
        success: false,
        message: `Erro na API do Jira: ${response.status}`,
      };
    }
    
    const resources = await response.json();
    
    if (!resources || resources.length === 0) {
      return {
        success: false,
        message: "Token válido, mas nenhum site do Jira encontrado",
      };
    }
    
    // Se chegou aqui, salva as credenciais
    const { setJiraCredentials } = await import("@/lib/cookies");
    await setJiraCredentials({ email, token });
    
    return {
      success: true,
      message: `Conectado com sucesso! ${resources.length} site(s) encontrado(s).`,
    };
    
  } catch (error) {
    console.error("Erro ao salvar credenciais:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
