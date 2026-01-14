"use client";

import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    await axios.post("http://localhost:4000/api/auth/register", {
      email,
      password
    });
    alert("Registered successfully. Now login.");
    location.href = "/login";
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>Register</button><br></br>
      <a href="/login">Already have account?</a>

    </div>
  );
}
