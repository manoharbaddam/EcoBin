export default function StatsCard({ label, value, icon, color = 'green', sub }) {
  const colorMap = {
    green:  'bg-primary-50 text-primary-700 border-primary-100',
    amber:  'bg-amber-50  text-amber-700  border-amber-100',
    blue:   'bg-blue-50   text-blue-700   border-blue-100',
    emerald:'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  const iconBg = {
    green:  'bg-primary-100 text-primary-700',
    amber:  'bg-amber-100  text-amber-700',
    blue:   'bg-blue-100   text-blue-700',
    emerald:'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className={`card border ${colorMap[color]} relative overflow-hidden`}>
      {/* Background decor */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-current" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70 mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight">
            {value ?? <span className="animate-pulse">—</span>}
          </p>
          {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconBg[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
