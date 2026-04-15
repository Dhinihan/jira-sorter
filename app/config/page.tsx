"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAndTestCredentials } from "@/app/actions/jira";

export default function ConfigPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await saveAndTestCredentials(email, token, domain);
      setResult(response);
      
      // Redireciona para home após sucesso
      if (response.success) {
        setTimeout(() => {
          router.push("/");
        }, 1500); // Pequeno delay para usuário ver mensagem de sucesso
      }
    } catch {
      setResult({
        success: false,
        message: "Erro ao conectar. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configuração do Jira</h1>
          <p className="text-gray-600 mt-2">
            Configure seu Personal API Token para conectar ao Jira
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Domínio do Jira
            </label>
            <div className="relative">
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="meu-site"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black bg-white placeholder:text-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                .atlassian.net
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Exemplo: se seu Jira é https://meu-site.atlassian.net, digite &quot;meu-site&quot;
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email do Jira
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black bg-white placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Personal API Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ATATT..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black bg-white placeholder:text-gray-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Obtenha seu token em:{" "}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                id.atlassian.com/manage-profile/security/api-tokens
              </a>
            </p>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">
                  {result.success ? "✅" : "❌"}
                </span>
                <span className="text-sm">{result.message}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Testando conexão...
              </span>
            ) : (
              "Salvar e Testar Conexão"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Como obter seu token:
          </h3>
          <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
            <li>Acesse seu perfil Atlassian</li>
            <li>Vá em Segurança → API Tokens</li>
            <li>Crie um novo token</li>
            <li>Copie e cole aqui</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
