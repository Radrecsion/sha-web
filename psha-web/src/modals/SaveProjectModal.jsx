import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";

export default function SaveProjectModal({ isOpen, onClose, onSave }) {
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (isOpen) setProjectName("");
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!projectName.trim()) return;
    onSave(projectName.trim());
    onClose();
  }

  return (
    <BaseModal title="Save Project" onClose={onClose} width="w-96">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          className="w-full border border-[var(--color-border)] rounded px-3 py-2 bg-[var(--bg)] text-[var(--text)]"
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[var(--hover)] text-[var(--text)] hover:opacity-80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!projectName.trim()}
            className={`px-4 py-2 rounded text-white ${
              projectName.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
