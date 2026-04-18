"use client";

interface ConfirmApplyModalProps {
  issueCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmApplyModal({ issueCount, onConfirm, onCancel }: ConfirmApplyModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmHeading"
      aria-describedby="confirmDesc"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 id="confirmHeading" className="text-xl font-semibold text-gray-900 mb-4">
          Aplicar ordenação no Jira?
        </h2>
        
        <p id="confirmDesc" className="text-gray-600 mb-6">
          Isso vai reordenar <strong>{issueCount}</strong> issues no backlog do projeto.
          Essa ação não pode ser desfeita automaticamente.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
