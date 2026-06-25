export default function DashboardLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-[rgba(255,255,255,0.06)]" />
          <div className="h-4 w-72 rounded bg-[rgba(255,255,255,0.03)]" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-[rgba(255,255,255,0.05)]" />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] p-4 space-y-2">
            <div className="h-4 w-24 rounded bg-[rgba(255,255,255,0.03)]" />
            <div className="h-8 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
          </div>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-[rgba(255,255,255,0.05)]" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-8 w-8 rounded bg-[rgba(255,255,255,0.05)]" />
              <div className="h-4 flex-1 rounded bg-[rgba(255,255,255,0.03)]" />
              <div className="h-4 w-12 rounded bg-[rgba(255,255,255,0.04)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
