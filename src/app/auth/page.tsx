"use client";
import { useState } from "react";
import { toastError, toastSuccess } from "../lib/toastify";
import { useRouter } from "next/navigation";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";

export default function Login() {
  const router = useRouter();
  const [authCode, setAuthCode] = useState<string>("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: authCode }),
      });

      const data = await res.json();
      if (data.ok) {
        router.push("/");
        toastSuccess("Authenticated");
      } else {
        toastError(data.error || "Unauthorized");
      }
    } catch {
      toastError("Network error");
    }
  }

  return (
    <main>
      <Header />

      <div className="flex flex-col justify-center items-center h-screen gap-12 bg-(--primary)">
        <div className="w-80 sm:w-100">
          <img src="/logo-full-white.png" alt="logo" className="w-full" />
        </div>

        <div className="p-5 text-white">
          <div className="flex flex-col gap-6">
            <span className="text-xl">Enter the authentication code:</span>

            <form onSubmit={login}>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="auth-code"
                  id="auth-code"
                  className="main-input"
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

      <Footer />
    </main>
  );
}
