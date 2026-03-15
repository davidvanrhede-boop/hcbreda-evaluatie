import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import BeoordelaarView from './components/BeoordelaarView'
import ObservatorView from './components/ObservatorView'
import HotDashboard from './components/HotDashboard'
import { colors, s } from './styles'

const ROL_LABELS = {
  coach: 'Coach',
  trainer: 'Trainer',
  observator: 'Observator',
  hot: 'HOT',
}

const ROL_KLEUREN = {
  coach: colors.blue,
  trainer: colors.green,
  observator: colors.dark,
  hot: colors.purple,
}

export default function App() {
  const [user, setUser] = useState(null)
  const [profiel, setProfiel] = useState(null)
  const [laden, setLaden] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (session?.user) {
          await laadProfiel(session.user)
        }
      } catch(e) {
        console.error('Sessie fout:', e)
      } finally {
        setLaden(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          await laadProfiel(session.user)
        } else {
          setUser(null)
          setProfiel(null)
        }
      } catch(e) {
        console.error('Auth fout:', e)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function laadProfiel(u) {
    setUser(u)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()
      if (error) {
        console.error('Profiel fout:', error)
        // Maak een noodprofiel op basis van metadata
        const meta = u.user_metadata || {}
        setProfiel({ id: u.id, naam: meta.naam || u.email, rol: meta.rol || 'hot' })
      } else {
        setProfiel(data)
      }
    } catch(e) {
      console.error('Profiel ophalen mislukt:', e)
      setProfiel({ id: u.id, naam: u.email, rol: 'hot' })
    }
  }

  async function handleUitloggen() {
    await supabase.auth.signOut()
    setUser(null)
    setProfiel(null)
  }

  if (laden) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.gray }}>
        <div style={{ textAlign: 'center', color: colors.textMuted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏑</div>
          <div>HC Breda laden...</div>
        </div>
      </div>
    )
  }

  if (!user || !profiel) {
    return <Login onLogin={(u, p) => { setUser(u); setProfiel(p) }} />
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>
            🏑 HC BREDA — Evaluatieproces Veldhockey
          </div>
          <div style={s.headerSub}>Seizoen 2025–2026</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.white }}>{profiel.naam}</div>
            <div>
              <span style={{
                ...s.badge(ROL_KLEUREN[profiel.rol] || colors.blue, colors.white),
                fontSize: 11,
              }}>
                {ROL_LABELS[profiel.rol] || profiel.rol}
              </span>
            </div>
          </div>
          <button onClick={handleUitloggen} style={s.btnSmall('#2A3A50', '#8FA3B8')}>
            Uitloggen
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={s.container}>
        {(profiel.rol === 'coach' || profiel.rol === 'trainer') && (
          <BeoordelaarView profiel={profiel} />
        )}
        {profiel.rol === 'observator' && (
          <ObservatorView profiel={profiel} />
        )}
        {profiel.rol === 'hot' && (
          <HotDashboard profiel={profiel} />
        )}
        {!['coach', 'trainer', 'observator', 'hot'].includes(profiel.rol) && (
          <div style={s.alert('#FEE2E2', '#FCA5A5', colors.red)}>
            Onbekende rol: {profiel.rol}. Neem contact op met de HOT.
          </div>
        )}
      </div>
    </div>
  )
}
