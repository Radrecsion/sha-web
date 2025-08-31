import { useState, useEffect } from "react";
import { loadProjects, deleteProject } from "../services/projectService";
import BaseModal from "./BaseModal";

export default function LoadProjectModal({ isOpen, onClose, onLoad }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (isOpen) setProjects(loadProjects());
  }, [isOpen]);

  if (!isOpen) return null;

  function handleLoad(p) {
    onLoad(p);
    onClose();
  }

  function handleDelete(name) {
    if (!confirm(`Hapus project "${name}"?`)) return;
    deleteProject(name);
    setProjects(loadProjects());
  }

  return (
    <BaseModal title="Load Project" onClose={onClose} width="w-96">
      {projects.length === 0 ? (
        <p className="text-[var(--text)] opacity-70">No saved projects</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {projects.map((p, i) => (
            <li
              key={`${p.name}-${i}`}
              className="flex justify-between items-center border border-[var(--color-border)] rounded px-3 py-2 hover:bg-[var(--hover)] transition-colors"
            >
              <span>{p.name}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleLoad(p)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(p.name)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-[var(--hover)] text-[var(--text)] hover:opacity-80"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
}
