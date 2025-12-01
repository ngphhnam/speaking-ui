"use client";

import { SpeakingLevel } from "@/lib/api/speaking";

export type SpeakingTopic = {
  id: string;
  title: string;
  question: string;
  level?: SpeakingLevel;
  createdAt: string;
};

const TOPICS_STORAGE_KEY = "speaking_topics";
export const SELECTED_TOPIC_STORAGE_KEY = "speaking_selected_topic";

const safeParse = (value: string | null): unknown => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const readTopics = (): SpeakingTopic[] => {
  if (typeof window === "undefined") return [];
  const parsed = safeParse(localStorage.getItem(TOPICS_STORAGE_KEY));
  if (!parsed || !Array.isArray(parsed)) return [];
  return parsed as SpeakingTopic[];
};

export const saveTopics = (topics: SpeakingTopic[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
};

type NewTopicInput = {
  title: string;
  question: string;
  level?: SpeakingLevel;
};

export const addTopic = (input: NewTopicInput): SpeakingTopic => {
  const topics = readTopics();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const topic: SpeakingTopic = {
    id,
    title: input.title.trim(),
    question: input.question.trim(),
    level: input.level,
    createdAt: new Date().toISOString(),
  };

  const next = [...topics, topic];
  saveTopics(next);
  return topic;
};

export const readSelectedTopic = (): SpeakingTopic | null => {
  if (typeof window === "undefined") return null;
  const parsed = safeParse(localStorage.getItem(SELECTED_TOPIC_STORAGE_KEY));
  if (!parsed || typeof parsed !== "object") return null;
  return parsed as SpeakingTopic;
};

export const persistSelectedTopic = (topic: SpeakingTopic) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SELECTED_TOPIC_STORAGE_KEY, JSON.stringify(topic));
};


