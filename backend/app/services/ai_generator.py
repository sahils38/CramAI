import json
from typing import List
from groq import Groq
from app.config import settings
from app.models import NoteSection, QuizQuestion, QuizOption


class AIGeneratorService:
    """
    Handles AI-powered content generation.

    Currently uses Groq (free tier with Llama 3).
    Can be swapped to OpenAI, Anthropic, or Google Gemini.
    """

    def __init__(self):
        if settings.groq_api_key:
            self.client = Groq(api_key=settings.groq_api_key)
        else:
            self.client = None

    async def generate_notes(self, transcript: str) -> List[NoteSection]:
        """
        Generate structured study notes from transcript.

        Args:
            transcript: The lecture transcript

        Returns:
            List of note sections with titles and bullet points
        """
        if not self.client:
            raise Exception("Groq API key not configured. Add GROQ_API_KEY to .env")

        prompt = f"""You are an expert at creating study notes from lecture transcripts.

Given the following lecture transcript, create comprehensive study notes.

TRANSCRIPT:
{transcript}

Create structured notes with the following format:
1. Break the content into logical sections
2. Each section should have a clear title
3. Include 3-6 bullet points per section with key concepts
4. Add a final "Key Takeaways" section

Respond in JSON format:
{{
    "sections": [
        {{
            "title": "Section Title",
            "content": ["bullet point 1", "bullet point 2", ...]
        }}
    ]
}}

Only respond with valid JSON, no other text."""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000
        )

        result = json.loads(response.choices[0].message.content)

        return [
            NoteSection(title=s["title"], content=s["content"])
            for s in result["sections"]
        ]

    async def generate_quiz(
        self, transcript: str, notes: List[NoteSection], num_questions: int = 5
    ) -> List[QuizQuestion]:
        """
        Generate quiz questions from transcript and notes.

        Args:
            transcript: The lecture transcript
            notes: Generated notes for context
            num_questions: Number of questions to generate

        Returns:
            List of quiz questions with options
        """
        if not self.client:
            raise Exception("Groq API key not configured. Add GROQ_API_KEY to .env")

        notes_text = "\n".join([
            f"{s.title}:\n" + "\n".join(f"- {c}" for c in s.content)
            for s in notes
        ])

        prompt = f"""You are an expert educator creating quiz questions.

Based on the following lecture content, create {num_questions} multiple choice questions.

NOTES:
{notes_text}

TRANSCRIPT EXCERPT:
{transcript[:3000]}

Create questions that:
1. Test understanding of key concepts
2. Have 4 options each (A, B, C, D)
3. Have clear correct answers
4. Include explanations for why the answer is correct

Respond in JSON format:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Question text?",
            "options": [
                {{"id": "A", "text": "Option A"}},
                {{"id": "B", "text": "Option B"}},
                {{"id": "C", "text": "Option C"}},
                {{"id": "D", "text": "Option D"}}
            ],
            "correct_answer": "A",
            "explanation": "Explanation of why A is correct..."
        }}
    ]
}}

Only respond with valid JSON, no other text."""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=2000
        )

        result = json.loads(response.choices[0].message.content)

        return [
            QuizQuestion(
                id=q["id"],
                question=q["question"],
                options=[QuizOption(**opt) for opt in q["options"]],
                correct_answer=q["correct_answer"],
                explanation=q["explanation"]
            )
            for q in result["questions"]
        ]

    async def summarize_for_tts(self, notes: List[NoteSection]) -> str:
        """
        Create a natural-sounding summary for text-to-speech.

        Args:
            notes: The generated notes

        Returns:
            Text optimized for audio narration
        """
        if not self.client:
            # Fallback: just concatenate notes
            return self._notes_to_text(notes)

        notes_text = self._notes_to_text(notes)

        prompt = f"""Convert these study notes into a natural, conversational summary
suitable for audio narration. Make it sound like a helpful tutor explaining the material.

NOTES:
{notes_text}

Create a flowing summary that:
1. Sounds natural when read aloud
2. Maintains all key information
3. Uses transitions between topics
4. Is 2-3 minutes when spoken (~300-400 words)

Just provide the summary text, no other formatting."""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )

        return response.choices[0].message.content

    def _notes_to_text(self, notes: List[NoteSection]) -> str:
        """Convert notes to plain text."""
        text_parts = []
        for section in notes:
            text_parts.append(f"{section.title}.")
            for point in section.content:
                text_parts.append(point)
        return " ".join(text_parts)
