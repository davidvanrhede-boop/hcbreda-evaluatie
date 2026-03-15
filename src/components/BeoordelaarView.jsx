import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FormulierA from './FormulierA'
import { colors, s } from '../styles'

export default function BeoordelaarView({ profiel }) {
  const [spelers, setSpelers] = useState([])
  const [status, setStatus] = useState({}) // speler_id -> { H1: 'concept'|'ingediend'|null, H2: ... }
  const [geladen, setGeladen] = useState(false)
  const [geselecteerdeSpeler, setGeselecteerdeSpeler] = useState(null)

  useEffect(() => { laadData() }, [])

  async function laadData() {
    setGeladen(false)

    // Haal teams op voor deze beoordelaar
    const { data: assignments } = await supabase
      .from('team_assignments')
      .select('team_id')
      .eq('profiel_id', profiel.id)

    if (!assignments || assignments.length === 0) {
      setSpelers([])
      setGeladen(true)
      return
    }

    const teamIds = assignments.map(a => a.team_id)

    // Haal spelers op
    const { data: spelersData } = await supabase
      .from('spelers')
      .select('*, team:teams(naam)')
      .in('team_id', teamIds)
      .order('naam')

    setSpelers(spelersData || [])

    // Haal evaluatiestatus op
    if (spelersData && spelersData.length > 0) {
      const { data: evals } = await supabase
        .from('evaluaties_a')
        .select('speler_id, halfjaar, ingediend')
        .eq('beoordelaar_id', profiel.id)
        .in('speler_id', spelersData.map(sp => sp.id))

      const statusMap = {}
      ;(evals || []).forEach(ev => {
        if (!statusMap[ev.speler_id]) statusMap[ev.speler_id] = {}
        statusMap[ev.speler_id][ev.halfjaar] = ev.ingediend ? 'ingediend' : 'concept'
      })
      setStatus(statusMap)
    }

    setGeladen(true)
  }

  if (geselecteerdeSpeler) {
    return (
      <FormulierA
        profiel={profiel}
        speler={geselecteerdeSpeler}
        onTerug={() => { setGeselecteerdeSpeler(null); laadData() }}
      />
    )
  }

  const rolLabel = profiel.rol === 'coach' ? 'Coach' : 'Trainer'
  const rolKleur = profiel.rol === 'coach' ? colors.blue : colors.green

  // Groepeer per team
  const teamsMap = {}
  spelers.forEach(sp => {
    const naam = sp.team?.naam || 'Onbekend'
    if (!teamsMap[naam]) teamsMap[naam] = []
    teamsMap[naam].push(sp)
  })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={s.h1}>{rolLabel}portal — {profiel.naam}</div>
        <div style={{ fontSize: 14, color: colors.textMuted }}>
          Beoordeel de spelers van jouw team. Scores van andere beoordelaars zijn niet zichtbaar.
        </div>
      </div>

      {!geladen && <div style={{ textAlign: 'center', padding: 40, color: colors.textMuted }}>Laden...</div>}

      {geladen && spelers.length === 0 && (
        <div style={s.alert('#FEF3C7', '#FCD34D', '#92400E')}>
          Je bent nog niet gekoppeld aan een team. Neem contact op met de HOT.
        </div>
      )}

      {geladen && Object.entries(teamsMap).map(([teamNaam, teamSpelers]) => (
        <div key={teamNaam} style={{ marginBottom: 24 }}>
          <div style={{
            background: rolKleur, color: colors.white, borderRadius: '8px 8px 0 0',
            padding: '10px 16px', fontWeight: 700, fontSize: 15,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Team {teamNaam}</span>
            <span style={{ fontWeight: 400, fontSize: 13 }}>{teamSpelers.length} spelers</span>
          </div>

          <div style={{
            background: colors.white, borderRadius: '0 0 8px 8px',
            border: `1px solid ${colors.gray2}`, borderTop: 'none',
            overflow: 'hidden',
          }}>
            {/* Koptekst */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px',
              padding: '8px 16px', background: colors.gray,
              fontSize: 12, fontWeight: 600, color: colors.textMuted,
              borderBottom: `1px solid ${colors.gray2}`,
            }}>
              <span>Naam</span>
              <span style={{ textAlign: 'center' }}>H1</span>
              <span style={{ textAlign: 'center' }}>H2</span>
              <span style={{ textAlign: 'center' }}>Actie</span>
            </div>

            {teamSpelers.map((speler, idx) => {
              const sp_status = status[speler.id] || {}
              return (
                <div key={speler.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px',
                  padding: '12px 16px', alignItems: 'center',
                  background: idx % 2 === 0 ? colors.white : '#FAFBFC',
                  borderBottom: idx < teamSpelers.length - 1 ? `1px solid ${colors.gray2}` : 'none',
                }}>
                  <span style={{ fontWeight: 500 }}>{speler.naam}</span>
                  <span style={{ textAlign: 'center' }}>
                    <StatusBadge status={sp_status['H1']} />
                  </span>
                  <span style={{ textAlign: 'center' }}>
                    <StatusBadge status={sp_status['H2']} />
                  </span>
                  <span style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setGeselecteerdeSpeler(speler)}
                      style={s.btnSmall(rolKleur)}
                    >
                      Beoordelen →
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>
  if (status === 'ingediend') return (
    <span style={s.badge('#D1FAE5', '#166534')}>✓ Ingediend</span>
  )
  return <span style={s.badge('#FEF3C7', '#92400E')}>Concept</span>
}
