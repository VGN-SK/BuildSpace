// src/apiClient.js
// Thin wrapper around fetch, prepared for real NestJS backend.
// TODO: Update BASE_URL to your NestJS server URL.

const BASE_URL = "http://localhost:3000";

export async function apiFetch(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    const text = await res.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        if (typeof data === "string") {
          message = data;
        } else if (data?.message) {
          message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        } else {
          message = text;
        }
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  return res.json();
}
