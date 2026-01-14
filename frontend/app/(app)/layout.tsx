"use client";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <div>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <button onClick={logout}>Logout</button>
      </nav>
      <main>{children}</main>
    </div>
  );
}
