import { useState, useEffect } from "react";
import {
  saveProject,
  loadProjects,
  loadProjectByName,
  deleteProject,
} from "../services/projectService";

export default function ProjectManager({ onSave, onLoad }) {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  function handleSave() {
    if (!projectName) return alert("Masukkan nama project!");

    const project = onSave ? onSave(projectName) : null;
    // `onSave` sebaiknya return object { name, site, datasources, ... }
    if (project) {
      saveProject(project);
    }

    setProjects(loadProjects());
    setProjectName("");
  }

  function handleLoad(name) {
    const project = loadProjectByName(name);
    if (project && onLoad) {
      onLoad(project);
    }
  }

  function handleDelete(name) {
    deleteProject(name);
    setProjects(loadProjects());
  }

  return (
    <div className="mb-6 p-4 border rounded bg-white shadow">
      <h2 className="font-semibold text-lg mb-4">Project Manager</h2>

      {/* Input Save Project */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Nama project..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>

      {/* List Project */}
      {projects.length > 0 ? (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li
              key={p.name}
              className="flex justify-between items-center border px-3 py-2 rounded"
            >
              <span>{p.name}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleLoad(p.name)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(p.name)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Belum ada project tersimpan</p>
      )}
    </div>
  );
}
