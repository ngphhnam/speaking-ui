export type TopicDto = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  partNumber?: number;
  difficultyLevel?: string;
  topicCategory?: string;
  keywords?: string[];
  usageCount: number;
  avgUserRating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuestionDto[];
};

export type CreateTopicRequest = {
  title: string;
  description?: string;
  partNumber?: number;
  difficultyLevel?: string;
  topicCategory?: string;
  keywords?: string[];
};

export type UpdateTopicRequest = {
  title?: string;
  description?: string;
  partNumber?: number;
  difficultyLevel?: string;
  topicCategory?: string;
  keywords?: string[];
  isActive?: boolean;
};

export type QuestionDto = {
  id: string;
  topicId?: string;
  topicTitle?: string;
  questionText: string;
  questionType?: string;
  suggestedStructure?: string;
  sampleAnswers?: string[];
  keyVocabulary?: string[];
  estimatedBandRequirement?: number;
  timeLimitSeconds: number;
  attemptsCount: number;
  avgScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OutlineDto = {
  outline: {
    introduction: string;
    mainPoints: {
      point: string;
      details: string;
    }[];
    conclusion: string;
  };
  estimatedDuration: number;
  keyPhrases: string[];
};

export type CreateQuestionRequest = {
  topicId?: string;
  questionText: string;
  questionType?: string;
  suggestedStructure?: string;
  sampleAnswers?: string[];
  keyVocabulary?: string[];
  estimatedBandRequirement?: number;
  timeLimitSeconds?: number;
};

export type UpdateQuestionRequest = {
  topicId?: string;
  questionText?: string;
  questionType?: string;
  suggestedStructure?: string;
  sampleAnswers?: string[];
  keyVocabulary?: string[];
  estimatedBandRequirement?: number;
  timeLimitSeconds?: number;
  isActive?: boolean;
};


