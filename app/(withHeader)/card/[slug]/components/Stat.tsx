export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="opacity-65 w-24 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
