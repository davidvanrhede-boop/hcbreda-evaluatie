import { useState } from 'react'
import { SCORE_LABELS, SCORE_COLORS } from '../data/criteria'

export default function ScoreSelector({ criterium, value, onChange, readonly }) {
  const [hover, setHover] = useState(null)
  const actief = hover || value

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Criterium label */}
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#1A2332' }}>
        {criterium.label}
      </div>

      {/* Score knoppen */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(score => {
          const isActief = value === score
          const isHover = hover === score
          const c = SCORE_COLORS[score]
          return (
            <button
              key={score}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange(score)}
              onMouseEnter={() => setHover(score)}
              onMouseLeave={() => setHover(null)}
              style={{
                padding: '6px 0', width: 52, borderRadius: 6, cursor: readonly ? 'default' : 'pointer',
                fontWeight: 700, fontSize: 15, border: `2px solid`,
                borderColor: (isActief || isHover) ? c.border : '#E2E8F0',
                background: (isActief || isHover) ? c.bg : '#F8FAFC',
                color: (isActief || isHover) ? c.text : '#94A3B8',
                transition: 'all 0.1s',
                boxShadow: isActief ? `0 0 0 2px ${c.border}` : 'none',
              }}
            >
              {score}
            </button>
          )
        })}
      </div>

      {/* Beschrijving van geselecteerde/gehoverden score */}
      {actief && (
        <div style={{
          padding: '8px 12px', borderRadius: 6, fontSize: 13,
          background: SCORE_COLORS[actief].bg,
          color: SCORE_COLORS[actief].text,
          border: `1px solid ${SCORE_COLORS[actief].border}`,
          lineHeight: 1.5,
        }}>
          <strong>{actief} — {SCORE_LABELS[actief]}:</strong> {criterium.scores[actief]}
        </div>
      )}

      {!actief && (
        <div style={{
          padding: '8px 12px', borderRadius: 6, fontSize: 13,
          background: '#F8FAFC', color: '#94A3B8',
          border: '1px solid #E2E8F0',
        }}>
          Kies een score (1–5) of zweef over een cijfer voor de beschrijving.
        </div>
      )}
    </div>
  )
}
