import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, Clipboard, Copy, Menu, Moon, MoreHorizontal, Paperclip, Plus, Search, Send, Sparkles, Sun, Trash2, X, Zap } from "lucide-react";

type Role = "user" | "assistant";
type Message = { id: number; role: Role; content: string; time: string; error?: boolean };
type Conversation = { id: number; title: string; group: string; preview: string };

const conversations: Conversation[] = [
  { id: 1, title: "Q3 launch strategy", group: "Today", preview: "Help me turn these signals into a launch plan..." },
  { id: 2, title: "Analyze user feedback", group: "Today", preview: "I found three themes across the latest calls..." },
  { id: 3, title: "Competitive landscape", group: "Yesterday", preview: "The market is shifting toward context-aware..." },
  { id: 4, title: "Rewrite product narrative", group: "Yesterday", preview: "Here is a tighter version of the story..." },
  { id: 5, title: "Customer research synthesis", group: "Previous 7 days", preview: "The strongest pattern in the research is..." },
];

const initialMessages: Message[] = [
  { id: 1, role: "user", time: "10:42 AM", content: "I have customer interviews, product analytics, and competitor notes scattered across my workspace. What should I focus on for our Q3 launch?" },
  { id: 2, role: "assistant", time: "10:42 AM", content: `## Your clearest launch signal

Across **248 product feedback items**, 34 customer calls, and the competitive set, one opportunity is unusually consistent:

> Teams don't need more features — they need to reach value faster.

I'd focus your Q3 launch around three moves:

1. **Lead with time-to-value.** Make the first meaningful outcome visible in the first session.
2. **Prove the workflow.** Show the path from raw context to a decision, not a feature list.
3. **Create a feedback loop.** Turn launch conversations into structured signals for the next iteration.


the launch thesis could be as simple as:


do something remarkable with the context you already have
`, },
];

function formatTime() { return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()); }

