'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IssueCard, ConfirmApplyModal, ConfirmRestartModal, ApplyProgress, ApplyResult } from './components';
import { useBinaryInsertionSort } from './hooks';
import { JiraIssue, applyRanks, ApplyRanksResult } from '@/app/actions/jira';
import { generateRanksForSortedIssues } from '@/lib/lexorank';

/**
 * Validate and normalize Jira domain
 * Only allows alphanumeric and hyphen characters
 */
function validateJiraDomain(domain: string): string {
  // Trim whitespace and lowercase
  const trimmed = domain.trim().toLowerCase();
  
  // Remove any scheme (http://, https://) if present
  const withoutScheme = trimmed.replace(/^https?:\/\//, '');
  
  // Extract subdomain before .atlassian.net if full URL was passed
  const match = withoutScheme.match(/^([a-z0-9-]+)(\.atlassian\.net.*)?$/);
  
  if (match && match[1]) {
    const subdomain = match[1];
    // Validate: only a-z, 0-9, and hyphen allowed
    if (/^[a-z0-9-]+$/.test(subdomain)) {
      return subdomain;
    }
  }
  
  // Fallback to safe default if validation fails
  return 'empresa';
}

function SortPageContent() {
  const searchParams = useSearchParams();

  // Validate and normalize jiraDomain
  const rawDomain = searchParams.get('domain') || 'empresa';
  const jiraDomain = validateJiraDomain(rawDomain);
  
  const payloadId = searchParams.get('payloadId');
  const sessionId = searchParams.get('sessionId');

  // Load issues from sessionStorage
  const getInitialIssues = (): JiraIssue[] => {
    if (typeof window !== 'undefined' && payloadId) {
      const stored = sessionStorage.getItem(payloadId);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          console.error('Failed to parse stored issues');
        }
      }
    }
    return [];
  };

  const [issues] = useState<JiraIssue[]>(getInitialIssues);
  const projectKey = searchParams.get('project') || 'default';

  // Use the real Binary Insertion Sort hook
  const {
    currentPair,
    progress,
    handleChoice,
    sortedResult,
    isComplete,
    canSave,
    canUndo,
    handleUndo,
    handleRestart,
    isExpired,
    maxComparisons,
  } = useBinaryInsertionSort(issues, projectKey, sessionId);

  // States for apply ranks flow
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [applyResult, setApplyResult] = useState<ApplyRanksResult | null>(null);

  const handleSave = () => {
    if (!canSave) return;
    // Save to localStorage (already done by hook)
    alert('Progresso salvo! Você pode fechar e voltar depois.');
  };

  const handleApplyClick = () => {
    if (!sortedResult || sortedResult.length === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmApply = async () => {
    if (!sortedResult || isApplying) return; // Guarda contra re-entrância
    
    setShowConfirmModal(false);
    setIsApplying(true);
    setApplyProgress(0);
    
    try {
      // Generate ranks for sorted issues
      const issuesWithRanks = generateRanksForSortedIssues(sortedResult.map(i => i.key));
      
      // Apply ranks with progress tracking
      const result = await applyRanks(issuesWithRanks, projectKey);
      
      setApplyProgress(sortedResult.length);
      setApplyResult(result);
    } catch (error) {
      console.error("Error applying ranks:", error);
      setApplyResult({
        success: false,
        applied: [],
        failed: sortedResult.map(i => ({ key: i.key, error: "Erro interno ao aplicar" })),
        message: "Erro interno ao aplicar ordenação",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelApply = () => {
    setShowConfirmModal(false);
  };

  const handleCloseResult = () => {
    setApplyResult(null);
  };

  // Handle expired session
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sessão Expirada
          </h2>
          <p className="text-gray-600 mb-6">
            Sua sessão de ordenação expirou (7 dias). Você precisa começar novamente.
          </p>
          <Link
            href="/issues"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Voltar para Issues
          </Link>
        </div>
      </div>
    );
  }

  // No issues loaded
  if (issues.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Nenhuma Issue Selecionada
          </h2>
          <p className="text-gray-600 mb-6">
            Selecione issues na página anterior para começar a ordenação.
          </p>
          <Link
            href="/issues"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Voltar para Issues
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete && sortedResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Ordenação Completa</h1>
              <Link
                href="/issues"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Voltar para Issues
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ordenação Finalizada!
              </h2>
              <p className="text-gray-600">
                Você ordenou {sortedResult.length} issues.
              </p>
            </div>

            {/* Result Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado:</h3>
              <ol className="space-y-2">
                {sortedResult.map((issue, index) => (
                  <li
                    key={issue.key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`https://${jiraDomain}.atlassian.net/browse/${issue.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {issue.key}
                      </a>
                      <p className="text-gray-700 truncate">{issue.summary}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleApplyClick}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Aplicar no Jira
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Recomeçar
              </button>
              <Link
                href="/issues"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center"
              >
                Voltar para Issues
              </Link>
            </div>
          </div>
          
          {/* Confirmation Modal */}
          {showConfirmModal && sortedResult && (
            <ConfirmApplyModal
              issueCount={sortedResult.length}
              onConfirm={handleConfirmApply}
              onCancel={handleCancelApply}
            />
          )}
          
          {/* Progress Modal */}
          {isApplying && sortedResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ApplyProgress
                current={applyProgress}
                total={sortedResult.length}
              />
            </div>
          )}
          
          {/* Result Modal */}
          {applyResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ApplyResult
                applied={applyResult.applied.length}
                failed={applyResult.failed.length}
                failedIssues={applyResult.failed}
                jiraDomain={jiraDomain}
                projectKey={projectKey}
                onClose={handleCloseResult}
              />
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ordenar Issues</h1>
              <p className="text-gray-600 mt-1">
                Escolha qual issue é mais importante
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canUndo && (
                <button
                  onClick={handleUndo}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  ← Voltar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowRestartModal(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Recomeçar
              </button>
              <Link
                href="/issues"
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-gray-700">
            Comparação {progress.current} de {progress.total}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            (~{maxComparisons} comparações no total)
          </p>
        </div>

        {/* Loading or Cards */}
        {currentPair ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <IssueCard
              issue={currentPair[0]}
              onSelect={() => handleChoice('left')}
              side="left"
              jiraDomain={jiraDomain}
            />
            <IssueCard
              issue={currentPair[1]}
              onSelect={() => handleChoice('right')}
              side="right"
              jiraDomain={jiraDomain}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Iniciando...</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Clique no botão abaixo da issue que você considera mais importante</p>
        </div>
      </main>

      {/* Confirm Restart Modal */}
      {showRestartModal && (
        <ConfirmRestartModal
          onConfirm={() => {
            handleRestart();
            setShowRestartModal(false);
          }}
          onCancel={() => setShowRestartModal(false)}
        />
      )}
    </div>
  );
}

export default function SortPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <SortPageContent />
    </Suspense>
  );
}
