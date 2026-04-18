"use client";

import { useState, useEffect } from "react";
import { getBoardIdByProject } from "@/app/actions/jira";

interface ApplyResultProps {
  applied: number;
  failed: number;
  failedIssues: Array<{ key: string; error: string }>;
  jiraDomain: string;
  projectKey: string;
  onClose: () => void;
}

export function ApplyResult({ 
  applied, 
  failed, 
  failedIssues, 
  jiraDomain, 
  projectKey,
  onClose 
}: ApplyResultProps) {
  const total = applied + failed;
  const hasFailures = failed > 0;
  
  const [boardId, setBoardId] = useState<number | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  
  useEffect(() => {
    async function fetchBoardId() {
      const result = await getBoardIdByProject(projectKey);
      if (result.success && result.boardId) {
        setBoardId(result.boardId);
      }
      setIsLoadingBoard(false);
    }
    
    fetchBoardId();
  }, [projectKey]);
  
  // Build URL safely using URL constructor
  // Se temos boardId, usa a URL completa com backlog
  // Senão, usa a URL genérica dos boards
  const backlogUrl = boardId 
    ? new URL(
        `/jira/software/projects/${encodeURIComponent(projectKey)}/boards/${boardId}/backlog`,
        `https://${jiraDomain}.atlassian.net`
      ).toString()
    : new URL(
        `/jira/software/projects/${encodeURIComponent(projectKey)}/boards`,
        `https://${jiraDomain}.atlassian.net`
      ).toString();
  
  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        {hasFailures ? "Ordenação parcialmente aplicada" : "Ordenação aplicada!"}
      </h2>
      
      {/* Resumo estatístico */}
      <div className="flex justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{applied}</div>
          <div className="text-sm text-gray-600">ordenados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-400">/</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-600">total</div>
        </div>
        {hasFailures && (
          <>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{failed}</div>
              <div className="text-sm text-gray-600">falhas</div>
            </div>
          </>
        )}
      </div>
      
      {/* Lista de falhas */}
      {hasFailures && failedIssues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Issues com falha:</h3>
          <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {failedIssues.map(({ key, error }) => (
                <li key={key} className="flex justify-between items-start text-sm">
                  <span className="font-mono text-red-700">{key}</span>
                  <span className="text-red-600 ml-4 text-right">{error}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Estas issues precisam ser reordenadas manualmente no Jira.
          </p>
        </div>
      )}
      
      {/* Botões de ação */}
      <div className="flex gap-4 justify-center">
        <a
          href={backlogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium ${isLoadingBoard ? 'opacity-70' : ''}`}
        >
          {isLoadingBoard ? 'Carregando...' : 'Ver no backlog'}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
