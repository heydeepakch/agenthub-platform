"use client";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");

  const load = async () => {
    const res = await axios.get("http://localhost:4000/api/projects", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProjects(res.data);
  };

  const create = async () => {
    await axios.post("http://localhost:4000/api/projects",
      { name, prompt },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setName(""); setPrompt("");
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1>Your Agents</h1>

      <input placeholder="Agent name" value={name} onChange={e=>setName(e.target.value)} />
      <textarea placeholder="Agent prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} />
      <button onClick={create}>Create Agent</button>

      <ul>
        {projects.map(p => (
          <li key={p.id}>
            <a href={`/project/${p.id}`}>{p.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
