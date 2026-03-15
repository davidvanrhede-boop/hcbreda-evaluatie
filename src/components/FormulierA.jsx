import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { CAT1_CRITERIA, CAT2_CRITERIA, CAT3_CRITERIA } from '../data/criteria'
import ScoreSelector from './ScoreSelector'
import { colors, s } from '../styles'

const HALFJAAR_OPTIES = ['H1', 'H2']
const LEGE_EVALUATIE = {
  halfjaar: 'H1', eigen_kind: false,
  passing: null, dribbelen: null, schot: null, positiespel: null, tactisch: null, fysiek: null,
  toelichting_cat1: '',
  progressie: null, coachbaarheid: null, inzet: null, zelfreflectie: null, motivatie: null,
  toelichting_cat2: '',
  aanwezigheid: null, attitude_lijn: null, teamsfeer: null, communicatie_ouders: null,
  toelichting_cat3: '',
  ingediend: false,
}

export default function FormulierA({ profiel, speler, onTerug }) {
  const [halfjaar, setHalfjaar] = useState('H1')
  const [form, setForm] = useState({ ...LEGE_EVALUATIE })
  const [laden, setLaden] = useState(true)
  const [opslaan, setOpslaan] = useState(false)
  const [ingediend, setIngediend] = useState(false)
  const [bestaandId, setBestaandId] = useState(null)
  const [melding, setMelding] = useState(null)

  useEffect(() => {
    laadBestaande()
  }, [halfjaar, speler.id])

  async function laadBestaande() {
    setLaden(true)
    const { data } = await supabase
      .from('evaluaties_a')
      .select('*')
      .eq('beoordelaar_id', profiel.id)
      .eq('speler_id', speler.id)
      .eq('halfjaar', halfjaar)
      .eq('seizoen', '2025-2026')
      .single()

    if (data) {
      setForm({ ...data })
      setBestaandId(data.id)
      setIngediend(data.ingediend)
    } else {
      setForm({ ...LEGE_EVALUATIE, halfjaar })
      setBestaandId(null)
      setIngediend(false)
    }
    setLaden(false)
  }

  function setScore(veld, waarde) {
    setForm(f => ({ ...f, [veld]: waarde }))
  }

  async function handleOpslaan(definitief) {
    setOpslaan(true)
    setMelding(null)

    const payload = {
      ...form,
      beoordelaar_id: profiel.id,
      speler_id: speler.id,
      seizoen: '2025-2026',
      ingediend: definitief,
      updated_at: new Date().toISOString(),
    }

    let fout
    if (bestaandId) {
      const { error } = await supabase.from('evaluaties_a').update(payload).eq('id', bestaandId)
      fout = error
    } else {
      const { data, error } = await supabase.from('evaluaties_a').insert(payload).select().single()
      if (data) setBestaandId(data.id)
      fout = error
    }

    if (fout) {
      setMelding({ type: 'fout', tekst: 'Opslaan mislukt: ' + fout.message })
    } else {
      setMelding({ type: 'ok', tekst: definitief ? 'Evaluatie ingediend! Je kunt deze niet meer wijzigen.' : 'Concept opgeslagen.' })
      if (definitief) setIngediend(true)
    }
    setOpslaan(false)
  }

  const isVolledig = () => {
    const c1 = [form.passing, form.dribbelen, form.schot, form.positiespel, form.tactisch, form.fysiek].every(Boolean)
    const c2 = [form.progressie, form.coachbaarheid, form.inzet, form.zelfreflectie, form.motivatie].every(Boolean)
    const c3 = [form.aanwezigheid, form.attitude_lijn, form.teamsfeer, form.communicatie_ouders].every(Boolean)
    return c1 && c2 && c3
  }

  if (laden) return <div style={{ textAlign: 'center', padding: 40 }}>Laden...</div>

  return (
    <div>
      {/* Terug + spelerinfo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onTerug} style={s.btnSmall('#E2E8F0', colors.dark)}>← Terug</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{speler.naam}</div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            Formulier A — {profiel.rol === 'coach' ? 'Coach' : 'Trainer'}beoordeling
          </div>
        </div>
      </div>

      {/* Halfjaar selector */}
      <div style={s.card}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Halfjaar:</span>
          {HALFJAAR_OPTIES.map(hj => (
            <button
              key={hj}
              onClick={() => !ingediend && setHalfjaar(hj)}
              style={{
                ...s.btnSmall(halfjaar === hj ? colors.blue : colors.gray2, halfjaar === hj ? colors.white : colors.dark),
                minWidth: 60,
              }}
            >
              {hj}
            </button>
          ))}

          {/* Eigen kind vlag */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.eigen_kind}
              onChange={e => setScore('eigen_kind', e.target.checked)}
              disabled={ingediend}
              style={{ width: 16, height: 16 }}
            />
            Dit is mijn eigen kind
          </label>
        </div>

        {form.eigen_kind && (
          <div style={{ ...s.alert('#EDE9FE', '#C4B5FD', '#7C3AED'), marginTop: 12, marginBottom: 0 }}>
            <strong>Let op:</strong> Jouw scores worden <strong>automatisch uitgesloten</strong> van de berekening.
            De toelichting is wél zichtbaar voor de HOT als context.
          </div>
        )}

        {ingediend && (
          <div style={{ ...s.alert('#D1FAE5', '#6EE7B7', colors.green), marginTop: 12, marginBottom: 0 }}>
            ✓ Ingediend — deze beoordeling is definitief en kan niet meer worden gewijzigd.
          </div>
        )}
      </div>

      {/* Melding */}
      {melding && (
        <div style={s.alert(
          melding.type === 'ok' ? '#D1FAE5' : '#FEE2E2',
          melding.type === 'ok' ? '#6EE7B7' : '#FCA5A5',
          melding.type === 'ok' ? colors.green : colors.red,
        )}>
          {melding.tekst}
        </div>
      )}

      {/* CATEGORIE 1 */}
      <div style={s.card}>
        <div style={{
          background: colors.blue, color: colors.white, borderRadius: 7,
          padding: '10px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700 }}>Categorie 1 — Huidig niveau als hockeyspeler</span>
          <span style={{ fontWeight: 700 }}>Weging: 60%</span>
        </div>

        {CAT1_CRITERIA.map(c => (
          <ScoreSelector
            key={c.id} criterium={c}
            value={form[c.id]}
            onChange={v => setScore(c.id, v)}
            readonly={ingediend}
          />
        ))}

        <div>
          <label style={s.label}>Toelichting categorie 1 (optioneel)</label>
          <textarea
            value={form.toelichting_cat1}
            onChange={e => setScore('toelichting_cat1', e.target.value)}
            placeholder="Algemene opmerkingen over het huidige niveau van de speler..."
            disabled={ingediend}
            style={s.textarea}
          />
        </div>
      </div>

      {/* CATEGORIE 2 */}
      <div style={s.card}>
        <div style={{
          background: colors.green, color: colors.white, borderRadius: 7,
          padding: '10px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700 }}>Categorie 2 — Ontwikkeling & leervermogen</span>
          <span style={{ fontWeight: 700 }}>Weging: 30%</span>
        </div>

        {CAT2_CRITERIA.map(c => (
          <ScoreSelector
            key={c.id} criterium={c}
            value={form[c.id]}
            onChange={v => setScore(c.id, v)}
            readonly={ingediend}
          />
        ))}

        <div>
          <label style={s.label}>Toelichting categorie 2 (optioneel)</label>
          <textarea
            value={form.toelichting_cat2}
            onChange={e => setScore('toelichting_cat2', e.target.value)}
            placeholder="Opmerkingen over de ontwikkeling en leervermogen..."
            disabled={ingediend}
            style={s.textarea}
          />
        </div>
      </div>

      {/* CATEGORIE 3 */}
      <div style={s.card}>
        <div style={{
          background: colors.orange, color: colors.white, borderRadius: 7,
          padding: '10px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700 }}>Categorie 3 — Betrokkenheid ouders</span>
          <span style={{ fontWeight: 700 }}>Weging: 10%</span>
        </div>

        {CAT3_CRITERIA.map(c => (
          <ScoreSelector
            key={c.id} criterium={c}
            value={form[c.id]}
            onChange={v => setScore(c.id, v)}
            readonly={ingediend}
          />
        ))}

        <div>
          <label style={s.label}>Toelichting categorie 3 (optioneel)</label>
          <textarea
            value={form.toelichting_cat3}
            onChange={e => setScore('toelichting_cat3', e.target.value)}
            placeholder="Opmerkingen over de betrokkenheid van ouders..."
            disabled={ingediend}
            style={s.textarea}
          />
        </div>
      </div>

      {/* Opslaan knoppen */}
      {!ingediend && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={() => handleOpslaan(false)}
            disabled={opslaan}
            style={s.btn('#E2E8F0', colors.dark)}
          >
            💾 Concept opslaan
          </button>
          <button
            onClick={() => {
              if (!isVolledig()) {
                setMelding({ type: 'fout', tekst: 'Vul alle scores in voordat je indient.' })
                return
              }
              if (confirm('Weet je zeker dat je wilt indienen? Je kunt de scores daarna niet meer aanpassen.')) {
                handleOpslaan(true)
              }
            }}
            disabled={opslaan}
            style={s.btn(colors.green)}
          >
            ✓ Indienen
          </button>
        </div>
      )}
    </div>
  )
}
