"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JiraProject, JiraEpic, getEpics } from "@/app/actions/jira";

interface ProjectSelectProps {
  projects: JiraProject[];
  selectedProject: string;
  selectedEpic: string;
}

export function ProjectSelect({
  projects,
  selectedProject,
  selectedEpic,
}: ProjectSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [epics, setEpics] = useState<JiraEpic[]>([]);
  const [isLoadingEpics, setIsLoadingEpics] = useState(false);
  const [epicsError, setEpicsError] = useState<string | null>(null);

  // Carrega épicos quando o projeto muda
  useEffect(() => {
    async function loadEpics() {
      if (!selectedProject) {
        setEpics([]);
        setEpicsError(null);
        return;
      }

      setIsLoadingEpics(true);
      setEpicsError(null);
      try {
        const result = await getEpics(selectedProject);
        if (result.success) {
          setEpics(result.epics);
        } else {
          setEpicsError(result.message || "Erro ao carregar épicos");
        }
      } catch (error) {
        console.error("Erro ao carregar épicos:", error);
        setEpicsError("Erro inesperado ao carregar épicos");
      } finally {
        setIsLoadingEpics(false);
      }
    }

    loadEpics();
  }, [selectedProject]);

  function handleProjectChange(projectKey: string) {
    const params = new URLSearchParams(searchParams);
    if (projectKey) {
      params.set("project", projectKey);
    } else {
      params.delete("project");
    }
    params.delete("epic"); // Reseta épico ao mudar projeto
    params.delete("page"); // Reseta página
    router.push(`/issues?${params.toString()}`);
  }

  function handleEpicChange(epicKey: string) {
    const params = new URLSearchParams(searchParams);
    if (epicKey) {
      params.set("epic", epicKey);
    } else {
      params.delete("epic");
    }
    params.delete("page"); // Reseta página
    router.push(`/issues?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropdown de Projetos */}
        <div>
          <label
            htmlFor="project"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Projeto <span className="text-red-500">*</span>
          </label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Selecione um projeto...</option>
            {projects.map((project) => (
              <option key={project.key} value={project.key}>
                {project.name} ({project.key})
              </option>
            ))}
          </select>
          {projects.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              Nenhum projeto encontrado. Verifique suas credenciais.
            </p>
          )}
        </div>

        {/* Dropdown de Épicos */}
        <div>
          <label
            htmlFor="epic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Épico <span className="text-gray-400">(opcional)</span>
          </label>
          <select
            id="epic"
            value={selectedEpic}
            onChange={(e) => handleEpicChange(e.target.value)}
            disabled={!selectedProject || isLoadingEpics}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos os épicos</option>
            <option value="none">Sem épico</option>
            {epics.map((epic) => (
              <option key={epic.key} value={epic.key}>
                {epic.summary} ({epic.key})
              </option>
            ))}
          </select>
          {isLoadingEpics && (
            <p className="text-sm text-gray-500 mt-1">Carregando épicos...</p>
          )}
          {epicsError && (
            <p className="text-sm text-red-600 mt-1">{epicsError}</p>
          )}
        </div>
      </div>

      {/* Resumo dos filtros selecionados */}
      {selectedProject && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              <strong>Projeto:</strong>{" "}
              {projects.find((p) => p.key === selectedProject)?.name ||
                selectedProject}
            </span>
            {selectedEpic && (
              <span>
                <strong>Épico:</strong>{" "}
                {selectedEpic === "none"
                  ? "Sem épico"
                  : epics.find((e) => e.key === selectedEpic)?.summary ||
                    selectedEpic}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
