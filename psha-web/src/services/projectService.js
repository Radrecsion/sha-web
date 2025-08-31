import apiClient from "./apiClient";

const STORAGE_KEY = "psha-projects";

/**
 * Mode penyimpanan:
 * - "local" -> simpan ke localStorage
 * - "server" -> simpan ke API (login)
 */
const MODE = import.meta.env.VITE_SAVE_MODE || "local";

/* ================= LOCAL STORAGE ================= */
function saveProjectLocal(project) {
  let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const idx = projects.findIndex((p) => p.name === project.name);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function loadProjectsLocal() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function loadProjectByNameLocal(name) {
  const projects = loadProjectsLocal();
  return projects.find((p) => p.name === name) || null;
}

function deleteProjectLocal(name) {
  let projects = loadProjectsLocal();
  projects = projects.filter((p) => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/* ================= SERVER API ================= */
async function saveProjectServer(project) {
  const res = await apiClient.post("/projects", project);
  return res.data;
}

async function loadProjectsServer() {
  const res = await apiClient.get("/projects");
  return res.data;
}

async function loadProjectByNameServer(name) {
  const res = await apiClient.get(`/projects/${encodeURIComponent(name)}`);
  return res.data;
}

async function deleteProjectServer(name) {
  await apiClient.delete(`/projects/${encodeURIComponent(name)}`);
}

/* ================= WRAPPER ================= */
export function saveProject(project) {
  if (MODE === "server") return saveProjectServer(project);
  return saveProjectLocal(project);
}

export function loadProjects() {
  if (MODE === "server") return loadProjectsServer();
  return loadProjectsLocal();
}

export function loadProjectByName(name) {
  if (MODE === "server") return loadProjectByNameServer(name);
  return loadProjectByNameLocal(name);
}

export function deleteProject(name) {
  if (MODE === "server") return deleteProjectServer(name);
  return deleteProjectLocal(name);
}
