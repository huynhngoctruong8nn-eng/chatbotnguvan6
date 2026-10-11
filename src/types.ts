export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  lessonTag?: string;
}

export interface LessonTopic {
  id: string;
  lessonNumber: number;
  title: string;
  theme: string;
  texts: string[];
  grammar: string[];
  writing: string;
  sampleQuestions: {
    question: string;
    category: 'doc-hieu' | 'tieng-viet' | 'tap-lam-van' | 'de-thi';
  }[];
}

export interface DocumentInfo {
  filename: string;
  title: string;
  totalLessons: number;
  isCustom: boolean;
  uploadedAt?: string;
  charCount: number;
}
