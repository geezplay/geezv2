import { Skeleton } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <div className="container-page space-y-6 py-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman…</span>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-10 w-72 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-line p-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
