from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    EXTRACTING_AUDIO = "extracting_audio"
    TRANSCRIBING = "transcribing"
    GENERATING_NOTES = "generating_notes"
    CREATING_VOICE = "creating_voice"
    BUILDING_QUIZ = "building_quiz"
    COMPLETED = "completed"
    FAILED = "failed"


class NoteSection(BaseModel):
    title: str
    content: List[str]


class QuizOption(BaseModel):
    id: str
    text: str


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[QuizOption]
    correct_answer: str
    explanation: str


class ProcessingResult(BaseModel):
    status: ProcessingStatus
    progress: int  # 0-100
    current_step: str
    notes: Optional[List[NoteSection]] = None
    quiz: Optional[List[QuizQuestion]] = None
    audio_url: Optional[str] = None
    error: Optional[str] = None


class UploadResponse(BaseModel):
    task_id: str
    message: str


class StatusResponse(BaseModel):
    task_id: str
    status: ProcessingStatus
    progress: int
    current_step: str


class ResultsResponse(BaseModel):
    task_id: str
    notes: List[NoteSection]
    quiz: List[QuizQuestion]
    audio_url: str
