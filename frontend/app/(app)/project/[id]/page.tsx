"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { API_URL } from "@/config/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ProjectPage() {
  const { token } = useAuth();
  const { id } = useParams();

  const [chat, setChat] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const [project, setProject] = useState<{
    id: string;
    name: string;
    prompt: string;
  } | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamBufferRef = useRef("");


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    if (!token || !id) return;

    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { messages, ...projectData } = res.data;
        setProject(projectData);
        setChat(messages || []);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [chat, streamBuffer]);


  const send = () => {
    if (!msg.trim() || streaming) return;

    eventSourceRef.current?.close();

    const userMessage = msg;
    setMsg("");
    setChat((prev) => [...prev, { role: "user", content: userMessage }]);

    setStreaming(true);
    setStreamBuffer("");
    streamBufferRef.current = "";

    const es = new EventSource(
      `${API_URL}/api/chat/stream/${id}?message=${encodeURIComponent(
        userMessage
      )}&token=${token}`
    );

    eventSourceRef.current = es;

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        
        const finalContent = streamBufferRef.current;
        if (finalContent) {
          setChat((prev) => [
            ...prev,
            { role: "assistant", content: finalContent },
          ]);
        }
        setStreamBuffer("");
        streamBufferRef.current = "";
        setStreaming(false);
        es.close();
        return;
      }

      
      streamBufferRef.current += e.data;
      setStreamBuffer(streamBufferRef.current);
    };

    es.onerror = () => {
     
      const finalContent = streamBufferRef.current;
      if (finalContent) {
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: finalContent },
        ]);
      }
      setStreamBuffer("");
      streamBufferRef.current = "";
      setStreaming(false);
      es.close();
    };
  };



  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

 

  return (
    <div className="container py-6">
      <Link href="/dashboard" className="text-muted text-sm">
        ← Back to agents
      </Link>

      <h2 className="mt-4">{project?.name || "Loading..."}</h2>

      <div className="chat-container mt-6">
        <div className="chat-messages">
          {chat.length === 0 && !streaming && (
            <div className="empty-state">
              <p>No messages yet</p>
              <p className="text-muted">Start a conversation with your agent</p>
            </div>
          )}

          {chat.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              {m.role === "assistant" ? (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          ))}

          {streaming && streamBuffer && (
            <div className="chat-message assistant streaming">
              <ReactMarkdown>{streamBuffer}</ReactMarkdown>
            </div>
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
