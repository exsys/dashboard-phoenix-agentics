"use client";
import { useState } from "react";
import { toastError, toastSuccess } from "../lib/toastify";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [authCode, setAuthCode] = useState<string>("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: authCode }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.ok) {
        router.push("/");
        toastSuccess("Authenticated");
      } else {
        toastError("Unauthorized");
      }
    } catch {
      toastError("Network error");
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-12">
      <div>
        <img src="/epic-logo.svg" alt="epic-logo" />
      </div>

      <div className="metal-border !p-5">
        <div className="flex flex-col gap-6">
          <span className="text-lg">Enter the authentication code:</span>

          <form onSubmit={login}>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="auth-code"
                id="auth-code"
                className="custom-input"
                value={authCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAuthCode(e.target.value)
                }
              />

              <button type="submit" className="main-button">
                Enter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
