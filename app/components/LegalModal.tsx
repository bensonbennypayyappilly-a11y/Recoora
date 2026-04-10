"use client";

export default function LegalModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black text-sm"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-sm text-zinc-700 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}