import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email, suggestion } = await req.json();

    // ✅ Email validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // ✅ Suggestion validation (optional, max 100)
    if (suggestion && suggestion.length > 100) {
      return NextResponse.json(
        { error: "Suggestion must be under 100 characters" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email, suggestion }]);

    // ✅ Duplicate handling
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "duplicate" });
      }
      throw error;
    }

    return NextResponse.json({ message: "success" });

  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}