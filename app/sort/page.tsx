'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IssueCard } from './components';
import { JiraIssue } from '@/app/actions/jira';

// Mock data for UI demonstration - Phase 6 will implement real algorithm
const MOCK_PAIRS: Array<[JiraIssue, JiraIssue]> = [
  [
    { id: '1', key: 'PROJ-101', summary: 'Implementar autenticação OAuth', status: 'To Do', epicKey: 'PROJ-10', epicName: 'Login e Segurança' },
    { id: '2', key: 'PROJ-102', summary: 'Criar página de dashboard', status: 'Backlog', epicKey: 'PROJ-11', epicName: 'Interface Principal' },
  ],
  [
    { id: '3', key: 'PROJ-103', summary: 'Configurar CI/CD pipeline', status: 'Open', epicKey: 'PROJ-12', epicName: 'DevOps' },
    { id: '1', key: 'PROJ-101', summary: 'Implementar autenticação OAuth', status: 'To Do', epicKey: 'PROJ-10', epicName: 'Login e Segurança' },
  ],
  [
    { id: '4', key: 'PROJ-104', summary: 'Otimizar queries do banco', status: 'To Do', epicKey: 'PROJ-13', epicName: 'Performance' },
    { id: '3', key: 'PROJ-103', summary: 'Configurar CI/CD pipeline', status: 'Open', epicKey: 'PROJ-12', epicName: 'DevOps' },
  ],
];

export default function SortPage() {
  const searchParams = useSearchParams();
  
  // Get domain from URL params
  const jiraDomain = searchParams.get('domain') || 'empresa';
  
  // Mock state for UI demonstration - Phase 6 will implement real algorithm
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalComparisons] = useState(23);
  const [isComplete, setIsComplete] = useState(false);
  
  // Get issues from URL params (mock for now)
  const currentPair = MOCK_PAIRS[currentIndex] || MOCK_PAIRS[0];
  
  const handleChoice = (side: 'left' | 'right') => {
    // Mock behavior - just advance to next pair
    console.log('Choice made:', side);
    
    if (currentIndex < MOCK_PAIRS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };
  
  const handleSave = () => {
    // UI only - Phase 6 will implement real save
    alert('Funcionalidade de salvar será implementada na Fase 6!');
  };
  
  if (isComplete) {
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
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ordenação Finalizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Você comparou {MOCK_PAIRS.length} issues em {MOCK_PAIRS.length} comparações.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              (Na implementação completa, aqui mostraria a lista ordenada)
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.open(`https://${jiraDomain}.atlassian.net`, '_blank')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Ver no Jira
              </button>
              <Link
                href="/issues"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Voltar para Issues
              </Link>
            </div>
          </div>
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
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Salvar
              </button>
              <Link
                href="/issues"
                className="text-blue-600 hover:text-blue-800 font-medium"
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
            Comparação {currentIndex + 1} de {totalComparisons}
          </p>
        </div>

        {/* Cards Container */}
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

        {/* Instructions */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Clique no botão abaixo da issue que você considera mais importante</p>
        </div>
      </main>
    </div>
  );
}
