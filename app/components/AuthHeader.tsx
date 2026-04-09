"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthHeader() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const goHome = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={goBack}
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Back
      </button>

      <button
        onClick={goHome}
        className="text-sm text-emerald-400 hover:underline"
      >
        Homepage
      </button>
    </div>
  );
}