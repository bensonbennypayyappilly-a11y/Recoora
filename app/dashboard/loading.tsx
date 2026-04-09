export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">

        {/* Header Skeleton */}
        <div className="h-8 w-48 bg-zinc-800 rounded-md" />

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-2xl p-6 space-y-3"
            >
              <div className="h-4 w-24 bg-zinc-800 rounded" />
              <div className="h-6 w-32 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>

        {/* Large Section Skeleton */}
        <div className="bg-zinc-900 rounded-2xl p-8 space-y-4">
          <div className="h-5 w-40 bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-5/6 bg-zinc-800 rounded" />
        </div>

      </div>
    </div>
  );
}