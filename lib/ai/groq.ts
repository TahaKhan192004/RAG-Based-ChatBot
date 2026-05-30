import "server-only";

const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY.");
  }

  return apiKey;
}

function getGroqRequestBody(prompt: string, stream: boolean) {
  return {
    model: process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 500,
    stream,
  };
}

export async function generateGroqAnswer(prompt: string): Promise<string> {
  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getGroqApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getGroqRequestBody(prompt, false)),
  });

  const body = (await response.json().catch(() => null)) as
    | GroqChatResponse
    | null;

  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? `Groq request failed with ${response.status}.`,
    );
  }

  const answer = body?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("Groq returned an empty answer.");
  }

  return answer;
}

export async function streamGroqAnswer(
  prompt: string,
  onToken: (token: string) => void,
): Promise<string> {
  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getGroqApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getGroqRequestBody(prompt, true)),
  });

  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => null)) as
      | GroqChatResponse
      | null;
    throw new Error(
      body?.error?.message ?? `Groq request failed with ${response.status}.`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        continue;
      }

      const data = trimmed.slice(5).trim();

      if (data === "[DONE]") {
        continue;
      }

      const parsed = JSON.parse(data) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };
      const token = parsed.choices?.[0]?.delta?.content;

      if (token) {
        answer += token;
        onToken(token);
      }
    }
  }

  const trimmedAnswer = answer.trim();

  if (!trimmedAnswer) {
    throw new Error("Groq returned an empty answer.");
  }

  return trimmedAnswer;
}
