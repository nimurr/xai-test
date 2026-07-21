import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Check,
  Clipboard,
  Copy,
  Menu,
  Moon,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  Sun,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type { ChatMessage } from "@shared/api";

// ── Types ─────────────────────────────────────────────
type Conversation = {
  id: number;
  title: string;
  group: string;
  preview: string;
  messages: ChatMessage[];
};

// ── Helpers ───────────────────────────────────────────
function formatTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function getGroupLabel(): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // We'll set this per-conversation based on creation timestamp
  return "Today";
}

function computeGroup(timestamp: number): string {
  const now = Date.now();
  const msInDay = 86400000;
  const diff = now - timestamp;
  if (diff < msInDay) return "Today";
  if (diff < 2 * msInDay) return "Yesterday";
  if (diff < 7 * msInDay) return "Previous 7 days";
  return "Older";
}

// ── Storage ───────────────────────────────────────────
const STORAGE_KEY = "xai-conversations";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Conversation[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveConversations(list: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ── Code block component ──────────────────────────────
function CodeBlock({
  language,
  value,
}: {
  language?: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="code-block">
      <div className="code-header">
        <span>
          <i />
          {language || "text"}
        </span>
        <button onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "16px",
          background: "transparent",
          fontSize: "12px",
          lineHeight: 1.7,
        }}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown renderer ─────────────────────────────────
function MessageBody({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const value = String(children).replace(/\n$/, "");
          return match ? (
            <CodeBlock language={match[1]} value={value} />
          ) : (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        },
        blockquote({ children }) {
          return <blockquote>{children}</blockquote>;
        },
        h2({ children }) {
          return <h2>{children}</h2>;
        },
        strong({ children }) {
          return <strong>{children}</strong>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Typing indicator ──────────────────────────────────
function TypingIndicator() {
  return (
    <div className="typing">
      <span />
      <span />
      <span />
      <em>Thinking through your workspace...</em>
    </div>
  );
}

// ── Share icon ────────────────────────────────────────
function ShareIcon() {
  return <span className="share-icon">↗</span>;
}

// ── API call ──────────────────────────────────────────
async function sendChatMessages(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.message as string;
}

// ── Main component ────────────────────────────────────
export default function Index() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from storage on mount
  useEffect(() => {
    const saved = loadConversations();
    setConversations(saved);
    if (saved.length > 0) {
      setActiveId(saved[0].id);
      setMessages(saved[0].messages);
    }
  }, []);

  // Persist conversations when they change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  // Theme
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  // Update conversation title from first user message
  const updateTitle = useCallback(
    (id: number, userMessage: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                title:
                  c.title === "New conversation"
                    ? userMessage.slice(0, 40) +
                      (userMessage.length > 40 ? "..." : "")
                    : c.title,
                preview:
                  c.preview === ""
                    ? userMessage.slice(0, 60) +
                      (userMessage.length > 60 ? "..." : "")
                    : c.preview,
              }
            : c
        )
      );
    },
    []
  );

  // New conversation
  const newChat = () => {
    const newConv: Conversation = {
      id: Date.now(),
      title: "New conversation",
      group: "Today",
      preview: "",
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setMessages([]);
    setInput("");
    setError(null);
    setSidebarOpen(false);
  };

  // Select a conversation
  const selectChat = (id: number) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setActiveId(id);
      setMessages(conv.messages);
      setError(null);
    }
    setSidebarOpen(false);
  };

  // Delete a conversation
  const deleteChat = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        const next = filtered[0] || null;
        setActiveId(next ? next.id : null);
        setMessages(next ? next.messages : []);
      }
      return filtered;
    });
  };

  // Submit a message
  const submit = async (value = input) => {
    const trimmed = value.trim();
    if (!trimmed || generating) return;

    setError(null);

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      time: formatTime(),
    };

    // If no active conversation, create one
    let currentId = activeId;
    if (!currentId) {
      const newConv: Conversation = {
        id: Date.now(),
        title: "New conversation",
        group: "Today",
        preview: "",
        messages: [userMsg],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
      setMessages([userMsg]);
      setInput("");
      setGenerating(true);
      currentId = newConv.id;
      // Update title after first message
      updateTitle(newConv.id, trimmed);
    } else {
      // Append to existing
      setMessages((prev) => [...prev, userMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentId
            ? { ...c, messages: [...c.messages, userMsg] }
            : c
        )
      );
      setInput("");
      setGenerating(true);
      updateTitle(currentId, trimmed);
    }

    // Build message history for API
    const allMessages = messages.concat(userMsg);

    try {
      const reply = await sendChatMessages(
        allMessages.map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        time: formatTime(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentId
            ? { ...c, messages: [...c.messages, assistantMsg], group: computeGroup(c.id) }
            : c
        )
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);

      // Add error assistant message
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `I encountered an error: ${errorMessage}. Please try again.`,
        time: formatTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentId
            ? { ...c, messages: [...c.messages, errorMsg] }
            : c
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  // Clear all conversations
  const clearAllConversations = () => {
    setConversations([]);
    setActiveId(null);
    setMessages([]);
    setError(null);
  };

  const activeConv = conversations.find((c) => c.id === activeId);
  const groupedConvs = useMemoGroup(conversations);

  return (
    <div className={`chat-app ${dark ? "is-dark" : "is-light"}`}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <button className="chat-brand" onClick={newChat}>
            <span className="brand-glyph">x</span>
            <span>ai</span>
          </button>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={17} />
          </button>
        </div>

        <button className="new-chat" onClick={newChat}>
          <Plus size={15} /> New conversation <kbd>⌘ K</kbd>
        </button>

        <div className="history-search">
          <Search size={14} />
          <input placeholder="Search conversations" />
        </div>

        <div className="history-list">
          {conversations.length === 0 && (
            <div style={{ padding: "20px 9px", color: "var(--faint)", fontSize: "10px", textAlign: "center" }}>
              No conversations yet. Start a new chat!
            </div>
          )}
          {(["Today", "Yesterday", "Previous 7 days", "Older"] as const).map(
            (group) => {
              const items = groupedConvs[group];
              if (!items || items.length === 0) return null;
              return (
                <div className="history-group" key={group}>
                  <span className="history-label">{group}</span>
                  {items.map((conversation) => (
                    <button
                      className={`history-item ${activeId === conversation.id ? "active" : ""}`}
                      onClick={() => selectChat(conversation.id)}
                      key={conversation.id}
                    >
                      <span>{conversation.title}</span>
                      <small>{conversation.preview}</small>
                      <button
                        className="delete-conv-btn"
                        onClick={(e) => deleteChat(e, conversation.id)}
                        title="Delete conversation"
                      >
                        <X size={10} />
                      </button>
                    </button>
                  ))}
                </div>
              );
            }
          )}
        </div>

        <div className="sidebar-bottom">
          <button onClick={newChat}>
            <Sparkles size={15} /> Explore Xai
          </button>
          <button onClick={clearAllConversations}>
            <Trash2 size={15} /> Clear conversations
          </button>
          <div className="user-profile">
            <div className="profile-avatar">NR</div>
            <div>
              <b>Nimur Rahman</b>
              <small>Personal workspace</small>
            </div>
            <MoreHorizontal size={16} />
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <section className="chat-main">
        <header className="chat-header">
          <div className="header-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="thread-title">
              <span className="status-dot" />
              <div>
                <b>
                  {activeConv
                    ? activeConv.title
                    : "New conversation"}
                </b>
                <small>Private workspace · Xai Intelligence</small>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button title="Search">
              <Search size={17} />
            </button>
            <button title="Share">
              <span className="share-icon">↗</span>
            </button>
            <button
              title="Toggle theme"
              onClick={() => setDark((value) => !value)}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button title="More">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        <main className="conversation" aria-live="polite">
          <div className="conversation-inner">
            <div className="welcome">
              <div className="welcome-mark">
                <Zap size={18} />
              </div>
              <span>THREAD STARTED {activeConv ? computeGroup(activeConv.id).toUpperCase() : "TODAY"}</span>
            </div>

            <div className="messages">
              {messages.length === 0 && (
                <div className="empty-state">
                  <h1>
                    What can I help you <em>see?</em>
                  </h1>
                  <p>
                    Bring your questions, signals, and scattered context. Xai
                    will help you turn them into a clear next move.
                  </p>
                  <div className="suggestion-grid">
                    <button
                      onClick={() =>
                        submit(
                          "Summarize the strongest signal in my workspace"
                        )
                      }
                    >
                      Summarize my strongest signal <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() =>
                        submit("What should I focus on this week?")
                      }
                    >
                      What should I focus on this week?{" "}
                      <ArrowUp size={14} />
                    </button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.article
                  className={`message ${message.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={message.id}
                >
                  <div className="message-avatar">
                    {message.role === "assistant" ? (
                      <span className="mini-glyph">x</span>
                    ) : (
                      "NR"
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-meta">
                      <b>{message.role === "assistant" ? "Xai" : "You"}</b>
                      <time>{message.time}</time>
                      {message.role === "assistant" && (
                        <span className="context-chip">
                          <Sparkles size={10} /> Workspace context
                        </span>
                      )}
                    </div>
                    <div className="markdown">
                      <MessageBody content={message.content} />
                    </div>
                    {message.role === "assistant" && (
                      <div className="message-tools">
                        <button
                          onClick={() =>
                            navigator.clipboard?.writeText(message.content)
                          }
                        >
                          <Clipboard size={13} /> Copy response
                        </button>
                        <button>
                          <ShareIcon /> Share
                        </button>
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}

              {generating && (
                <motion.div
                  className="message assistant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-avatar">
                    <span className="mini-glyph">x</span>
                  </div>
                  <div className="message-content">
                    <div className="message-meta">
                      <b>Xai</b>
                      <span className="context-chip">
                        <Sparkles size={10} /> Live synthesis
                      </span>
                    </div>
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="error-state">
                  {error}{" "}
                  <button onClick={() => setError(null)}>Dismiss</button>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>
        </main>

        <div className="composer-wrap">
          <div className="composer-hint">
            <span>
              <Zap size={11} /> Xai can make mistakes. Check important info.
            </span>
            <span>
              Context: <b>All workspace</b>⌄
            </span>
          </div>
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask Xai anything..."
              rows={1}
            />
            <div className="composer-actions">
              <button type="button" title="Attach file">
                <Paperclip size={17} />
              </button>
              <span className="composer-shortcut">
                Shift + Enter for new line
              </span>
              <button
                className={`send-button ${input.trim() ? "ready" : ""}`}
                type="submit"
                disabled={!input.trim() || generating}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

// ── Hook for grouped conversations ────────────────────
function useMemoGroup(conversations: Conversation[]) {
  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };
  for (const conv of conversations) {
    const group = computeGroup(conv.id);
    if (!groups[group]) groups[group] = [];
    groups[group].push(conv);
  }
  return groups;
}

