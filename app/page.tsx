import { getJiraCredentials, clearJiraCredentials } from "@/lib/cookies";
import { testJiraConnection } from "@/app/actions/jira";

export default async function HomePage() {
  const credentials = await getJiraCredentials();
  const connectionStatus = await testJiraConnection();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Jira Sorter</h1>
          
          <div className="flex items-center gap-4">
            {connectionStatus.success && (
              <a
                href="/issues"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Buscar Issues →
              </a>
            )}
            
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  connectionStatus.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus.success ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {connectionStatus.success ? "Conectado" : "Desconectado"}
              </span>
            </div>
            
            <form action={async () => {
              "use server";
              await clearJiraCredentials();
            }}>
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Desconectar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bem-vindo ao Jira Sorter
          </h2>
          
          {credentials && (
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Domínio:</span>{" "}
                <a 
                  href={`https://${credentials.domain}.atlassian.net`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {credentials.domain}.atlassian.net
                </a>
              </p>
              <p>
                <span className="font-medium">Email:</span> {credentials.email}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {connectionStatus.success ? (
                  <span className="text-green-600">{connectionStatus.message}</span>
                ) : (
                  <span className="text-red-600">{connectionStatus.message}</span>
                )}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-600 mb-4">
              Próximos passos (em desenvolvimento):
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>🔄 Buscar projetos do Jira</li>
              <li>🔄 Selecionar filtros (status, épico)</li>
              <li>🔄 Iniciar ordenação pairwise</li>
              <li>🔄 Aplicar rank no Jira</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
