"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/config/api";

export default function Dashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<
    { id: string; name: string; prompt: string }[]
  >([]);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/projects`,
        { name, prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setPrompt("");
      setShowForm(false);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  return (
    <div
      className="container"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Your Agents</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Agent"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={create}
          className="card"
          style={{ marginBottom: "1.5rem" }}
        >
          <div className="form-group">
            <input
              placeholder="Agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              placeholder="System prompt (e.g., You are a helpful assistant that...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No agents yet</p>
          <p className="text-muted">
            Create your first AI agent to get started
          </p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((p) => (
            <Link
              href={`/project/${p.id}`}
              key={p.id}
              style={{ textDecoration: "none" }}
            >
              <div className="project-item">
                <div>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div className="text-muted" style={{ marginTop: "0.25rem" }}>
                    {p.prompt.slice(0, 60)}
                    {p.prompt.length > 60 ? "..." : ""}
                  </div>
                </div>
                <span style={{ color: "var(--muted)" }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
