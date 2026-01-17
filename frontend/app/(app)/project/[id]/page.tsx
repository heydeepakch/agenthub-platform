"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { API_URL } from "@/config/api";

export default function ProjectPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [msg, setMsg] = useState("");
  const [project, setProject] = useState<{
    id: string;
    name: string;
    prompt: string;
  } | null>(null);
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { messages, ...projectData } = res.data;
      setProject(projectData); // Gets id, name, prompt
      setChat(messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token && id) load();
  }, [id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const send = () => {
    if (!msg.trim() || streaming) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const userMsg = msg;
    setMsg("");
    setChat((prev) => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);

    const eventSource = new EventSource(
      `${API_URL}/api/chat/stream/${id}?message=${encodeURIComponent(
        userMsg
      )}&token=${token}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (e) => {
      if (e.data === "[DONE]") {
        eventSource.close();
        eventSourceRef.current = null;
        setStreaming(false);
        return;
      }

      setChat((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + e.data },
          ];
        }
        return [...prev, { role: "assistant", content: e.data }];
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;
      setStreaming(false);
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div
      className="container"
      style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/dashboard"
          className="text-muted"
          style={{ fontSize: "0.875rem" }}
        >
          ← Back to agents
        </Link>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>{project?.name || "Loading..."}</h2>
        {/* {project?.prompt && (
          <p
            className="text-muted"
            style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}
          >
            {project.prompt.slice(0, 100)}
            {project.prompt.length > 100 ? "..." : ""}
          </p>
        )} */}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chat.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet</p>
              <p className="text-muted">Start a conversation with your agent</p>
            </div>
          ) : (
            chat.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                {m.role === "user" ? (
                  m.content
                ) : (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={streaming}
          />
          <button onClick={send} disabled={streaming || !msg.trim()}>
            {streaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
