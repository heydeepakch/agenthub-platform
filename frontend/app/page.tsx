import Link from "next/link";

export default function Home() {
  return (
    <div className="auth-container">
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          AgentHub-Platform
        </h1>
        <p
          className="text-muted"
          style={{
            fontSize: "1.1rem",
            marginBottom: "2.5rem",
            lineHeight: 1.6,
          }}
        >
          Create custom AI agents with your own system prompts. Build
          conversational experiences powered by LLM.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/login">
            <button>Sign in</button>
          </Link>
          <Link href="/register">
            <button className="secondary">Create account</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
