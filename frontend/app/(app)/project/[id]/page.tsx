"use client";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [msg, setMsg] = useState("");
  const [project, setProject] = useState<{ id: string; name: string; prompt: string } | null>(null);

  const load = async () => {
    const res = await axios.get(`http://localhost:4000/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProject(res.data.project);
    setChat(res.data.messages);
  };

  const send = async () => {
    const res = await axios.post("http://localhost:4000/api/chat",
      { projectId: id, message: msg },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setChat([...chat, { role: "user", content: msg }, { role: "assistant", content: res.data.reply }]);
    setMsg("");
  };

  useEffect(() => { load(); }, []);

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
