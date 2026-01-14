"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await axios.post("http://localhost:4000/api/auth/login", {
      email, password
    });
    login(res.data.token);
    location.href = "/dashboard";
  };

  return (
    <div>
      <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit}>Login</button><br></br>
      <a href="/register">Create account</a>

    </div>
  );
}
