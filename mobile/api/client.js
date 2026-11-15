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

export async function getGames() {
  return request('/games');
}

export async function getDecks(gameId) {
  return request(gameId ? `/decks?gameId=${encodeURIComponent(gameId)}` : '/decks');
}

export async function getDeckItems(deckId) {
  return request(`/decks/${deckId}/items`);
}

export async function getCards({ name, gameId, page = 1, limit = 30 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (name?.trim()) {
    params.set('name', name.trim());
  }
  if (gameId) {
    params.set('gameId', String(gameId));
  }

  return request(`/cards?${params.toString()}`);
}

export async function getCard(externalId, gameId) {
  const params = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
  return request(`/cards/${encodeURIComponent(externalId)}${params}`);
}

/** Preço atual da carta (mais recente de cada tipo), já convertido para reais. */
export async function getCardMarket(externalId, gameId) {
  const params = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
  return request(`/cards/${encodeURIComponent(externalId)}/market${params}`);
}

export async function addCardToDeck(deckId, cardExternalId, quantity = 1) {
  return request(`/decks/${deckId}/items`, {
    method: 'POST',
    body: JSON.stringify({ cardExternalId, quantity }),
  });
}

export async function createDeck(gameId, name) {
  return request('/decks', {
    method: 'POST',
    body: JSON.stringify({ gameId, name }),
  });
}

/**
 * Envia a foto da carta para o backend, que usa IA para ler a carta
 * e cruza o resultado com o catálogo.
 */
export async function scanCard({ base64, mimeType = 'image/jpeg', gameId }) {
  return request('/scan', {
    method: 'POST',
    body: JSON.stringify({
      image: base64,
      mimeType,
      ...(gameId ? { gameId: Number(gameId) } : {}),
    }),
  });
}

/**
 * Conversa com o assistente (Mago do Deck-it).
 * messages: [{ role: 'user' | 'assistant', text }] — o backend usa as últimas 12.
 */
export async function sendChatMessage(messages) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}

export async function logout() {
  await deleteStoredValue(TOKEN_KEY);
}

export async function getToken() {
  return getStoredValue(TOKEN_KEY);
}

export { API_URL };
