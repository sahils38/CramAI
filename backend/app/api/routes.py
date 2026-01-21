import os
import uuid
import asyncio
from typing import Dict
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from app.config import settings
from app.models import (
    UploadResponse,
    StatusResponse,
    ResultsResponse,
    ProcessingStatus,
    NoteSection,
    QuizQuestion
)
from app.services import (
    VideoProcessor,
    TranscriptionService,
    AIGeneratorService,
    TTSService
)

router = APIRouter()

# In-memory task storage (use Redis/DB in production)
tasks: Dict[str, dict] = {}

# Service instances
video_processor = VideoProcessor()
transcription_service = TranscriptionService()
ai_generator = AIGeneratorService()
tts_service = TTSService()


async def process_video_task(task_id: str, video_path: str):
    """Background task to process video through the full pipeline."""
    try:
        # Step 1: Extract audio
        tasks[task_id]["status"] = ProcessingStatus.EXTRACTING_AUDIO
        tasks[task_id]["progress"] = 10
        tasks[task_id]["current_step"] = "Extracting audio from video..."

        audio_path = await video_processor.extract_audio(video_path, task_id)

        # Step 2: Transcribe
        tasks[task_id]["status"] = ProcessingStatus.TRANSCRIBING
        tasks[task_id]["progress"] = 30
        tasks[task_id]["current_step"] = "Transcribing speech to text..."

        transcript = await transcription_service.transcribe(audio_path)

        # Step 3: Generate notes
        tasks[task_id]["status"] = ProcessingStatus.GENERATING_NOTES
        tasks[task_id]["progress"] = 50
        tasks[task_id]["current_step"] = "Generating study notes..."

        notes = await ai_generator.generate_notes(transcript)
        tasks[task_id]["notes"] = notes

        # Step 4: Create voice summary
        tasks[task_id]["status"] = ProcessingStatus.CREATING_VOICE
        tasks[task_id]["progress"] = 70
        tasks[task_id]["current_step"] = "Creating voice summary..."

        summary_text = await ai_generator.summarize_for_tts(notes)
        voice_path = await tts_service.generate_audio(summary_text, task_id)
        tasks[task_id]["audio_path"] = voice_path

        # Step 5: Generate quiz
        tasks[task_id]["status"] = ProcessingStatus.BUILDING_QUIZ
        tasks[task_id]["progress"] = 90
        tasks[task_id]["current_step"] = "Building interactive quiz..."

        quiz = await ai_generator.generate_quiz(transcript, notes)
        tasks[task_id]["quiz"] = quiz

        # Done!
        tasks[task_id]["status"] = ProcessingStatus.COMPLETED
        tasks[task_id]["progress"] = 100
        tasks[task_id]["current_step"] = "Processing complete!"

        # Cleanup uploaded video
        video_processor.cleanup(video_path, audio_path)

    except Exception as e:
        tasks[task_id]["status"] = ProcessingStatus.FAILED
        tasks[task_id]["error"] = str(e)
        tasks[task_id]["current_step"] = f"Error: {str(e)}"


@router.post("/upload", response_model=UploadResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a video file for processing.
    Returns a task_id to track progress.
    """
    # Validate file type
    allowed_types = ["video/mp4", "video/avi", "video/mov", "video/x-matroska"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: MP4, AVI, MOV, MKV"
        )

    # Generate task ID
    task_id = str(uuid.uuid4())

    # Save uploaded file
    video_path = os.path.join(settings.upload_dir, f"{task_id}_{file.filename}")
    with open(video_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Check file size
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.max_file_size_mb:
        os.remove(video_path)
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB"
        )

    # Initialize task
    tasks[task_id] = {
        "status": ProcessingStatus.PENDING,
        "progress": 0,
        "current_step": "Queued for processing...",
        "notes": None,
        "quiz": None,
        "audio_path": None,
        "error": None
    }

    # Start background processing
    background_tasks.add_task(process_video_task, task_id, video_path)

    return UploadResponse(
        task_id=task_id,
        message="Video uploaded successfully. Processing started."
    )


@router.get("/status/{task_id}", response_model=StatusResponse)
async def get_status(task_id: str):
    """Get the current processing status of a task."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks[task_id]
    return StatusResponse(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        current_step=task["current_step"]
    )


@router.get("/results/{task_id}", response_model=ResultsResponse)
async def get_results(task_id: str):
    """Get the processing results for a completed task."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks[task_id]

    if task["status"] == ProcessingStatus.FAILED:
        raise HTTPException(status_code=500, detail=task["error"])

    if task["status"] != ProcessingStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Task not completed. Current status: {task['status']}"
        )

    return ResultsResponse(
        task_id=task_id,
        notes=task["notes"],
        quiz=task["quiz"],
        audio_url=f"/api/audio/{task_id}"
    )


@router.get("/audio/{task_id}")
async def get_audio(task_id: str):
    """Stream the generated voice summary audio."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks[task_id]
    if not task.get("audio_path") or not os.path.exists(task["audio_path"]):
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        task["audio_path"],
        media_type="audio/mpeg",
        filename=f"cramAI_voice_{task_id}.mp3"
    )


@router.delete("/task/{task_id}")
async def delete_task(task_id: str):
    """Delete a task and its associated files."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks[task_id]

    # Cleanup files
    if task.get("audio_path"):
        video_processor.cleanup(task["audio_path"])

    del tasks[task_id]

    return {"message": "Task deleted successfully"}
