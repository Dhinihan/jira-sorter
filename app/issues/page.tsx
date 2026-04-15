import { getProjects } from "@/app/actions/jira";
import { ProjectSelect } from "./components/ProjectSelect";
import { IssuesTable } from "./components/IssuesTable";
import { getJiraCredentials } from "@/lib/cookies";
import { redirect } from "next/navigation";
import Link from "next/link";

interface IssuesPageProps {
  searchParams: Promise<{
    project?: string;
    epic?: string;
    page?: string;
  }>;
}

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  // Aguarda searchParams (Next.js 16+)
  const params = await searchParams;
  // Verifica se usuário está conectado
  const credentials = await getJiraCredentials();
  if (!credentials) {
    redirect("/config");
  }

  // Carrega projetos no SSR
  const projectsResult = await getProjects();
  const projects = projectsResult.success ? projectsResult.projects : [];

  // Parse query params
  const selectedProject = params.project || "";
  const selectedEpic = params.epic || "";
  const currentPage = parseInt(params.page || "0", 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buscar Issues</h1>
              <p className="text-gray-600 mt-1">
                Selecione um projeto e filtros para buscar issues do backlog
              </p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <ProjectSelect
            projects={projects}
            selectedProject={selectedProject}
            selectedEpic={selectedEpic}
          />
        </div>

        {/* Resultados */}
        {selectedProject ? (
          <IssuesTable
            projectKey={selectedProject}
            epicKey={selectedEpic}
            page={currentPage}
            jiraDomain={credentials.domain}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um projeto
            </h3>
            <p className="text-gray-600">
              Escolha um projeto acima para começar a buscar issues.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
