import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';

export function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  if (level === 'high') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600" title="High confidence">
        <CheckCircle2 size={14} />
      </span>
    );
  }
  if (level === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-500" title="Medium confidence — verify">
        <AlertTriangle size={14} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-500" title="Low confidence — please verify">
      <AlertTriangle size={14} />
    </span>
  );
}

export function ConfidenceRow({
  label,
  value,
  confidence,
  onChange,
  type = 'text',
  options,
}: {
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  onChange: (v: string) => void;
  type?: 'text' | 'number';
  options?: string[];
}) {
  const borderColor =
    confidence === 'high'
      ? 'border-emerald-300'
      : confidence === 'medium'
      ? 'border-amber-300'
      : 'border-red-300';

  const bgTint =
    confidence === 'high'
      ? 'bg-emerald-50'
      : confidence === 'medium'
      ? 'bg-amber-50'
      : 'bg-red-50';

  return (
    <div className="flex items-center gap-3 py-2">
      <label className="text-sm text-slate-500 w-40 shrink-0">{label}</label>
      <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgTint}`}>
        {options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
          />
        )}
        <ConfidenceBadge level={confidence} />
      </div>
    </div>
  );
}
