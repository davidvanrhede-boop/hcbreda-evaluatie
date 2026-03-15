import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FormulierB from './FormulierB'
import { colors, s } from '../styles'

export default function ObservatorView({ profiel }) {
  const [spelers, setSpelers] = useState([])
  const [status, setStatus] = useState({})
  const [geladen, setGeladen] = useState(false)
  const [geselecteerdeSpeler, setGeselecteerdeSpeler] = useState(null)

  useEffect(() => { laadData() }, [])

  async function laadData() {
    setGeladen(false)
    // Observatoren zien alle spelers (voor kalibratie tussen teams)
    const { data: spelersData } = await supabase
      .from('spelers')
      .select('*, team:teams(naam)')
      .order('naam')

    setSpelers(spelersData || [])

    if (spelersData && spelersData.length > 0) {
      const { data: evals } = await supabase
        .from('evaluaties_b')
        .select('speler_id, selectiedag, ingediend')
        .eq('beoordelaar_id', profiel.id)

      const statusMap = {}
      ;(evals || []).forEach(ev => {
        if (!statusMap[ev.speler_id]) statusMap[ev.speler_id] = {}
        statusMap[ev.speler_id][ev.selectiedag] = ev.ingediend ? 'ingediend' : 'concept'
      })
      setStatus(statusMap)
    }
    setGeladen(true)
  }

  if (geselecteerdeSpeler) {
    return (
      <FormulierB
        profiel={profiel}
        speler={geselecteerdeSpeler}
        onTerug={() => { setGeselecteerdeSpeler(null); laadData() }}
      />
    )
  }

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
        <div style={s.h1}>Observator — {profiel.naam}</div>
        <div style={{ fontSize: 14, color: colors.textMuted }}>
          Selectiedag observaties — kalibratie tussen teams. Vul Formulier B in voor de spelers die je hebt geobserveerd.
        </div>
      </div>

      <div style={{ ...s.alert('#D1FAE5', '#6EE7B7', colors.green), marginBottom: 20 }}>
        <strong>Selectiedagen:</strong> Dag 1 = vóór winterstop &nbsp;|&nbsp; Dag 2 & 3 = na winterstop
      </div>

      {!geladen && <div style={{ textAlign: 'center', padding: 40 }}>Laden...</div>}

      {geladen && Object.entries(teamsMap).map(([teamNaam, teamSpelers]) => (
        <div key={teamNaam} style={{ marginBottom: 24 }}>
          <div style={{
            background: colors.dark, color: colors.white, borderRadius: '8px 8px 0 0',
            padding: '10px 16px', fontWeight: 700, fontSize: 15,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Team {teamNaam}</span>
          </div>

          <div style={{
            background: colors.white, borderRadius: '0 0 8px 8px',
            border: `1px solid ${colors.gray2}`, borderTop: 'none', overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 120px',
              padding: '8px 16px', background: colors.gray,
              fontSize: 12, fontWeight: 600, color: colors.textMuted,
              borderBottom: `1px solid ${colors.gray2}`,
            }}>
              <span>Naam</span>
              <span style={{ textAlign: 'center' }}>Dag 1</span>
              <span style={{ textAlign: 'center' }}>Dag 2</span>
              <span style={{ textAlign: 'center' }}>Dag 3</span>
              <span style={{ textAlign: 'center' }}>Actie</span>
            </div>

            {teamSpelers.map((speler, idx) => {
              const sp_status = status[speler.id] || {}
              return (
                <div key={speler.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 120px',
                  padding: '12px 16px', alignItems: 'center',
                  background: idx % 2 === 0 ? colors.white : '#FAFBFC',
                  borderBottom: idx < teamSpelers.length - 1 ? `1px solid ${colors.gray2}` : 'none',
                }}>
                  <span style={{ fontWeight: 500 }}>{speler.naam}</span>
                  {[1, 2, 3].map(dag => (
                    <span key={dag} style={{ textAlign: 'center' }}>
                      {sp_status[dag] === 'ingediend'
                        ? <span style={s.badge('#D1FAE5', '#166534')}>✓</span>
                        : sp_status[dag] === 'concept'
                          ? <span style={s.badge('#FEF3C7', '#92400E')}>~</span>
                          : <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>
                      }
                    </span>
                  ))}
                  <span style={{ textAlign: 'center' }}>
                    <button onClick={() => setGeselecteerdeSpeler(speler)} style={s.btnSmall(colors.green)}>
                      Invullen →
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
