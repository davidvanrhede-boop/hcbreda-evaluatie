import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { CATB_CRITERIA } from '../data/criteria'
import ScoreSelector from './ScoreSelector'
import { colors, s } from '../styles'

const LEGE_EVALUATIE_B = {
  selectiedag: 1, eigen_kind: false,
  technisch: null, samenwerking: null, beslissingen: null,
  inzet_wedstrijd: null, gedrag: null, zichtbaarheid: null,
  vergelijking_groep: '', opmerkingen: '',
  ingediend: false,
}

const VERGELIJKING_OPTIES = ['Top van de groep', 'Boven gemiddeld', 'Op niveau', 'Onder gemiddeld', 'Ver onder niveau']

export default function FormulierB({ profiel, speler, onTerug }) {
  const [selectiedag, setSelectiedag] = useState(1)
  const [form, setForm] = useState({ ...LEGE_EVALUATIE_B })
  const [laden, setLaden] = useState(true)
  const [opslaan, setOpslaan] = useState(false)
  const [ingediend, setIngediend] = useState(false)
  const [bestaandId, setBestaandId] = useState(null)
  const [melding, setMelding] = useState(null)

  useEffect(() => { laadBestaande() }, [selectiedag, speler.id])

  async function laadBestaande() {
    setLaden(true)
    const { data } = await supabase
      .from('evaluaties_b')
      .select('*')
      .eq('beoordelaar_id', profiel.id)
      .eq('speler_id', speler.id)
      .eq('selectiedag', selectiedag)
      .eq('seizoen', '2025-2026')
      .single()

    if (data) {
      setForm({ ...data })
      setBestaandId(data.id)
      setIngediend(data.ingediend)
    } else {
      setForm({ ...LEGE_EVALUATIE_B, selectiedag })
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
    }

    let fout
    if (bestaandId) {
      const { error } = await supabase.from('evaluaties_b').update(payload).eq('id', bestaandId)
      fout = error
    } else {
      const { data, error } = await supabase.from('evaluaties_b').insert(payload).select().single()
      if (data) setBestaandId(data.id)
      fout = error
    }

    if (fout) {
      setMelding({ type: 'fout', tekst: 'Opslaan mislukt: ' + fout.message })
    } else {
      setMelding({ type: 'ok', tekst: definitief ? 'Ingediend!' : 'Concept opgeslagen.' })
      if (definitief) setIngediend(true)
    }
    setOpslaan(false)
  }

  const isVolledig = () =>
    [form.technisch, form.samenwerking, form.beslissingen, form.inzet_wedstrijd, form.gedrag, form.zichtbaarheid].every(Boolean)

  if (laden) return <div style={{ textAlign: 'center', padding: 40 }}>Laden...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onTerug} style={s.btnSmall('#E2E8F0', colors.dark)}>← Terug</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{speler.naam}</div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>Formulier B — Selectiedag observatie</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Selectiedag:</span>
          {[1, 2, 3].map(dag => (
            <button
              key={dag}
              onClick={() => !ingediend && setSelectiedag(dag)}
              style={s.btnSmall(selectiedag === dag ? colors.green : colors.gray2, selectiedag === dag ? colors.white : colors.dark)}
            >
              Dag {dag} {dag === 1 ? '(voor winterstop)' : '(na winterstop)'}
            </button>
          ))}

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.eigen_kind}
              onChange={e => setScore('eigen_kind', e.target.checked)}
              disabled={ingediend} style={{ width: 16, height: 16 }} />
            Dit is mijn eigen kind
          </label>
        </div>

        {form.eigen_kind && (
          <div style={{ ...s.alert('#EDE9FE', '#C4B5FD', '#7C3AED'), marginTop: 12, marginBottom: 0 }}>
            <strong>Let op:</strong> Scores worden automatisch uitgesloten — toelichting blijft zichtbaar voor de HOT.
          </div>
        )}
        {ingediend && (
          <div style={{ ...s.alert('#D1FAE5', '#6EE7B7', colors.green), marginTop: 12, marginBottom: 0 }}>
            ✓ Ingediend — definitief.
          </div>
        )}
      </div>

      {melding && (
        <div style={s.alert(
          melding.type === 'ok' ? '#D1FAE5' : '#FEE2E2',
          melding.type === 'ok' ? '#6EE7B7' : '#FCA5A5',
          melding.type === 'ok' ? colors.green : colors.red,
        )}>{melding.tekst}</div>
      )}

      <div style={s.card}>
        <div style={{
          background: colors.blue, color: colors.white, borderRadius: 7,
          padding: '10px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700 }}>Wedstrijdprestatie & gedrag</span>
          <span style={{ fontWeight: 700 }}>Selectiedag {selectiedag}</span>
        </div>

        {CATB_CRITERIA.map(c => (
          <ScoreSelector key={c.id} criterium={c} value={form[c.id]}
            onChange={v => setScore(c.id, v)} readonly={ingediend} />
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Vergelijking met de groep op deze dag</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VERGELIJKING_OPTIES.map(opt => (
              <button key={opt} type="button" disabled={ingediend}
                onClick={() => setScore('vergelijking_groep', opt)}
                style={{
                  ...s.btnSmall(
                    form.vergelijking_groep === opt ? colors.dark : colors.gray2,
                    form.vergelijking_groep === opt ? colors.white : colors.dark
                  ), fontSize: 12,
                }}
              >{opt}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={s.label}>Specifieke momenten & opmerkingen</label>
          <textarea value={form.opmerkingen}
            onChange={e => setScore('opmerkingen', e.target.value)}
            placeholder="Beschrijf opvallende momenten uit de wedstrijd..."
            disabled={ingediend} style={s.textarea} />
        </div>
      </div>

      {!ingediend && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => handleOpslaan(false)} disabled={opslaan} style={s.btn('#E2E8F0', colors.dark)}>
            💾 Concept opslaan
          </button>
          <button
            onClick={() => {
              if (!isVolledig()) {
                setMelding({ type: 'fout', tekst: 'Vul alle zes criteria in voordat je indient.' })
                return
              }
              if (confirm('Weet je zeker dat je wilt indienen?')) handleOpslaan(true)
            }}
            disabled={opslaan} style={s.btn(colors.green)}
          >
            ✓ Indienen
          </button>
        </div>
      )}
    </div>
  )
}
