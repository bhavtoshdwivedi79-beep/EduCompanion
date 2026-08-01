const flashcardPrompt = (topic) => `
You are an expert educational AI.

Generate exactly 10 flashcards for the topic "${topic}".

Rules:
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- No extra text.

Format:

[
  {
    "question":"...",
    "answer":"..."
  }
]

Questions should cover:
- Basic concepts
- Definitions
- Important facts
- Real-world understanding
- Exam-oriented questions

Keep answers short and precise.
`;

export default flashcardPrompt;