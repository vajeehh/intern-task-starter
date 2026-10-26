
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const PASSWORD = import.meta.env.VITE_API_PASSWORD || "";

function authHeader(username) {
  return "Basic " + btoa(`${username}:${PASSWORD}`);
}

async function handleResponse(res, action) {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`${action} failed (${res.status}): ${message}`);
  }
  return res.json();
}

export async function fetchTasks(username, status) {
  const url = new URL(`${BASE_URL}/tasks/`);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url, {
    headers: { Authorization: authHeader(username) },
  });

  return handleResponse(res, "Loading tasks");
}

export async function fetchStats(username) {
  const res = await fetch(`${BASE_URL}/tasks/stats/`, {
    headers: { Authorization: authHeader(username) },
  });

  return handleResponse(res, "Loading stats");
}

export async function updateTask(username, taskId, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/`, {
    method: "PATCH",
    headers: {
      Authorization: authHeader(username),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return handleResponse(res, "Updating task");
}

export async function createTask(username, taskData) {
  const res = await fetch(`${BASE_URL}/tasks/`, {
    method: "POST",
    headers: {
      Authorization: authHeader(username),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  return handleResponse(res, "Creating task");
}
