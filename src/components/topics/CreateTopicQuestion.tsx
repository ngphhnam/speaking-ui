"use client";

import { FormEvent, useState, useMemo, useEffect } from "react";
import { useCreateTopicMutation, useGetTopicsQuery } from "@/store/api/topicApi";
import { useCreateQuestionMutation } from "@/store/api/questionApi";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import type { SerializedError } from "@reduxjs/toolkit";
import { useTranslation } from "react-i18next";

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

// partOptions will be defined inside component to use translations

/**
 * Map UI selection to database partNumber
 * "Part 2 & Part 3" → 2 (database value)
 * "Part 1" → 1
 * "Part 2" → 2
 */
const mapPartNumberToDatabase = (uiValue: string): number | undefined => {
  if (!uiValue) return undefined;
  
  // "2&3" means Part 2 & Part 3, map to database value 2
  if (uiValue === "2&3") {
    return 2;
  }
  
  // Otherwise, use the value directly
  const num = Number(uiValue);
  return isNaN(num) ? undefined : num;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  // Check if error is a FetchBaseQueryError-like object
  if (error && typeof error === "object" && "status" in error && "data" in error) {
    const fetchError = error as { status: string | number; data?: unknown };
    const data = fetchError.data as { detail?: string; message?: string } | string | undefined;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "detail" in data) return String(data.detail);
    if (data && typeof data === "object" && "message" in data) return String(data.message);
    return `Request failed with status ${fetchError.status}`;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as SerializedError).message ?? fallback);
  }
  return fallback;
};

