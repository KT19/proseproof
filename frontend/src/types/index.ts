export interface Document {
  id: number;
  title: string;
  original_text: string;
  corrected_text?: string;
  tips?: string;
  score: number;
  word_count: number;
  character_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  corrected_text: string;
  tips: string[];
  score: number;
  errors_found: number;
}

export interface UserStats {
  total_documents: number;
  analyzed_documents: number;
  total_words: number;
  total_characters: number;
  average_score: number;
}

export interface HealthStatus {
  status: string;
  connected: boolean;
  model_available: boolean;
  message: string;
}
