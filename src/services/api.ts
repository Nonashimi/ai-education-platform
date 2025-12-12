/**
 * API Service для взаимодействия с Backend
 * Base URL: http://localhost:8000
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Получить текущий язык из localStorage
export const getCurrentLanguage = (): string => {
  return localStorage.getItem('app_language') || 'ru';
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds - quiz generation can take time
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ==================== TYPES ====================

export interface ChatMessage {
  user_id: string;
  message: string;
  language?: string;
}

export interface ChatResponse {
  user_id: string;
  message: string;
  response: string;
  timestamp: string;
}

export interface QuizGenerateRequest {
  user_id: string;
  mode: 'topic_select' | 'free_text' | 'adaptive';
  topic?: string;
  num_questions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
}

export interface QuizQuestion {
  quiz_id: string;
  question_number: number;
  total_questions: number;
  question: string;
  options: string[];
  topic: string;
}

export interface QuizAnswerSubmit {
  quiz_id: string;
  question_number: number;
  selected_answer: number;
}

export interface QuizAnswerResponse {
  is_correct: boolean;
  correct_answer: number;
  explanation: string;
  selected_answer: number;
}

export interface QuizCompleteRequest {
  quiz_id: string;
  user_id: string;
  answers: Array<{
    question_number: number;
    question: string;
    selected_answer: number;
    correct_answer: number;
    is_correct: boolean;
    topic: string;
    explanation: string;
  }>;
  time_taken?: number;
}

export interface QuizFinalResult {
  quiz_id: string;
  score_percentage: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  weak_topics: string[];
  recommendations: string[];
  detailed_answers: Array<any>;
}

export interface FlashcardGenerateRequest {
  user_id: string;
  mode: 'topic_select' | 'free_text';
  topic?: string;
  num_cards?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
}

export interface FlashcardResponse {
  term: string;
  definition: string;
  example?: string;
  topic: string;
}

export interface FlashcardReviewRequest {
  deck_id: string;
  card_index: number;
  knew_it: boolean;
}

export interface DeckProgressResponse {
  deck_id: string;
  total_cards: number;
  reviewed: number;
  known: number;
  learning: number;
  remaining: number;
}

export interface TopicInfo {
  name: string;
  subject: string;
  full_name: string;
  chunks?: number;
}

// ==================== API METHODS ====================

export const api = {
  // ========== CHAT ==========
  chat: {
    sendMessage: async (data: ChatMessage): Promise<ChatResponse> => {
      const response = await apiClient.post<ChatResponse>('/chat', data);
      return response.data;
    },

    getHistory: async (userId: string, language = 'ru', limit = 10) => {
      const response = await apiClient.get(`/history/${userId}`, {
        params: { language, limit },
      });
      return response.data;
    },

    clearSession: async (userId: string, language = 'ru') => {
      const response = await apiClient.delete(`/session/${userId}`, {
        params: { language },
      });
      return response.data;
    },
  },

  // ========== QUIZ ==========
  quiz: {
    getTopics: async (language = 'ru'): Promise<TopicInfo[]> => {
      const response = await apiClient.get<TopicInfo[]>('/quiz/topics', {
        params: { language },
      });
      return response.data;
    },

    generateQuiz: async (data: QuizGenerateRequest) => {
      const response = await apiClient.post('/quiz/generate', data);
      return response.data;
    },

    getQuestion: async (quizId: string, questionNumber: number): Promise<QuizQuestion> => {
      const response = await apiClient.get<QuizQuestion>(
        `/quiz/${quizId}/question/${questionNumber}`
      );
      return response.data;
    },

    submitAnswer: async (data: QuizAnswerSubmit): Promise<QuizAnswerResponse> => {
      const response = await apiClient.post<QuizAnswerResponse>('/quiz/answer', data);
      return response.data;
    },

    completeQuiz: async (data: QuizCompleteRequest): Promise<QuizFinalResult> => {
      const response = await apiClient.post<QuizFinalResult>('/quiz/complete', data);
      return response.data;
    },

    getHistory: async (userId: string, limit = 10) => {
      const response = await apiClient.get(`/quiz/history/${userId}`, {
        params: { limit },
      });
      return response.data;
    },

    getStats: async (userId: string) => {
      const response = await apiClient.get(`/quiz/stats/${userId}`);
      return response.data;
    },
  },

  // ========== FLASHCARDS ==========
  flashcards: {
    getTopics: async (language = 'ru') => {
      const response = await apiClient.get('/flashcards/topics', {
        params: { language },
      });
      return response.data;
    },

    generateDeck: async (data: FlashcardGenerateRequest) => {
      const response = await apiClient.post('/flashcards/generate', data);
      return response.data;
    },

    getCard: async (deckId: string, cardIndex: number): Promise<FlashcardResponse> => {
      const response = await apiClient.get<FlashcardResponse>(
        `/flashcards/${deckId}/card/${cardIndex}`
      );
      return response.data;
    },

    reviewCard: async (data: FlashcardReviewRequest) => {
      const response = await apiClient.post('/flashcards/review', data);
      return response.data;
    },

    getProgress: async (deckId: string): Promise<DeckProgressResponse> => {
      const response = await apiClient.get<DeckProgressResponse>(
        `/flashcards/${deckId}/progress`
      );
      return response.data;
    },

    completeSession: async (deckId: string, userId: string) => {
      const response = await apiClient.post(`/flashcards/${deckId}/complete`, null, {
        params: { user_id: userId },
      });
      return response.data;
    },

    getHistory: async (userId: string, limit = 10) => {
      const response = await apiClient.get(`/flashcards/history/${userId}`, {
        params: { limit },
      });
      return response.data;
    },

    getStats: async (userId: string) => {
      const response = await apiClient.get(`/flashcards/stats/${userId}`);
      return response.data;
    },
  },

  // ========== GENERAL ==========
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  getStats: async (language = 'ru') => {
    const response = await apiClient.get('/stats', {
      params: { language },
    });
    return response.data;
  },

  getSummary: async (userId: string, topic: string, language = 'ru') => {
    const response = await apiClient.post('/summary', {
      user_id: userId,
      topic,
      language,
    });
    return response.data;
  },
};

export default api;
