"use client";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
};

export default function Loader({
  size = "md",
  fullScreen = false,
  text,
}: LoaderProps) {
  const sizeClasses =
    size === "sm"
      ? "w-4 h-4 border-2"
      : size === "lg"
      ? "w-10 h-10 border-4"
      : "w-6 h-6 border-3";

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses} border-emerald-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-zinc-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}