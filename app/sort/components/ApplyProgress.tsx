"use client";

interface ApplyProgressProps {
  current: number;
  total: number;
}

export function ApplyProgress({ current, total }: ApplyProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Aplicando ordenação...
      </h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{current} de {total}</span>
          <span>{percentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <p className="text-center text-gray-500 text-sm">
        Por favor, não feche esta página
      </p>
    </div>
  );
}
