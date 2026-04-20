'use client';

interface ConfirmRestartModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmRestartModal({ onConfirm, onCancel }: ConfirmRestartModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmRestartHeading"
      aria-describedby="confirmRestartDesc"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔄</div>
          <h2 id="confirmRestartHeading" className="text-2xl font-bold text-gray-900 mb-2">
            Recomeçar Ordenação?
          </h2>
          <p id="confirmRestartDesc" className="text-gray-600">
            Todo o progresso atual será perdido. Você terá que refazer todas as comparações.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Sim, recomeçar
          </button>
        </div>
      </div>
    </div>
  );
}