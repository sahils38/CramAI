import whisper
from app.config import settings


class TranscriptionService:
    """
    Handles speech-to-text transcription.

    Currently uses local Whisper (free).
    Can be swapped to Replicate API or OpenAI Whisper API for production.
    """

    def __init__(self):
        self._model = None

    @property
    def model(self):
        """Lazy load Whisper model."""
        if self._model is None:
            print(f"Loading Whisper model: {settings.whisper_model}")
            self._model = whisper.load_model(settings.whisper_model)
        return self._model

    async def transcribe(self, audio_path: str) -> str:
        """
        Transcribe audio file to text.

        Args:
            audio_path: Path to the audio file

        Returns:
            Transcribed text
        """
        # Local Whisper transcription (free)
        result = self.model.transcribe(
            audio_path,
            language="en",
            task="transcribe"
        )

        return result["text"]

    async def transcribe_with_timestamps(self, audio_path: str) -> dict:
        """
        Transcribe with word-level timestamps.
        Useful for syncing with video later.
        """
        result = self.model.transcribe(
            audio_path,
            language="en",
            task="transcribe",
            word_timestamps=True
        )

        return {
            "text": result["text"],
            "segments": result["segments"]
        }


# For future production use:
#
# class ReplicateTranscriptionService(TranscriptionService):
#     """Use Replicate API for Whisper (cheap, scalable)."""
#
#     async def transcribe(self, audio_path: str) -> str:
#         import replicate
#         output = replicate.run(
#             "openai/whisper:large-v3",
#             input={"audio": open(audio_path, "rb")}
#         )
#         return output["transcription"]
