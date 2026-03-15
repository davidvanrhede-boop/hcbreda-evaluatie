import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { colors, s } from '../styles'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState('')

  async function handleInloggen(e) {
    e.preventDefault()
    setLaden(true)
    setFout('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord })

    if (error) {
      setFout('Inloggen mislukt. Controleer je e-mailadres en wachtwoord.')
      setLaden(false)
      return
    }

    // Haal profiel op
    const { data: profiel } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    onLogin(data.user, profiel)
    setLaden(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: colors.gray,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header blok */}
        <div style={{
          background: colors.dark, borderRadius: '10px 10px 0 0',
          padding: '28px 32px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#8FA3B8', letterSpacing: 1, marginBottom: 6 }}>
            HC BREDA
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
            Evaluatieproces
          </div>
          <div style={{ fontSize: 14, color: '#8FA3B8' }}>Seizoen 2025–2026</div>
        </div>

        {/* Formulier */}
        <div style={{
          background: colors.white, borderRadius: '0 0 10px 10px',
          padding: '28px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        }}>
          {fout && (
            <div style={s.alert('#FEE2E2', '#FCA5A5', colors.red)}>
              {fout}
            </div>
          )}

          <form onSubmit={handleInloggen}>
            <div style={{ marginBottom: 18 }}>
              <label style={s.label}>E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="naam@hcbreda.nl"
                required
                style={s.input}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={s.label}>Wachtwoord</label>
              <input
                type="password"
                value={wachtwoord}
                onChange={e => setWachtwoord(e.target.value)}
                placeholder="••••••••"
                required
                style={s.input}
              />
            </div>

            <button
              type="submit"
              disabled={laden}
              style={{ ...s.btn(colors.blue), width: '100%', padding: '12px', fontSize: 15, opacity: laden ? 0.7 : 1 }}
            >
              {laden ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>

          <div style={{
            marginTop: 20, padding: '12px 16px', background: colors.blueLight,
            borderRadius: 7, fontSize: 13, color: colors.blue,
          }}>
            <strong>Geen account?</strong> Neem contact op met de HOT om toegang aan te vragen.
          </div>
        </div>
      </div>
    </div>
  )
}
