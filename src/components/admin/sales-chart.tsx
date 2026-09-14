import type { SalesPoint } from "@/services/admin-service";
import { formatRupiah } from "@/lib/format";

export function SalesChart({ points }: { points: SalesPoint[] }) {
  const max = Math.max(...points.map((point) => point.revenue), 1);

  return (
    <div>
      <div
        className="flex h-44 items-end gap-1.5"
        role="img"
        aria-label={`Grafik pendapatan 14 hari terakhir. Total ${formatRupiah(
          points.reduce((total, point) => total + point.revenue, 0),
        )}`}
      >
        {points.map((point) => {
          const height = Math.round((point.revenue / max) * 100);
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-36 w-full items-end">
                <div
                  className="w-full rounded-t bg-primary/80 transition-all"
                  style={{ height: `${Math.max(height, point.revenue > 0 ? 4 : 0)}%` }}
                  title={`${point.label}: ${formatRupiah(point.revenue)}`}
                />
              </div>
              <span className="text-[10px] text-muted">{point.label}</span>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>Pendapatan harian 14 hari terakhir</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Pendapatan</th>
            <th scope="col">Order</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <td>{point.label}</td>
              <td>{formatRupiah(point.revenue)}</td>
              <td>{point.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