export default function CreateTopicQuestion() {
  const { t } = useTranslation();
  
  const partOptions = [
    { value: "1", label: t("topics.part1", "Part 1: Introduction & Interview") },
    { value: "2&3", label: t("topics.part2And3", "Part 2 & Part 3: Long Turn & Discussion") },
  ];
  
  const [activeTab, setActiveTab] = useState<"topic" | "question">("topic");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Topic form state
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    partNumber: "",
    difficultyLevel: "",
    topicCategory: "",
    keywords: "",
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "",
    suggestedStructure: "",
    sampleAnswers: "",
    keyVocabulary: "",
    estimatedBandRequirement: "",
    timeLimitSeconds: "120",
  });

  const [topicError, setTopicError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [topicSuccess, setTopicSuccess] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [createTopic, { isLoading: isCreatingTopic }] = useCreateTopicMutation();
  const [createQuestion, { isLoading: isCreatingQuestion }] = useCreateQuestionMutation();
  const { data: topics } = useGetTopicsQuery({}, { skip: !mounted });

  const availableTopics = useMemo(() => {
    return (topics ?? []).filter((t) => t.isActive);
  }, [topics]);

  const selectedTopic = useMemo(() => {
    return availableTopics.find((t) => t.id === selectedTopicId);
  }, [availableTopics, selectedTopicId]);

  // Derive allowed question types based on topic.partNumber
  const questionTypeOptions = useMemo(() => {
    if (!selectedTopic) return [];
    if (selectedTopic.partNumber === 1) {
      return [{ value: "PART1", label: t("topics.part1", "Part 1: Introduction & Interview") }];
    }
    if (selectedTopic.partNumber === 2) {
      return [
        { value: "PART2", label: t("topics.part2", "Part 2: Long Turn") },
        { value: "PART3", label: t("topics.part3", "Part 3: Discussion") },
      ];
    }
    if (selectedTopic.partNumber === 3) {
      return [{ value: "PART3", label: t("topics.part3", "Part 3: Discussion") }];
    }
    return [];
  }, [selectedTopic, t]);

  const isQuestionFormValid = useMemo(() => {
    return (
      selectedTopicId &&
      questionForm.questionText.trim() &&
      questionForm.questionType &&
      questionForm.estimatedBandRequirement &&
      questionForm.timeLimitSeconds
    );
  }, [selectedTopicId, questionForm]);

  // Ensure questionType stays in sync with allowed options for the selected topic
  useEffect(() => {
    const allowed = questionTypeOptions.map((opt) => opt.value);
    if (allowed.length === 0) {
      return;
    }
    if (!allowed.includes(questionForm.questionType)) {
      setQuestionForm((prev) => ({ ...prev, questionType: allowed[0] }));
    }
  }, [questionTypeOptions, questionForm.questionType]);

  const handleCreateTopic = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topicForm.title.trim()) {
      setTopicError("Title is required");
      return;
    }

    setTopicError(null);
    setTopicSuccess(null);

    try {
      // Map UI selection to database value
      const partNumber = mapPartNumberToDatabase(topicForm.partNumber);
      
      const result = await createTopic({
        title: topicForm.title.trim(),
        description: topicForm.description.trim() || undefined,
        partNumber: partNumber,
        difficultyLevel: topicForm.difficultyLevel || undefined,
        topicCategory: topicForm.topicCategory.trim() || undefined,
        keywords: topicForm.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      }).unwrap();

      setTopicSuccess(`Topic "${result.title}" created successfully!`);
      setSelectedTopicId(result.id);
      setActiveTab("question");
      
      // Reset form
      setTopicForm({
        title: "",
        description: "",
        partNumber: "",
        difficultyLevel: "",
        topicCategory: "",
        keywords: "",
      });
    } catch (error) {
      setTopicError(getErrorMessage(error, "Failed to create topic"));
    }
  };

  const handleCreateQuestion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      setQuestionError("Question text is required");
      return;
    }

    if (!selectedTopicId) {
      setQuestionError("Please select a topic");
      return;
    }

    if (!questionForm.questionType) {
      setQuestionError("Question type is required");
      return;
    }

    if (!questionForm.estimatedBandRequirement) {
      setQuestionError("Estimated band requirement is required");
      return;
    }

    setQuestionError(null);

    // Build request payload matching the exact API format
    const requestPayload: {
      topicId: string;
      questionText: string;
      questionType: string;
      estimatedBandRequirement: number;
      timeLimitSeconds: number;
      suggestedStructure?: string;
      sampleAnswers?: string[];
      keyVocabulary?: string[];
    } = {
      topicId: selectedTopicId,
      questionText: questionForm.questionText.trim(),
      questionType: questionForm.questionType,
      estimatedBandRequirement: Number(questionForm.estimatedBandRequirement),
      timeLimitSeconds: questionForm.timeLimitSeconds
        ? Number(questionForm.timeLimitSeconds)
        : 120,
    };

    // Only include optional fields if they have values
    if (questionForm.suggestedStructure.trim()) {
      requestPayload.suggestedStructure = questionForm.suggestedStructure.trim();
    }

    const sampleAnswersArray = questionForm.sampleAnswers
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);
    if (sampleAnswersArray.length > 0) {
      requestPayload.sampleAnswers = sampleAnswersArray;
    }

    const keyVocabularyArray = questionForm.keyVocabulary
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (keyVocabularyArray.length > 0) {
      requestPayload.keyVocabulary = keyVocabularyArray;
    }

    try {
      await createQuestion(requestPayload).unwrap();

      // Reset form
      setQuestionForm({
        questionText: "",
        questionType: "",
        suggestedStructure: "",
        sampleAnswers: "",
        keyVocabulary: "",
        estimatedBandRequirement: "",
        timeLimitSeconds: "120",
      });

      setQuestionError(null);
      alert("Question created successfully!");
    } catch (error) {
      setQuestionError(getErrorMessage(error, "Failed to create question"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Create Topic & Questions
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
          Create new topics and add questions to them for speaking practice
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("topic")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "topic"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Create Topic
        </button>
        <button
          onClick={() => setActiveTab("question")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "question"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Add Question
        </button>
      </div>

      {activeTab === "topic" && (
        <form onSubmit={handleCreateTopic} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-5">
              <div>
                <Label>
                  Title <span className="text-error-500">*</span>
                </Label>
                <Input
                  value={topicForm.title}
                  onChange={(e) =>
                    setTopicForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Education System"
                />
              </div>

              <div>
                <Label>Description</Label>
                <TextArea
                  value={topicForm.description}
                  onChange={(value) =>
                    setTopicForm((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="Describe the topic..."
                  rows={4}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>Part Number</Label>
                  <select
                    value={topicForm.partNumber}
                    onChange={(e) =>
                      setTopicForm((prev) => ({ ...prev, partNumber: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Select Part</option>
                    {partOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Difficulty Level</Label>
                  <select
                    value={topicForm.difficultyLevel}
                    onChange={(e) =>
                      setTopicForm((prev) => ({ ...prev, difficultyLevel: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Select Difficulty</option>
                    {difficultyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={topicForm.topicCategory}
                  onChange={(e) =>
                    setTopicForm((prev) => ({ ...prev, topicCategory: e.target.value }))
                  }
                  placeholder="e.g., Education, Technology, Health"
                />
              </div>

              <div>
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={topicForm.keywords}
                  onChange={(e) =>
                    setTopicForm((prev) => ({ ...prev, keywords: e.target.value }))
                  }
                  placeholder="e.g., school, university, learning, study"
                />
              </div>

              {topicError && (
                <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                  {topicError}
                </div>
              )}

              {topicSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {topicSuccess}
                </div>
              )}

              <Button type="submit" disabled={isCreatingTopic} isLoading={isCreatingTopic}>
                Create Topic
              </Button>
            </div>
          </div>
        </form>
      )}

      {activeTab === "question" && (
        <form onSubmit={handleCreateQuestion} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-5">
              <div>
                <Label>
                  Select Topic <span className="text-error-500">*</span>
                </Label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">Select a topic</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                      {topic.partNumber ? ` (Part ${topic.partNumber})` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedTopicId
                    ? "Selected topic for this question"
                    : "Choose a topic to associate this question with"}
                </p>
              </div>

              <div>
                <Label>
                  Question Text <span className="text-error-500">*</span>
                </Label>
                <TextArea
                  value={questionForm.questionText}
                  onChange={(value) =>
                    setQuestionForm((prev) => ({ ...prev, questionText: value }))
                  }
                  placeholder="Enter the question..."
                  rows={3}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Question Type <span className="text-error-500">*</span>
                  </Label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({ ...prev, questionType: e.target.value }))
                    }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Select Type</option>
                    {questionTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {selectedTopic?.partNumber === 2 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t(
                        "topics.part2QuestionHint",
                        "Chủ đề thuộc Part 2, hãy chọn câu hỏi thuộc Part 2 hoặc Part 3."
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Time Limit (seconds) <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={questionForm.timeLimitSeconds}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        timeLimitSeconds: e.target.value,
                      }))
                    }
                    placeholder="120"
                  min="30"
                  max="600"
                  />
                </div>
              </div>

              <div>
                <Label>
                  Estimated Band Requirement <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={questionForm.estimatedBandRequirement}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      estimatedBandRequirement: e.target.value,
                    }))
                  }
                  placeholder="e.g., 6.0"
                  min="0"
                  max="9"
                  step={0.5}
                />
              </div>

              <div>
                <Label>Suggested Structure</Label>
                <TextArea
                  value={questionForm.suggestedStructure}
                  onChange={(value) =>
                    setQuestionForm((prev) => ({ ...prev, suggestedStructure: value }))
                  }
                  placeholder="Suggested answer structure..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Key Vocabulary (comma-separated)</Label>
                <Input
                  value={questionForm.keyVocabulary}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, keyVocabulary: e.target.value }))
                  }
                  placeholder="e.g., education, learning, knowledge"
                />
              </div>

              <div>
                <Label>Sample Answers (one per line)</Label>
                <TextArea
                  value={questionForm.sampleAnswers}
                  onChange={(value) =>
                    setQuestionForm((prev) => ({ ...prev, sampleAnswers: value }))
                  }
                  placeholder="Enter sample answers, one per line..."
                  rows={4}
                />
              </div>

              {questionError && (
                <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                  {questionError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isCreatingQuestion || !isQuestionFormValid}
                isLoading={isCreatingQuestion}
              >
                Create Question
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

