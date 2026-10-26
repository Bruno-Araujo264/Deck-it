import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const TOKEN_KEY = 'deck-it-token';

function getStoredValue(key) {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.localStorage.getItem(key));
  }

  return SecureStore.getItemAsync(key);
}

function setStoredValue(key, value) {
  if (Platform.OS === 'web') {
    globalThis.localStorage.setItem(key, value);
    return Promise.resolve();
  }

  return SecureStore.setItemAsync(key, value);
}

function deleteStoredValue(key) {
  if (Platform.OS === 'web') {
    globalThis.localStorage.removeItem(key);
    return Promise.resolve();
  }

  return SecureStore.deleteItemAsync(key);
}

async function request(path, options = {}) {
  const token = await getStoredValue(TOKEN_KEY);
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

  await setStoredValue(TOKEN_KEY, body.token);
  return body;
}

export async function register({ nickname, email, password, acceptedTerms }) {
  const body = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nickname,
      email,
      password,
      acceptedTerms,
    }),
  });

  if (!body.token) {
    throw new Error('A resposta do cadastro não contém um token.');
  }

  await setStoredValue(TOKEN_KEY, body.token);
  return body;
}

export async function getProfile() {
  return request('/users/profile');
}

export async function logout() {
  await deleteStoredValue(TOKEN_KEY);
}

export async function getToken() {
  return getStoredValue(TOKEN_KEY);
}

export { API_URL };
