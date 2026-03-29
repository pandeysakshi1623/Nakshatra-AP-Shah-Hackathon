import { ALERT_CONFIG } from '../lib/alertEngine'

export default function AlertBadge({ level, message, advice, large = false }) {
  const cfg = ALERT_CONFIG[level] || ALERT_CONFIG.normal

  return (
    <div className={`rounded-2xl border-2 p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-3">
        <span className={large ? 'text-4xl' : 'text-2xl'}>{cfg.emoji}</span>
        <div>
          <p className={`font-bold ${cfg.color} ${large ? 'text-xl' : 'text-base'}`}>
            {cfg.label}
          </p>
          <p className="text-slate-700 text-sm mt-0.5">{message}</p>
        </div>
      </div>
      {advice && (
        <p className="mt-3 text-sm text-slate-600 bg-white/60 rounded-xl p-3">{advice}</p>
      )}
    </div>
  )
}
