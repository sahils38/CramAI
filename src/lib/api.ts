const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface NoteSection {
  title: string;
  content: string[];
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string;
}

export interface UploadResponse {
  task_id: string;
  message: string;
}

export interface StatusResponse {
  task_id: string;
  status: string;
  progress: number;
  current_step: string;
}

export interface ResultsResponse {
  task_id: string;
  notes: NoteSection[];
  quiz: QuizQuestion[];
  audio_url: string;
}

export const api = {
  async uploadVideo(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  },

  async getStatus(taskId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE_URL}/api/status/${taskId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get status");
    }

    return response.json();
  },

  async getResults(taskId: string): Promise<ResultsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/results/${taskId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get results");
    }

    return response.json();
  },

  getAudioUrl(taskId: string): string {
    return `${API_BASE_URL}/api/audio/${taskId}`;
  },

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/task/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete task");
    }
  },
};
