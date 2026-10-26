import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const TOKEN_KEY = 'deck-it-token';

async function request(path, options = {}) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? 'Não foi possível concluir a solicitação.');
  }

  return body;
}

export async function login(email, password) {
  const body = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!body.token) {
    throw new Error('A resposta do login não contém um token.');
  }

  await SecureStore.setItemAsync(TOKEN_KEY, body.token);
  return body;
}

export async function logout() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export { API_URL };
