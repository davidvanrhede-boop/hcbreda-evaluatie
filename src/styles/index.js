export const colors = {
  dark: '#1A2332',
  blue: '#2D5A8E',
  blueLight: '#DBEAFE',
  green: '#2A8E5A',
  greenLight: '#D1FAE5',
  orange: '#D97706',
  orangeLight: '#FEF3C7',
  red: '#C0392B',
  redLight: '#FEE2E2',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  gray: '#F1F5F9',
  gray2: '#E2E8F0',
  white: '#FFFFFF',
  text: '#1A2332',
  textMuted: '#64748B',
}

export const s = {
  // Layout
  page: { minHeight: '100vh', background: colors.gray, padding: '0' },
  container: { maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' },

  // Header
  header: {
    background: colors.dark, color: colors.white,
    padding: '14px 24px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { fontWeight: 700, fontSize: 16, letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: '#8FA3B8' },

  // Cards
  card: {
    background: colors.white, borderRadius: 10,
    border: `1px solid ${colors.gray2}`, padding: '20px 24px',
    marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },

  // Buttons
  btn: (bg, text) => ({
    background: bg || colors.blue, color: text || colors.white,
    border: 'none', borderRadius: 7, padding: '10px 20px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    transition: 'opacity 0.15s',
  }),
  btnSmall: (bg, text) => ({
    background: bg || colors.blue, color: text || colors.white,
    border: 'none', borderRadius: 6, padding: '6px 14px',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  }),

  // Inputs
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    border: `1.5px solid ${colors.gray2}`, fontSize: 14,
    outline: 'none', background: colors.white,
  },
  textarea: {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    border: `1.5px solid ${colors.gray2}`, fontSize: 14,
    outline: 'none', resize: 'vertical', minHeight: 80,
    background: colors.white,
  },

  // Text
  h1: { fontSize: 22, fontWeight: 700, color: colors.dark, marginBottom: 4 },
  h2: { fontSize: 17, fontWeight: 700, color: colors.dark, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' },
  badge: (bg, text) => ({
    display: 'inline-block', background: bg, color: text,
    borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
  }),

  // Status
  alert: (bg, border, text) => ({
    background: bg, border: `1px solid ${border}`, color: text,
    borderRadius: 8, padding: '12px 16px', fontSize: 14, marginBottom: 16,
  }),
}
