"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AuthHeader from "../components/AuthHeader";
import LegalModal from "../components/LegalModal";
import TermsContent from "../components/legal/TermsContent";
import PrivacyContent from "../components/legal/PrivacyContent";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName) newErrors.fullName = "Full name is required.";

    if (!email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email))
      newErrors.email = "Enter a valid email address.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (!agreed)
      newErrors.agreed = "You must agree to the Terms & Privacy Policy.";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const cleanedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-verified`,
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is enabled (recommended production setup)
    if (data?.user && !data.user.email_confirmed_at) {
      setLoading(false);
      router.push("/verify-email");
      return;
    }

    // If confirmation is disabled in Supabase
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-zinc-100 p-10">
            <AuthHeader />
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-zinc-500">
              Start monitoring and recovering revenue in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Company (Optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-sm text-zinc-600">
                I agree to the{" "}
                <button
  type="button"
  onClick={() => setModalType("terms")}
  className="text-emerald-500 hover:underline"
>
  Terms
</button>

and

<button
  type="button"
  onClick={() => setModalType("privacy")}
  className="text-emerald-500 hover:underline"
>
  Privacy Policy
</button>
              </span>
            </div>
            {errors.agreed && (
              <p className="text-red-500 text-xs">
                {errors.agreed}
              </p>
            )}

            {/* Server Error */}
            {serverError && (
              <p className="text-red-500 text-sm">
                {serverError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-black font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Creating account..." : "Start 14-Day Free Trial"}
            </button>
               <p className="text-xs text-zinc-500 text-center mt-3">
                14-day free trial • No credit card required
                </p>
          </form>
        </div>
      </div>
      {modalType && (
  <LegalModal
    title={modalType === "terms" ? "Terms of Service" : "Privacy Policy"}
    onClose={() => setModalType(null)}
    content={
      modalType === "terms" ? <TermsContent /> : <PrivacyContent />
    }
  />
)}

    </main>
  );
}
