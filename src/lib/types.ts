export interface Team {
  id: string;
  name: string;
  score: number;
  guessesCount: number;
  totalAccuracy: number;
}

export interface DetectedMeta {
  style: string;
  mood: string;
  needsTextFidelity: boolean;
  modelLabel: string;
}

export interface PromptEngineeringCriterion {
  id: string;
  label: string;
  maxScore: number;
  score: number;
  found: boolean;
  detectedElements: string[];
  feedback: string;
}

export interface PromptEngineeringEvaluation {
  totalScore: number; // 0 - 100
  level: "Pemula" | "Menengah" | "Mahir" | "Ahli Prompt";
  summary: string;
  criteria: {
    subject: PromptEngineeringCriterion;     // Subjek & Karakter/Objek (25 poin)
    environment: PromptEngineeringCriterion; // Latar Tempat & Lingkungan (20 poin)
    lighting: PromptEngineeringCriterion;    // Pencahayaan & Suasana (20 poin)
    style: PromptEngineeringCriterion;       // Gaya Visual & Medium (20 poin)
    composition: PromptEngineeringCriterion; // Komposisi & Detail Teknis (15 poin)
  };
  suggestions: string[];
}

export interface ScoreData {
  totalScore: number; // Skor akhir ronde yang diakumulasikan (+ koreksi juri)
  similarityScore?: number; // Nilai 1: Kemiripan Rekonstruksi (0 - 100)
  topicScore: number; // Subjek & Objek (0 - 40 poin)
  styleScore: number; // Gaya & Suasana (0 - 35 poin)
  constraintScore: number; // Komposisi & Detail (0 - 25 poin)
  matchedTokens: string[];
  feedback: string;
  peScore?: number; // Nilai 2: Kualitas Prompt Engineering (0 - 100)
  promptEngineering?: PromptEngineeringEvaluation;
}

export interface Submission {
  teamIndex: number;
  teamName: string;
  guessedPrompt: string;
  generatedImageUrl?: string;
  imageSource?: string;
  englishPrompt?: string;
  isGeneratingImage?: boolean;
  scoreData: ScoreData;
}

export interface RoundHistoryItem {
  roundNumber: number;
  makerName: string;
  secretPrompt: string;
  generatedImageUrl?: string;
  secretPromptPE?: PromptEngineeringEvaluation;
  submissions: Submission[];
}

export interface RoundData {
  secretPrompt: string;
  generatedImageUrl: string;
  imageSource?: string;
  englishPrompt?: string;
  detectedMeta: DetectedMeta | null;
  secretPromptPE?: PromptEngineeringEvaluation;
  makerName: string;
  guessingQueue: number[];
  activeGuesserCursor: number;
  submissions: Submission[];
}

export type GameView =
  | "setup"
  | "create_prompt"
  | "guessing"
  | "results"
  | "final_standings";

export type RoomStatus =
  | "LOBBY"
  | "ROUND_MAKING"
  | "ROUND_DISCUSSION"
  | "ROUND_GUESSING"
  | "ROUND_RESULTS"
  | "FINAL_STANDINGS";

export interface RoomState {
  roomCode: string;
  status: RoomStatus;
  currentRound: number;
  totalRounds: number;
  makerTeamId: string | null;
  makerTeamName: string | null;
  secretPrompt: string;
  generatedImageUrl: string;
  imageSource?: string;
  englishPrompt?: string;
  detectedMeta: DetectedMeta | null;
  secretPromptPE?: PromptEngineeringEvaluation | null;
  makerDuration: number;
  discussionDuration: number;
  guessDuration: number;
  timerEndsAt: string | null;
  timerRemaining: number | null;
  timerPaused: boolean;
  aiModel: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MultiplayerTeam {
  id: string;
  room_code: string;
  name: string;
  score: number;
  guesses_count: number;
  total_accuracy: number;
  is_connected: boolean;
  created_at?: string;
}

export interface MultiplayerSubmission {
  id: string;
  room_code: string;
  round_number: number;
  team_id: string;
  team_name: string;
  guessed_prompt: string;
  score_data: ScoreData;
  generated_image_url?: string;
  image_source?: string;
  english_prompt?: string;
  submitted_at?: string;
}


export interface MultiplayerFeedback {
  id: string;
  room_code: string;
  team_id: string;
  team_name: string;
  rating: number;
  today_feedback: string;
  future_feedback: string;
  created_at?: string;
  updated_at?: string;
}

export interface MultiplayerPostTest {
  id: string;
  room_code: string;
  team_id: string;
  team_name: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiConfig {
  workerUrl: string;
  accountId: string;
  apiToken: string;
  agnesApiKey: string;
  selectedModel: string;
}

