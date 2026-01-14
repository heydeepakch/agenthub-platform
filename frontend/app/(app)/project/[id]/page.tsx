"use client";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState, useRef } from "react";

export default function ProjectPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [msg, setMsg] = useState("");
  const [project, setProject] = useState<{ id: string; name: string; prompt: string } | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const load = async () => {
    const res = await axios.get(`http://localhost:4000/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProject(res.data.project);
    setChat(res.data.messages);
  };

  useEffect(() => { 
    if (token && id) load(); 
  }, [id, token]);

  const send = () => {
    if (!msg.trim()) return; // Don't send empty messages
  
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  
    const userMsg = msg;
    setMsg("");
    setChat(prev => [...prev, { role: "user", content: userMsg }]);
  
    const eventSource = new EventSource(
      `http://localhost:4000/api/chat/stream/${id}?message=${encodeURIComponent(userMsg)}&token=${token}`
    );
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = e => {
      if (e.data === "[DONE]") {
        eventSource.close();
        eventSourceRef.current = null;
        return;
      }
  
      setChat(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, content: last.content + e.data }];
        }
        return [...prev, { role: "assistant", content: e.data }];
      });
    };
  
    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
      eventSourceRef.current = null;
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>{project?.name}</h2>
      <p>{project?.prompt}</p>

      <div>
        {chat.map((m,i)=>(
          <div key={i}><b>{m.role}</b>: {m.content}</div>
        ))}
      </div>

      <input value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}