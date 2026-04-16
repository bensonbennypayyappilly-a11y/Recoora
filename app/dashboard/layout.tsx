"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // ✅ use shared client

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // important
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-white/5 bg-zinc-900 px-6 py-4 flex justify-between items-center">
        <div className="font-display text-lg tracking-tight">
          Recoora
        </div>

        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="px-6 py-10">{children}</div>
    </div>
  );
}