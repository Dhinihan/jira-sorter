"use server";

import { getJiraCredentials, encodeBasicAuth } from "@/lib/cookies";

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
