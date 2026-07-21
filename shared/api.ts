/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Chat message type for the conversation
 */
export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

/**
 * Request to send to /api/chat
 */
export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
}

/**
 * Response from /api/chat
 */
export interface ChatResponse {
  message: string;
  error?: string;
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}
