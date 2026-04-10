"use client";

import { useEffect } from "react";

export default function LegalModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}) {
  // ✅ FIX: hook OUTSIDE return
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl h-[85vh] rounded-2xl shadow-xl border border-zinc-200 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black text-sm"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {content}
        </div>

      </div>
    </div>
  );
}