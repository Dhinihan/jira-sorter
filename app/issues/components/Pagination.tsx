"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    if (page < 0 || page >= totalPages) return;

    const params = new URLSearchParams(searchParams);
    if (page === 0) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/issues?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Lógica para mostrar páginas ao redor da página atual
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i;
          } else if (currentPage < 2) {
            pageNum = i;
          } else if (currentPage > totalPages - 3) {
            pageNum = totalPages - 5 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {pageNum + 1}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Próximo →
      </button>
    </div>
  );
}
