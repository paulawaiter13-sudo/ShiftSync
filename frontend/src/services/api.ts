const API_BASE_URL = "https://shiftsync-rd8o.onrender.com/api";
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}
