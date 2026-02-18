type Props = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: Props) {
  return (
    <article className="rounded-xl border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
