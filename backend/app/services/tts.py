import os
import edge_tts
from app.config import settings


class TTSService:
    """
    Handles text-to-speech conversion.

    Currently uses Edge-TTS (free, high quality Microsoft voices).
    Can be swapped to ElevenLabs, OpenAI TTS, or Google TTS.
    """

    def __init__(self):
        self.voice = settings.tts_voice
        self.output_dir = settings.output_dir

    async def generate_audio(self, text: str, task_id: str) -> str:
        """
        Convert text to speech audio.

        Args:
            text: Text to convert to speech
            task_id: Unique task identifier

        Returns:
            Path to the generated audio file
        """
        output_path = os.path.join(self.output_dir, f"{task_id}_voice.mp3")

        communicate = edge_tts.Communicate(text, self.voice)
        await communicate.save(output_path)

        return output_path

    async def list_voices(self, language: str = "en") -> list:
        """List available voices for a language."""
        voices = await edge_tts.list_voices()
        return [
            {"name": v["ShortName"], "gender": v["Gender"]}
            for v in voices
            if v["Locale"].startswith(language)
        ]


# Available English voices (Edge-TTS):
# - en-US-AriaNeural (Female, natural)
# - en-US-GuyNeural (Male, natural)
# - en-US-JennyNeural (Female, friendly)
# - en-GB-SoniaNeural (British Female)
# - en-AU-NatashaNeural (Australian Female)


# For future production use:
#
# class ElevenLabsTTSService(TTSService):
#     """Use ElevenLabs for premium voice quality."""
#
#     async def generate_audio(self, text: str, task_id: str) -> str:
#         from elevenlabs import generate, save
#         audio = generate(text=text, voice="Rachel", model="eleven_monolingual_v1")
#         output_path = os.path.join(self.output_dir, f"{task_id}_voice.mp3")
#         save(audio, output_path)
#         return output_path
