"use client";

import { useEffect } from "react";

export default function PaddleProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent duplicate load
    if ((window as any).Paddle) return;

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).Paddle) {
        (window as any).Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        });
        console.log("✅ Paddle Initialized");
      }
    };

    document.body.appendChild(script);
  }, []);

  return null;
}