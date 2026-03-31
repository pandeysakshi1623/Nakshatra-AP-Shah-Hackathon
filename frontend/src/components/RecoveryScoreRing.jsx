export default function RecoveryScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const gradId = 'scoreGrad'

  const color =
    score >= 70 ? ['#10b981', '#34d399'] :
    score >= 40 ? ['#f59e0b', '#fbbf24'] :
                  ['#ef4444', '#f87171']

  const glowColor =
    score >= 70 ? 'rgba(16,185,129,0.6)' :
    score >= 40 ? 'rgba(245,158,11,0.6)' :
                  'rgba(239,68,68,0.6)'

  return (
    <div className="flex flex-col items-center shrink-0">
      <svg width="130" height="130" viewBox="0 0 140 140">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color[0]} />
            <stop offset="100%" stopColor={color[1]} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />

        {/* Glow shadow ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color[0]}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          opacity="0.15"
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }}
        />

        {/* Main ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }}
        />

        {/* Score text */}
        <text x="70" y="64" textAnchor="middle" dominantBaseline="middle"
          fontSize="30" fontWeight="800" fill={color[0]}>
          {score}
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)" fontWeight="500">
          / 100
        </text>
      </svg>
      <p className="text-xs font-semibold text-white/30 -mt-1">Recovery Score</p>
    </div>
  )
}
