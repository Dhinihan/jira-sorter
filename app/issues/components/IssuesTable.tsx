"use client";

import { useEffect, useState } from "react";
import { searchIssues, JiraIssue } from "@/app/actions/jira";
import { Pagination } from "./Pagination";

interface IssuesTableProps {
  projectKey: string;
  epicKey: string;
  page: number;
  jiraDomain: string;
}

// Função pura para obter cor do status - movida para fora do componente
function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("done") || statusLower.includes("closed")) {
    return "bg-green-100 text-green-800";
  } else if (statusLower.includes("progress")) {
    return "bg-yellow-100 text-yellow-800";
  } else {
    return "bg-gray-100 text-gray-800";
  }
}

export function IssuesTable({ projectKey, epicKey, page, jiraDomain }: IssuesTableProps) {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIssues() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await searchIssues(
          projectKey,
          epicKey || null,
          page
        );

        if (result.success) {
          setIssues(result.issues);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        } else {
          setError(result.message || "Erro ao buscar issues");
        }
      } catch (err) {
        setError("Erro inesperado ao buscar issues");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadIssues();
  }, [projectKey, epicKey, page]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Buscando issues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-600 mb-2">Erro</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma issue encontrada
        </h3>
        <p className="text-gray-600">
          Tente ajustar os filtros ou selecionar outro projeto.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header com contagem */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {total} {total === 1 ? "issue encontrada" : "issues encontradas"}
          </h2>
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Responsável
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Épico
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <tr key={issue.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <a
                    href={`https://${jiraDomain}.atlassian.net/browse/${issue.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {issue.key}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{issue.summary}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      issue.status
                    )}`}
                  >
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {issue.assignee || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {issue.epicName || issue.epicKey || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
