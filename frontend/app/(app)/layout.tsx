"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <div>
      <nav className="navbar">
        <Link href="/dashboard" className="navbar-brand">
          Chatbot Platform
        </Link>
        <button
          className="secondary"
          onClick={logout}
          style={{ padding: "0.5rem 1rem" }}
        >
          Sign out
        </button>
      </nav>
      <main>{children}</main>
    </div>
  );
}
