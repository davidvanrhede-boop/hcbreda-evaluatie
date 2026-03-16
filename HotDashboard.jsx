import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { berekenCat1, berekenCat2, berekenCat3, berekenEindcijfer, berekenCatB } from '../data/criteria'
import ExcelUpload from './ExcelUpload'
import { colors, s } from '../styles'

export default function HotDashboard({ profiel }) {
  const [tab, setTab] = useState('overzicht')
  const [spelers, setSpelers] = useState([])
  const [evalsA, setEvalsA] = useState([])
  const [evalsB, setEvalsB] = useState([])
  const [beoordelaars, setBeoordelaars] = useState([])
  const [teams, setTeams] = useState([])
  const [geladen, setGeladen] = useState(false)
  const [filterTeam, setFilterTeam] = useState('alle')

  useEffect(() => { laadAlles() }, [])

  async function laadAlles() {
    setGeladen(false)
    const [{ data: spelersData }, { data: evA }, { data: evB }, { data: profielData }, { data: teamData }] = await Promise.all([
      supabase.from('spelers').select('*, team:teams(naam)').order('naam'),
      supabase.from('evaluaties_a').select('*'),
      supabase.from('evaluaties_b').select('*'),
      supabase.from('profiles').select('id, naam, rol'),
      supabase.from('teams').select('*').order('naam'),
    ])
    setSpelers(spelersData || [])
    setEvalsA(evA || [])
    setEvalsB(evB || [])
    setBeoordelaars(profielData || [])
    setTeams(teamData || [])
    setGeladen(false)
    setGeladen(true)
  }

  // ─── Score berekening per speler ─────────────────────────
  function berekenSpelerScore(spelerId) {
    // Alle ingediende Formulier A evaluaties voor deze speler, EXCLUSIEF eigen kind
    const aEvals = evalsA.filter(e =>
      e.speler_id === spelerId && e.ingediend && !e.eigen_kind
    )

    const h1Evals = aEvals.filter(e => e.halfjaar === 'H1')
    const h2Evals = aEvals.filter(e => e.halfjaar === 'H2')

    function gemCats(evals) {
      if (!evals.length) return null
      const cats = evals.map(e => ({
        c1: berekenCat1(e), c2: berekenCat2(e), c3: berekenCat3(e)
      })).filter(c => c.c1 && c.c2 && c.c3)
      if (!cats.length) return null
      return {
        c1: cats.reduce((a, c) => a + c.c1, 0) / cats.length,
        c2: cats.reduce((a, c) => a + c.c2, 0) / cats.length,
        c3: cats.reduce((a, c) => a + c.c3, 0) / cats.length,
      }
    }

    const h1Cats = gemCats(h1Evals)
    const h2Cats = gemCats(h2Evals)

    // Formulier B
    const bEvals = evalsB.filter(e => e.speler_id === spelerId && e.ingediend && !e.eigen_kind)
    const bScores = bEvals.map(e => berekenCatB(e)).filter(Boolean)
    const bGem = bScores.length ? bScores.reduce((a, b) => a + b, 0) / bScores.length : null

    // Gewogen eindcijfer: H1=30%, H2=50%, B=20%
    let eindcijfer = null
    if (h1Cats && h2Cats && bGem !== null) {
      const h1Eind = berekenEindcijfer(h1Cats.c1, h1Cats.c2, h1Cats.c3)
      const h2Eind = berekenEindcijfer(h2Cats.c1, h2Cats.c2, h2Cats.c3)
      eindcijfer = h1Eind * 0.3 + h2Eind * 0.5 + bGem * 0.2
    } else if (h1Cats && h2Cats) {
      const h1Eind = berekenEindcijfer(h1Cats.c1, h1Cats.c2, h1Cats.c3)
      const h2Eind = berekenEindcijfer(h2Cats.c1, h2Cats.c2, h2Cats.c3)
      eindcijfer = h1Eind * 0.375 + h2Eind * 0.625
    } else if (h2Cats) {
      eindcijfer = berekenEindcijfer(h2Cats.c1, h2Cats.c2, h2Cats.c3)
    } else if (h1Cats) {
      eindcijfer = berekenEindcijfer(h1Cats.c1, h1Cats.c2, h1Cats.c3)
    }

    return { eindcijfer, h1Cats, h2Cats, bGem, aantalEvals: aEvals.length, aantalB: bEvals.length }
  }

  // ─── Twijfelgevallen detectie ─────────────────────────────
  function detecteerTwijfelgevallen(spelerId) {
    const aEvals = evalsA.filter(e => e.speler_id === spelerId && e.ingediend && !e.eigen_kind)
    if (aEvals.length < 2) return []
    const twijfels = []

    const velden = ['passing', 'dribbelen', 'schot', 'positiespel', 'tactisch', 'fysiek',
      'progressie', 'coachbaarheid', 'inzet', 'zelfreflectie', 'motivatie',
      'aanwezigheid', 'attitude_lijn', 'teamsfeer', 'communicatie_ouders']

    velden.forEach(veld => {
      const scores = aEvals.map(e => e[veld]).filter(Boolean)
      if (scores.length >= 2) {
        const max = Math.max(...scores)
        const min = Math.min(...scores)
        if (max - min > 1.5) {
          twijfels.push({ veld, min, max, verschil: max - min })
        }
      }
    })
    return twijfels
  }

  const gefilterdSpelers = filterTeam === 'alle'
    ? spelers
    : spelers.filter(sp => sp.team?.naam === filterTeam)

  // Bereken scores voor ranking
  const spelersMetScore = gefilterdSpelers.map(sp => ({
    ...sp,
    score: berekenSpelerScore(sp.id),
    twijfels: detecteerTwijfelgevallen(sp.id),
  })).sort((a, b) => {
    if (a.score.eindcijfer === null && b.score.eindcijfer === null) return 0
    if (a.score.eindcijfer === null) return 1
    if (b.score.eindcijfer === null) return -1
    return b.score.eindcijfer - a.score.eindcijfer
  })

  const twijfelgevallen = spelersMetScore.filter(sp => sp.twijfels.length > 0)

  if (!geladen) return <div style={{ textAlign: 'center', padding: 40 }}>Laden...</div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={s.h1}>HOT Dashboard</div>
        <div style={{ fontSize: 14, color: colors.textMuted }}>Volledig overzicht van alle evaluaties — seizoen 2025–2026</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Spelers', waarde: spelers.length, kleur: colors.blue },
          { label: 'Ingevulde Form. A', waarde: evalsA.filter(e => e.ingediend).length, kleur: colors.green },
          { label: 'Ingevulde Form. B', waarde: evalsB.filter(e => e.ingediend).length, kleur: colors.orange },
          { label: 'Twijfelgevallen', waarde: twijfelgevallen.length, kleur: colors.red },
        ].map(stat => (
          <div key={stat.label} style={{
            ...s.card, marginBottom: 0, textAlign: 'center',
            borderTop: `3px solid ${stat.kleur}`,
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.kleur }}>{stat.waarde}</div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['overzicht', 'Voortgang'],
          ['ranking', 'Ranking'],
          ['twijfel', `Twijfelgevallen (${twijfelgevallen.length})`],
          ['beheer', 'Beheer'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={s.btnSmall(tab === key ? colors.dark : colors.gray2, tab === key ? colors.white : colors.dark)}>
            {label}
          </button>
        ))}
      </div>

      {/* Team filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted }}>Team:</span>
        {['alle', ...teams.map(t => t.naam)].map(t => (
          <button key={t} onClick={() => setFilterTeam(t)}
            style={s.btnSmall(filterTeam === t ? colors.blue : colors.gray2, filterTeam === t ? colors.white : colors.dark)}>
            {t === 'alle' ? 'Alle teams' : t}
          </button>
        ))}
      </div>

      {/* ─── TAB: VOORTGANG ─── */}
      {tab === 'overzicht' && (
        <div style={s.card}>
          <div style={s.h2}>Voortgang per speler</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: colors.gray }}>
                  <th style={th}>Speler</th>
                  <th style={th}>Team</th>
                  <th style={th}>Form. A H1</th>
                  <th style={th}>Form. A H2</th>
                  <th style={th}>Sel. dag 1</th>
                  <th style={th}>Sel. dag 2</th>
                  <th style={th}>Sel. dag 3</th>
                </tr>
              </thead>
              <tbody>
                {gefilterdSpelers.map((sp, idx) => {
                  const aH1 = evalsA.filter(e => e.speler_id === sp.id && e.halfjaar === 'H1')
                  const aH2 = evalsA.filter(e => e.speler_id === sp.id && e.halfjaar === 'H2')
                  const bDags = [1, 2, 3].map(d => evalsB.filter(e => e.speler_id === sp.id && e.selectiedag === d))
                  return (
                    <tr key={sp.id} style={{ background: idx % 2 === 0 ? colors.white : '#FAFBFC' }}>
                      <td style={td}><strong>{sp.naam}</strong></td>
                      <td style={td}>{sp.team?.naam}</td>
                      <td style={{ ...td, textAlign: 'center' }}><EvalStatus evals={aH1} /></td>
                      <td style={{ ...td, textAlign: 'center' }}><EvalStatus evals={aH2} /></td>
                      {bDags.map((evals, i) => (
                        <td key={i} style={{ ...td, textAlign: 'center' }}><EvalStatus evals={evals} /></td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: RANKING ─── */}
      {tab === 'ranking' && (
        <div style={s.card}>
          <div style={s.h2}>Voorrangschikking (automatisch berekend)</div>
          <div style={{ ...s.alert('#FEF3C7', '#FCD34D', '#92400E'), marginBottom: 16 }}>
            Dit is een <strong>voorlopige</strong> rangschikking op basis van ingediende scores.
            De definitieve volgorde wordt vastgesteld door het technisch team.
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: colors.dark, color: colors.white }}>
                  <th style={{ ...th, color: colors.white }}>#</th>
                  <th style={{ ...th, color: colors.white }}>Speler</th>
                  <th style={{ ...th, color: colors.white }}>Team</th>
                  <th style={{ ...th, color: colors.white, textAlign: 'center' }}>Eindcijfer</th>
                  <th style={{ ...th, color: colors.white, textAlign: 'center' }}>Evals A</th>
                  <th style={{ ...th, color: colors.white, textAlign: 'center' }}>Evals B</th>
                  <th style={{ ...th, color: colors.white, textAlign: 'center' }}>Twijfel</th>
                </tr>
              </thead>
              <tbody>
                {spelersMetScore.map((sp, idx) => (
                  <tr key={sp.id} style={{ background: idx % 2 === 0 ? colors.white : '#FAFBFC' }}>
                    <td style={{ ...td, fontWeight: 700, color: idx < 3 ? colors.blue : colors.textMuted }}>
                      {sp.score.eindcijfer != null ? idx + 1 : '—'}
                    </td>
                    <td style={td}><strong>{sp.naam}</strong></td>
                    <td style={td}>{sp.team?.naam}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {sp.score.eindcijfer != null
                        ? <span style={{
                          fontWeight: 700, fontSize: 15,
                          color: sp.score.eindcijfer >= 4 ? colors.green : sp.score.eindcijfer >= 3 ? colors.orange : colors.red
                        }}>
                          {sp.score.eindcijfer.toFixed(2)}
                        </span>
                        : <span style={{ color: '#CBD5E1' }}>onvolledig</span>
                      }
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>{sp.score.aantalEvals}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{sp.score.aantalB}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {sp.twijfels.length > 0
                        ? <span style={s.badge('#FEE2E2', '#C0392B')}>⚠ {sp.twijfels.length}</span>
                        : <span style={{ color: '#CBD5E1' }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: TWIJFELGEVALLEN ─── */}
      {tab === 'twijfel' && (
        <div>
          {twijfelgevallen.length === 0 ? (
            <div style={s.alert('#D1FAE5', '#6EE7B7', colors.green)}>
              Geen twijfelgevallen gevonden. Geen beoordelaars met &gt;1,5 punt verschil.
            </div>
          ) : twijfelgevallen.map(sp => (
            <div key={sp.id} style={{ ...s.card, borderLeft: `4px solid ${colors.red}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{sp.naam}</strong>
                  <span style={{ marginLeft: 10, fontSize: 13, color: colors.textMuted }}>Team {sp.team?.naam}</span>
                </div>
                <span style={s.badge('#FEE2E2', colors.red)}>⚠ {sp.twijfels.length} afwijking(en)</span>
              </div>
              {sp.twijfels.map(t => (
                <div key={t.veld} style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  padding: '6px 10px', background: '#FFF5F5', borderRadius: 6,
                  marginBottom: 4, fontSize: 13,
                }}>
                  <span style={{ minWidth: 200, fontWeight: 500 }}>{t.veld}</span>
                  <span>Laagste: <strong>{t.min}</strong></span>
                  <span>Hoogste: <strong>{t.max}</strong></span>
                  <span style={{ color: colors.red, fontWeight: 700 }}>Verschil: {t.verschil.toFixed(1)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB: BEHEER ─── */}
      {tab === 'beheer' && (
        <BeheerTab teams={teams} beoordelaars={beoordelaars} onVernieuwen={laadAlles} />
      )}
    </div>
  )
}

// ─── BEHEER TAB ──────────────────────────────────────────────
function BeheerTab({ teams, beoordelaars, onVernieuwen }) {
  const [nieuweSpelerNaam, setNieuweSpelerNaam] = useState('')
  const [nieuweSpelerTeam, setNieuweSpelerTeam] = useState('')
  const [laden, setLaden] = useState(false)
  const [melding, setMelding] = useState(null)

  async function spelerToevoegen() {
    if (!nieuweSpelerNaam || !nieuweSpelerTeam) return
    setLaden(true)
    const { error } = await supabase.from('spelers').insert({
      naam: nieuweSpelerNaam.trim(),
      team_id: parseInt(nieuweSpelerTeam),
    })
    if (error) {
      setMelding({ type: 'fout', tekst: error.message })
    } else {
      setMelding({ type: 'ok', tekst: `${nieuweSpelerNaam} toegevoegd.` })
      setNieuweSpelerNaam('')
      onVernieuwen()
    }
    setLaden(false)
  }

  return (
    <div style={s.card}>
      <ExcelUpload profiel={profiel} onVernieuwen={onVernieuwen} />
      <div style={{ borderTop: `1px solid ${colors.gray2}`, marginTop: 24, paddingTop: 24 }}>
      <div style={s.h2}>Speler handmatig toevoegen</div>
      {melding && (
        <div style={s.alert(melding.type === 'ok' ? '#D1FAE5' : '#FEE2E2',
          melding.type === 'ok' ? '#6EE7B7' : '#FCA5A5',
          melding.type === 'ok' ? colors.green : colors.red)}>
          {melding.tekst}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          value={nieuweSpelerNaam}
          onChange={e => setNieuweSpelerNaam(e.target.value)}
          placeholder="Naam speler"
          style={{ ...s.input, maxWidth: 240 }}
        />
        <select
          value={nieuweSpelerTeam}
          onChange={e => setNieuweSpelerTeam(e.target.value)}
          style={{ ...s.input, maxWidth: 140 }}
        >
          <option value="">Kies team...</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
        </select>
        <button onClick={spelerToevoegen} disabled={laden} style={s.btn(colors.blue)}>
          + Toevoegen
        </button>
      </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={s.h2}>Beoordelaars ({beoordelaars.length})</div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
          Accounts worden aangemaakt via Supabase Authentication. Koppel coaches/trainers aan teams via de team_assignments tabel.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {beoordelaars.map(b => (
            <span key={b.id} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 13,
              background: b.rol === 'hot' ? colors.dark : b.rol === 'coach' ? colors.blueLight : b.rol === 'trainer' ? colors.greenLight : colors.gray2,
              color: b.rol === 'hot' ? colors.white : colors.dark,
              fontWeight: 500,
            }}>
              {b.naam} <span style={{ opacity: 0.6 }}>({b.rol})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────
const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #E2E8F0' }
const td = { padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }

function EvalStatus({ evals }) {
  if (!evals || evals.length === 0) return <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>
  const ingediend = evals.filter(e => e.ingediend).length
  const concept = evals.filter(e => !e.ingediend).length
  return (
    <span style={{ fontSize: 12 }}>
      {ingediend > 0 && <span style={s.badge('#D1FAE5', '#166534')}>{ingediend}✓</span>}
      {concept > 0 && <span style={{ ...s.badge('#FEF3C7', '#92400E'), marginLeft: 4 }}>{concept}~</span>}
    </span>
  )
}
