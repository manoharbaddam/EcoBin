const CONFIG = {
  pending:     { label: 'Pending',     cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100  text-blue-800  border-blue-200'  },
  collected:   { label: 'Collected',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {cfg.label}
    </span>
  );
}
