import { RequestHandler } from "express";

interface OpenAIChoice {
  index: number;
  message: {
    role: "assistant";
    content: string;
  };
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "OpenAI API key not configured" });
      return;
    }

    const systemMessage = {
      role: "system",
      content:
        "You are Xai, an intelligence workspace assistant. You help users analyze signals, synthesize information, and make decisions. You respond concisely and insightfully, using markdown formatting where helpful. You can write code blocks, use bullet points, and provide structured analysis.",
    };

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      res.status(502).json({
        error: `OpenAI API error: ${response.status}`,
        message: "I encountered an error processing your request. Please try again.",
      });
      return;
    }

    const data = (await response.json()) as OpenAIResponse;
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      res.status(502).json({
        error: "No response from OpenAI",
        message: "I received an empty response. Please try again.",
      });
      return;
    }

    res.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong. Please try again.",
    });
  }
};

