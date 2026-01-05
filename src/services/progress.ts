// src/services/progress.ts
import { API } from "./api";

export type LearningProgressItem = { module: string; action: string; at: string };
export type FlashcardProgressItem = { module: string; current: number; total: number; at: string };
export type QuizProgressItem = { module: string; score: number; total: number; at?: string };
export type GameProgressItem = { game: string; metric: string; value: number; at?: string };

// POST
export async function reportLearningProgress(moduleTitle: string, action: string) {
  return API.fetchJSON("/progress/learning", {
    method: "POST",
    auth: true,
    body: { module: moduleTitle, action },
  });
}

export async function reportFlashcardProgress(moduleTitle: string, current: number, total: number) {
  return API.fetchJSON("/progress/flashcard", {
    method: "POST",
    auth: true,
    body: { module: moduleTitle, current, total },
  });
}

export async function reportQuizResult(moduleTitle: string, score: number, total: number) {
  return API.fetchJSON("/progress/quiz", {
    method: "POST",
    auth: true,
    body: { module: moduleTitle, score, total },
  });
}

export async function reportGameProgress(game: string, metric: string, value: number) {
  return API.fetchJSON("/progress/game", {
    method: "POST",
    auth: true,
    body: { game, metric, value },
  });
}

// GET (buat debug / fallback)
export async function getLearningActions(limit = 100) {
  return API.fetchJSON(`/progress/learning?limit=${limit}`, { method: "GET", auth: true });
}
export async function getFlashcardProgress() {
  // backend flashcard GET gak punya limit param → jangan kirim limit biar clean
  return API.fetchJSON(`/progress/flashcard`, { method: "GET", auth: true });
}
export async function getQuizResults(limit = 100) {
  return API.fetchJSON(`/progress/quiz?limit=${limit}`, { method: "GET", auth: true });
}
export async function getGameStats(limit = 100) {
  return API.fetchJSON(`/progress/game?limit=${limit}`, { method: "GET", auth: true });
}

export async function fetchProfile() {
  return API.fetchJSON("/profile", { method: "GET", auth: true });
}
