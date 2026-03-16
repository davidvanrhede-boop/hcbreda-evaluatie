import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { colors, s } from '../styles'

// SheetJS via CDN — geladen in index.html
// import * as XLSX from 'xlsx'  ← wordt globaal geladen

export default function ExcelUpload({ profiel, onVernieuwen }) {
  const [stap, setStap] = useState('idle') // idle | verwerken | klaar | fout
  const [resultaat, setResultaat] = useState(null)
  const [fout, setFout] = useState(null)

  async function handleBestand(e) {
    const bestand = e.target.files[0]
    if (!bestand) return
    if (!bestand.name.endsWith('.xlsx')) {
      setFout('Alleen .xlsx bestanden zijn toegestaan.')
      return
    }

    setStap('verwerken')
    setFout(null)
    setResultaat(null)

    try {
      const data = await bestand.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })

      // ─── SPELERS TAB ─────────────────────────────────────
      const spelersSheet = workbook.Sheets['Spelers']
      if (!spelersSheet) throw new Error('Tab "Spelers" niet gevonden in het Excel bestand.')
      const spelersRijen = XLSX.utils.sheet_to_json(spelersSheet, { header: 1, defval: '' })

      // Zoek de koprij (bevat "Naam speler")
      let koprij = -1
      for (let i = 0; i < spelersRijen.length; i++) {
        if (String(spelersRijen[i][0]).toLowerCase().includes('naam')) { koprij = i; break }
      }
      if (koprij === -1) throw new Error('Koptekstrij niet gevonden in tab "Spelers". Zorg dat rij 4 de kolomnamen bevat.')

      const spelersData = spelersRijen.slice(koprij + 1).filter(r => r[0] && String(r[0]).trim())
      
      // ─── COACHES TAB ─────────────────────────────────────
      const coachesSheet = workbook.Sheets['Coaches & Trainers']
      if (!coachesSheet) throw new Error('Tab "Coaches & Trainers" niet gevonden.')
      const coachesRijen = XLSX.utils.sheet_to_json(coachesSheet, { header: 1, defval: '' })

      let coachKoprij = -1
      for (let i = 0; i < coachesRijen.length; i++) {
        if (String(coachesRijen[i][0]).toLowerCase().includes('naam')) { coachKoprij = i; break }
      }
      if (coachKoprij === -1) throw new Error('Koptekstrij niet gevonden in tab "Coaches & Trainers".')

      const coachesData = coachesRijen.slice(coachKoprij + 1).filter(r => r[0] && String(r[0]).trim())

      // ─── VERWERKEN ───────────────────────────────────────
      let spelersToegevoegd = 0
      let coachesToegevoegd = 0
      const fouten = []

      // Teams ophalen of aanmaken
      async function haalOfMaakTeam(lichting, geslacht, kleur) {
        lichting = String(lichting).trim().toUpperCase()
        geslacht = String(geslacht).trim().toUpperCase()
        kleur = String(kleur).trim()

        if (!lichting || !geslacht || !kleur) return null

        // Bestaat dit team al?
        const { data: bestaand } = await supabase
          .from('teams')
          .select('id')
          .eq('lichting', lichting)
          .eq('geslacht', geslacht)
          .eq('kleur', kleur)
          .single()

        if (bestaand) return bestaand.id

        // Nieuw team aanmaken
        const { data: nieuw, error } = await supabase
          .from('teams')
          .insert({ naam: `${lichting} ${geslacht === 'J' ? 'Jongens' : 'Meisjes'} ${kleur}`, lichting, geslacht, kleur })
          .select('id')
          .single()

        if (error) { fouten.push(`Team aanmaken mislukt: ${lichting} ${geslacht} ${kleur}`); return null }
        return nieuw.id
      }

      // Spelers verwerken
      for (const rij of spelersData) {
        const naam = String(rij[0] || '').trim()
        const lichting = String(rij[1] || '').trim()
        const geslacht = String(rij[2] || '').trim().toUpperCase()
        const kleur = String(rij[3] || '').trim()
        const geboortejaar = rij[4] ? parseInt(rij[4]) : null

        if (!naam || !lichting || !geslacht || !kleur) {
          fouten.push(`Speler overgeslagen (onvolledig): ${naam || '(leeg)'}`)
          continue
        }

        const teamId = await haalOfMaakTeam(lichting, geslacht, kleur)
        if (!teamId) continue

        const { error } = await supabase
          .from('spelers')
          .upsert({ naam, team_id: teamId, geslacht, geboortejaar }, { onConflict: 'naam,team_id' })

        if (error) fouten.push(`Speler mislukt: ${naam} — ${error.message}`)
        else spelersToegevoegd++
      }

      // Coaches verwerken
      for (const rij of coachesData) {
        const naam = String(rij[0] || '').trim()
        const email = String(rij[1] || '').trim().toLowerCase()
        const rol = String(rij[2] || 'coach').trim().toLowerCase()
        const lichting = String(rij[3] || '').trim()
        const geslacht = String(rij[4] || '').trim().toUpperCase()
        const kleur = String(rij[5] || '').trim()

        if (!naam || !email) {
          fouten.push(`Coach overgeslagen (naam/email ontbreekt): ${naam || '(leeg)'}`)
          continue
        }

        // Maak Supabase auth user aan
        const { data: authData, error: authError } = await supabase.auth.admin?.createUser({
          email, password: 'HCBreda2025!',
          user_metadata: { naam, rol },
          email_confirm: true,
        })

        // Als admin niet beschikbaar is, sla profiel op basis van bestaande user
        let userId = authData?.user?.id

        if (authError || !userId) {
          // Kijk of gebruiker al bestaat
          const { data: bestaandProfiel } = await supabase
            .from('profiles')
            .select('id')
            .eq('naam', naam)
            .single()

          if (!bestaandProfiel) {
            fouten.push(`Coach account aanmaken mislukt (doe dit handmatig in Supabase): ${email}`)
          }
          userId = bestaandProfiel?.id
        }

        if (userId && lichting && geslacht && kleur) {
          const teamId = await haalOfMaakTeam(lichting, geslacht, kleur)
          if (teamId) {
            await supabase
              .from('team_assignments')
              .upsert({ profiel_id: userId, team_id: teamId, seizoen: '2025-2026' }, { onConflict: 'profiel_id,team_id,seizoen' })
          }
        }

        coachesToegevoegd++
      }

      // Upload log opslaan
      await supabase.from('upload_log').insert({
        geupload_door: profiel.id,
        bestandsnaam: bestand.name,
        spelers_toegevoegd: spelersToegevoegd,
        coaches_toegevoegd: coachesToegevoegd,
        fouten: fouten.length ? fouten.join('\n') : null,
      })

      setResultaat({ spelersToegevoegd, coachesToegevoegd, fouten })
      setStap('klaar')
      onVernieuwen()

    } catch (err) {
      setFout(err.message)
      setStap('fout')
    }

    // Reset file input
    e.target.value = ''
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={s.h2}>📥 Excel upload — Spelers & Coaches</div>

      <div style={{
        border: `2px dashed ${colors.gray2}`, borderRadius: 10,
        padding: '24px', textAlign: 'center', background: '#FAFBFC',
        marginBottom: 16,
      }}>
        {stap === 'verwerken' ? (
          <div style={{ color: colors.textMuted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 600 }}>Bezig met verwerken...</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Even geduld — teams, spelers en coaches worden aangemaakt.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Sleep een .xlsx bestand hierheen of klik om te kiezen</div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
              Gebruik het meegeleverde template met de tabbladen "Spelers" en "Coaches & Trainers"
            </div>
            <label style={{
              ...s.btn(colors.blue), display: 'inline-block', cursor: 'pointer', padding: '10px 24px',
            }}>
              📂 Bestand kiezen
              <input type="file" accept=".xlsx" onChange={handleBestand} style={{ display: 'none' }} />
            </label>
          </>
        )}
      </div>

      {/* Resultaat */}
      {stap === 'klaar' && resultaat && (
        <div style={{ ...s.alert('#D1FAE5', '#6EE7B7', colors.green), marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>✅ Upload voltooid!</div>
          <div>Spelers toegevoegd: <strong>{resultaat.spelersToegevoegd}</strong></div>
          <div>Coaches/trainers verwerkt: <strong>{resultaat.coachesToegevoegd}</strong></div>
          {resultaat.fouten.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600, color: colors.orange }}>⚠ Let op ({resultaat.fouten.length} waarschuwing(en)):</div>
              {resultaat.fouten.map((f, i) => (
                <div key={i} style={{ fontSize: 12, marginTop: 2 }}>• {f}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {(stap === 'fout' || fout) && (
        <div style={s.alert('#FEE2E2', '#FCA5A5', colors.red)}>
          <strong>Fout:</strong> {fout}
        </div>
      )}

      {/* Template download knop */}
      <div style={{ fontSize: 13, color: colors.textMuted }}>
        Nog geen template?{' '}
        <a
          href="https://hcbreda-evaluatie.vercel.app/hcbreda_upload_template.xlsx"
          style={{ color: colors.blue, fontWeight: 600 }}
        >
          Download het template hier
        </a>
        {' '}— of vraag het op bij de HOT.
      </div>
    </div>
  )
}