function CodeBlock({ language, value }: { language?: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard?.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <div className="code-block"><div className="code-header"><span><i />{language || "text"}</span><button onClick={copy}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button></div><SyntaxHighlighter language={language || "text"} style={oneDark} customStyle={{ margin: 0, padding: "16px", background: "transparent", fontSize: "12px", lineHeight: 1.7 }} wrapLongLines>{value}</SyntaxHighlighter></div>;
}

function MessageBody({ content }: { content: string }) {
  return <ReactMarkdown components={{ code({ className, children, ...props }) { const match = /language-(\w+)/.exec(className || ""); const value = String(children).replace(/\n$/, ""); return match ? <CodeBlock language={match[1]} value={value} /> : <code className="inline-code" {...props}>{children}</code>; }, blockquote({ children }) { return <blockquote>{children}</blockquote>; }, h2({ children }) { return <h2>{children}</h2>; }, strong({ children }) { return <strong>{children}</strong>; } }}>{content}</ReactMarkdown>;
}

function TypingIndicator() { return <div className="typing"><span /><span /><span /><em>Thinking through your workspace...</em></div>; }

export default function Index() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(1);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, generating]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);

  const submit = (value = input) => {
    const trimmed = value.trim();
    if (!trimmed || generating) return;
    setError(false);
    setMessages((current) => [...current, { id: Date.now(), role: "user", content: trimmed, time: formatTime() }]);
    setInput("");
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", time: formatTime(), content: `## I found a useful angle\n\nYour question is connected to the **time-to-value** signal already emerging in this workspace. I'd structure the next step around a small, testable move:\n\n- Gather the five highest-intent customer examples\n- Compare their first successful outcome\n- Turn the pattern into one launch message\n\nThat gives the team a clear story to validate instead of another broad strategy doc.\n\n\`\`\`json\n{\n  "signal": "time-to-value",\n  "confidence": 0.87,\n  "next_step": "validate with 5 customers"\n}\n\`\`\`` }]);
    }, 1800);
  };

  const newChat = () => { setActiveConversation(0); setMessages([]); setInput(""); setSidebarOpen(false); };
  const selectChat = (id: number) => { setActiveConversation(id); setMessages(id === 1 ? initialMessages : [{ id: Date.now(), role: "assistant", time: formatTime(), content: `## ${conversations.find((item) => item.id === id)?.title || "New conversation"}\n\nI’m ready to work with the signals in your workspace. What would you like to understand?` }]); setSidebarOpen(false); };

  return <div className={`chat-app ${dark ? "is-dark" : "is-light"}`}>
    <AnimatePresence>{sidebarOpen && <motion.button className="sidebar-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}</AnimatePresence>
    <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-head"><button className="chat-brand" onClick={newChat}><span className="brand-glyph">x</span><span>ai</span></button><button className="close-sidebar" onClick={() => setSidebarOpen(false)}><X size={17}/></button></div>
      <button className="new-chat" onClick={newChat}><Plus size={15}/> New conversation <kbd>⌘ K</kbd></button>
      <div className="history-search"><Search size={14}/><input placeholder="Search conversations" /></div>
      <div className="history-list">{["Today", "Yesterday", "Previous 7 days"].map((group) => <div className="history-group" key={group}><span className="history-label">{group}</span>{conversations.filter((item) => item.group === group).map((conversation) => <button className={`history-item ${activeConversation === conversation.id ? "active" : ""}`} onClick={() => selectChat(conversation.id)} key={conversation.id}><span>{conversation.title}</span><small>{conversation.preview}</small></button>)}</div>)}</div>
      <div className="sidebar-bottom"><button><Sparkles size={15}/> Explore Xai</button><button><Trash2 size={15}/> Clear conversations</button><div className="user-profile"><div className="profile-avatar">NR</div><div><b>Nimur Rahman</b><small>Personal workspace</small></div><MoreHorizontal size={16}/></div></div>
    </aside>
    <section className="chat-main">
      <header className="chat-header"><div className="header-left"><button className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><div className="thread-title"><span className="status-dot"/><div><b>{activeConversation === 1 ? "Q3 launch strategy" : activeConversation === 0 ? "New conversation" : conversations.find((item) => item.id === activeConversation)?.title}</b><small>Private workspace · Xai Intelligence</small></div></div></div><div className="header-actions"><button title="Search"><Search size={17}/></button><button title="Share"><span className="share-icon">↗</span></button><button title="Toggle theme" onClick={() => setDark((value) => !value)}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button><button title="More"><MoreHorizontal size={18}/></button></div></header>
      <main className="conversation" aria-live="polite"><div className="conversation-inner"><div className="welcome"><div className="welcome-mark"><Zap size={18}/></div><span>THREAD STARTED TODAY</span></div><div className="messages">{messages.length === 0 && <div className="empty-state"><h1>What can I help you <em>see?</em></h1><p>Bring your questions, signals, and scattered context. Xai will help you turn them into a clear next move.</p><div className="suggestion-grid"><button onClick={() => submit("Summarize the strongest signal in my workspace")}>Summarize my strongest signal <ArrowUp size={14}/></button><button onClick={() => submit("What should I focus on this week?")}>What should I focus on this week? <ArrowUp size={14}/></button></div></div>}{messages.map((message) => <motion.article className={`message ${message.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }} key={message.id}><div className="message-avatar">{message.role === "assistant" ? <span className="mini-glyph">x</span> : "NR"}</div><div className="message-content"><div className="message-meta"><b>{message.role === "assistant" ? "Xai" : "You"}</b><time>{message.time}</time>{message.role === "assistant" && <span className="context-chip"><Sparkles size={10}/> Workspace context</span>}</div><div className="markdown"><MessageBody content={message.content}/></div>{message.role === "assistant" && <div className="message-tools"><button onClick={() => navigator.clipboard?.writeText(message.content)}><Clipboard size={13}/> Copy response</button><button><ShareIcon /> Share</button></div>}</div></motion.article>)}{generating && <motion.div className="message assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="message-avatar"><span className="mini-glyph">x</span></div><div className="message-content"><div className="message-meta"><b>Xai</b><span className="context-chip"><Sparkles size={10}/> Live synthesis</span></div><TypingIndicator/></div></motion.div>}{error && <div className="error-state">Something went wrong while synthesizing this response. <button onClick={() => setError(false)}>Try again</button></div>}<div ref={endRef}/></div></div></main>
      <div className="composer-wrap"><div className="composer-hint"><span><Zap size={11}/> Xai can make mistakes. Check important info.</span><span>Context: <b>All workspace</b>⌄</span></div><form className="composer" onSubmit={(event) => { event.preventDefault(); submit(); }}><textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Ask Xai anything..." rows={1}/><div className="composer-actions"><button type="button" title="Attach file"><Paperclip size={17}/></button><span className="composer-shortcut">Shift + Enter for new line</span><button className={`send-button ${input.trim() ? "ready" : ""}`} type="submit" disabled={!input.trim() || generating} aria-label="Send message"><Send size={16}/></button></div></form></div>
    </section>
  </div>;
}

function ShareIcon() { return <span className="share-icon">↗</span>; }
