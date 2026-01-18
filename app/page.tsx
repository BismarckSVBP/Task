"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleEmailAuth = async () => {
    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const res = await api.post(`/auth${endpoint}`, {
        email,
        password,
        name,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-green-600 text-white py-3 rounded mb-4"
        >
          {isLogin ? "Login with Google" : "Sign Up with Google"}
        </button>

        {!isLogin && (
          <input
            className="w-full border p-2 mb-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="w-full border p-2 mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailAuth}
          className="w-full bg-black text-white py-2 rounded"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm underline mt-4"
        >
          {isLogin ? "Create account" : "Already have an account"}
        </button>
      </div>
    </div>
  );
}
