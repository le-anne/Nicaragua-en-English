const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function readJson(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

export async function getNews({ refresh = false } = {}) {
  const query = refresh ? "?refresh=1" : "";
  const response = await fetch(`${API_BASE}/news${query}`);
  const data = await readJson(response);
  return Array.isArray(data) ? data : [];
}

export async function getSources() {
  const response = await fetch(`${API_BASE}/sources`);
  const data = await readJson(response);
  return Array.isArray(data) ? data : [];
}

export function articleTitle(article) {
  return article?.title || article?.str || "Untitled";
}
