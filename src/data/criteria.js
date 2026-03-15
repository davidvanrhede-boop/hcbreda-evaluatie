// ═══════════════════════════════════════════════════════════════
// BEOORDELINGSCRITERIA MET SCOREBESCHRIJVINGEN
// ═══════════════════════════════════════════════════════════════

export const SCORE_LABELS = {
  1: 'Zorgelijk',
  2: 'Matig',
  3: 'Voldoende',
  4: 'Goed',
  5: 'Uitstekend',
}

export const SCORE_COLORS = {
  1: { bg: '#FEE2E2', text: '#C0392B', border: '#F87171' },
  2: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
  3: { bg: '#FFF9C4', text: '#78350F', border: '#FDE047' },
  4: { bg: '#D1FAE5', text: '#2A8E5A', border: '#6EE7B7' },
  5: { bg: '#D1FAE5', text: '#166534', border: '#4ADE80' },
}

// ─── CATEGORIE 1: HUIDIG NIVEAU (60%) ────────────────────────

export const CAT1_CRITERIA = [
  {
    id: 'passing',
    label: '1.1  Passing & ontvangen',
    scores: {
      1: 'Mist de bal frequent bij ontvangen; passing is slordig en onnauwkeurig.',
      2: 'Basispass lukt, maar mist regelmaat; ontvangen gaat nog gepaard met fouten.',
      3: 'Betrouwbare pass op de juiste momenten; ontvangt rustig en zet door.',
      4: 'Nauwe passes in moeilijke situaties; stelt ploeggenoten goed op.',
      5: 'Uitstekend overzicht en precisie; past aan op het tempo en niveau van de ontvanger.',
    },
  },
  {
    id: 'dribbelen',
    label: '1.2  Dribbelvaardigheden',
    scores: {
      1: 'Verliest de bal vaak bij eerste contact met een tegenstander.',
      2: 'Dribbelt in rechte lijn, wordt makkelijk onderschept bij richtingverandering.',
      3: 'Kan een speler passeren met een basismove; redelijke balcontrole.',
      4: 'Wisselt tempo en richting; dribbelt effectief in meerdere richtingen.',
      5: 'Speelt vlotjes door meerdere verdedigers; uitstekende balbehandeling onder druk.',
    },
  },
  {
    id: 'schot',
    label: '1.3  Schot op doel',
    scores: {
      1: 'Schot is ongecontroleerd, mist vaak het doel volledig.',
      2: 'Schiet wel richting doel, maar zonder kracht of precisie.',
      3: 'Schiet op doel met redelijke techniek; kiest het juiste moment.',
      4: 'Nauwkeurig en krachtig schot; kiest bewust voor hoek of kracht.',
      5: 'Scoort in moeilijke situaties; varieert techniek (push, slap, flick) afhankelijk van de situatie.',
    },
  },
  {
    id: 'positiespel',
    label: '1.4  Positiespel & ruimtegebruik',
    scores: {
      1: 'Staat zelden op een effectieve positie; loopt zich niet vrij.',
      2: 'Neemt soms een goede positie in, maar mist structuur.',
      3: 'Begrijpt basisposities; loopt geregeld vrij en vraagt de bal.',
      4: 'Maakt bewust ruimte voor anderen; staat bij verlies meteen op de juiste plek.',
      5: 'Optimaal gebruik van de ruimte; zorgt altijd voor een uitweg voor ploeggenoten.',
    },
  },
  {
    id: 'tactisch',
    label: '1.5  Tactisch inzicht',
    scores: {
      1: 'Reageert te laat op spelsituaties; begrijpt de basisstructuur van het spel niet.',
      2: 'Herkent bekende situaties, maar gaat mis bij snel wisselend spel.',
      3: 'Leest het spel op leeftijdsniveau; neemt redelijke beslissingen.',
      4: 'Anticipeert op wat komen gaat; kiest slim tussen verdedigen en aanvallen.',
      5: 'Overtreft leeftijdsniveau in spelbegrip; stuurt actief het spelverloop.',
    },
  },
  {
    id: 'fysiek',
    label: '1.6  Fysieke conditie',
    scores: {
      1: 'Heeft moeite met het bijhouden van het speeltempo; hapt snel naar lucht.',
      2: 'Kan een korte periode mee, maar valt terug in de tweede helft.',
      3: 'Houdt het speeltempo voor de gehele wedstrijd bij.',
      4: 'Blijft sterk in de eindfase; sprint actief mee in aanval en verdediging.',
      5: 'Duidelijk boven het gemiddelde fysieke niveau van de groep; vermoeit nooit.',
    },
  },
]

// ─── CATEGORIE 2: ONTWIKKELING (30%) ─────────────────────────

export const CAT2_CRITERIA = [
  {
    id: 'progressie',
    label: '2.1  Progressie t.o.v. vorige periode',
    scores: {
      1: 'Geen zichtbare vooruitgang; lijkt juist achteruit te gaan.',
      2: 'Kleine vooruitgang op een enkel punt, maar stagneert over het geheel.',
      3: 'Merkbare verbetering op meerdere punten; groeit op leeftijdsniveau.',
      4: 'Duidelijke en brede verbetering; haalt sneller bij dan van dezelfde leeftijd verwacht wordt.',
      5: 'Opvallende, versnelde groei op meerdere vlakken; overtreft alle verwachtingen.',
    },
  },
  {
    id: 'coachbaarheid',
    label: '2.2  Coachbaarheid',
    scores: {
      1: 'Reageert defensief op feedback; past gedrag niet aan na instructie.',
      2: 'Accepteert feedback, maar verwerkt dit zelden in het spel.',
      3: 'Staat open voor feedback en past het aan in dezelfde of volgende sessie.',
      4: 'Vraagt actief om feedback; verwerkt het snel en zichtbaar in het spel.',
      5: 'Gebruikt feedback proactief; past aanpassingen duurzaam toe zonder herhaalde instructie.',
    },
  },
  {
    id: 'inzet',
    label: '2.3  Inzet & discipline tijdens training',
    scores: {
      1: 'Weinig focus; is regelmatig afgeleid en doet minimale moeite.',
      2: 'Doet mee, maar schakelt snel terug als het moeilijk wordt.',
      3: 'Neemt trainingen serieus; bereidt zich in bij oefeningen en werkt door.',
      4: 'Werkt consequent hard; dwingt zichzelf door bij vermoeidheid.',
      5: 'Is een voorbeeld voor de groep; trekt anderen mee in hoge intensiteit.',
    },
  },
  {
    id: 'zelfreflectie',
    label: '2.4  Zelfreflectie & leervermogen',
    scores: {
      1: 'Legt fouten buiten zichzelf; herkent eigen aandeel in situaties niet.',
      2: 'Beseft soms dat er iets mis ging, maar analyseert dit niet verder.',
      3: 'Herkent eigen fouten; bespreekt dit en probeert het anders te doen.',
      4: 'Analyseert actief eigen prestaties; trekt zelfstandig conclusies.',
      5: 'Bijzonder sterk vermogen om uit eigen fouten te leren; coacht zichzelf.',
    },
  },
  {
    id: 'motivatie',
    label: '2.5  Motivatie & intrinsieke drive',
    scores: {
      1: 'Lijkt niet gemotiveerd; is aanwezig maar niet betrokken.',
      2: 'Wisselende motivatie; afhankelijk van stemming of succes.',
      3: 'Regelmatige en stabiele motivatie; wil graag goed worden.',
      4: 'Duidelijk gedreven; traint ook buiten het veld aan zijn of haar spel.',
      5: 'Uitzonderlijk gedreven; stelt eigen doelen en houdt zichzelf verantwoordelijk.',
    },
  },
]

// ─── CATEGORIE 3: OUDERS (10%) ────────────────────────────────

export const CAT3_CRITERIA = [
  {
    id: 'aanwezigheid',
    label: '3.1  Aanwezigheid & betrouwbaarheid',
    scores: {
      1: 'Afwezigheid zonder bericht; speler verschijnt regelmatig onverwacht niet.',
      2: 'Meldt soms afwezig maar doet dit te laat of inconsistent.',
      3: 'Meldt tijdig bij afwezigheid; is aanwezig op de verwachte momenten.',
      4: 'Altijd bereikbaar en betrouwbaar; houdt afspraken consequent na.',
      5: 'Proactief betrokken; denkt mee over planning en oplossingen bij afwezigheid.',
    },
  },
  {
    id: 'attitude_lijn',
    label: '3.2  Positieve attitude langs de lijn',
    scores: {
      1: 'Coacht luid vanaf de zijlijn of reageert negatief op scheidsrechters/tegenstanders.',
      2: 'Overwegend rustig, maar af en toe ongepaste reacties langs de lijn.',
      3: 'Aanmoedigend aanwezig; moedigt aan zonder in te grijpen in het spel.',
      4: 'Positieve aanwezigheid voor zowel het eigen kind als de ploeg.',
      5: 'Een echt voorbeeld: enthousiast, positief, respectvol naar alle betrokkenen.',
    },
  },
  {
    id: 'teamsfeer',
    label: '3.3  Bijdrage aan teamsfeer',
    scores: {
      1: 'Gedrag heeft een negatieve invloed op de sfeer binnen de groep of bij andere ouders.',
      2: 'Neutraal aanwezig; geen duidelijke bijdrage in positieve of negatieve zin.',
      3: 'Draagt bij aan een prettige sfeer; is vriendelijk naar andere ouders en staf.',
      4: 'Verbindt ouders; helpt een positieve teamcultuur te creëren.',
      5: 'Actieve bijdrager aan de ploegcultuur; neemt initiatief en trekt anderen mee.',
    },
  },
  {
    id: 'communicatie_ouders',
    label: '3.4  Communicatie met club & staf',
    scores: {
      1: 'Reageert niet of nauwelijks op berichten; onduidelijk of moeilijk bereikbaar.',
      2: 'Communiceert soms, maar inconsistent of te laat.',
      3: 'Reageert tijdig op berichten; houdt staf op de hoogte van relevante zaken.',
      4: 'Proactieve communicatie; denkt mee en geeft ruimte aan coaches.',
      5: 'Uitstekende communicatie; vertrouwt volledig op de staf en ondersteunt dit actief.',
    },
  },
]

// ─── FORMULIER B CRITERIA ────────────────────────────────────

export const CATB_CRITERIA = [
  {
    id: 'technisch',
    label: 'B.1  Technische uitvoering onder druk',
    scores: {
      1: 'Verliest techniek volledig bij druk van een tegenstander.',
      2: 'Techniek breekt af bij hoge druk; basisvaardigheden lukken wel.',
      3: 'Houdt techniek redelijk vast; maakt soms fouten maar herstelt.',
      4: 'Voert technische handelingen betrouwbaar uit, ook onder druk.',
      5: 'Uitstekende technische basis; presteert beter naarmate de wedstrijd intensiever wordt.',
    },
  },
  {
    id: 'samenwerking',
    label: 'B.2  Samenwerking & teamspel',
    scores: {
      1: 'Speelt individualistisch; negeert ploeggenoten.',
      2: 'Speelt soms samen maar kiest vaker voor de individuele actie.',
      3: 'Speelt op leeftijdsniveau samen; past aan op het spel van de ploeg.',
      4: 'Communiceert actief; maakt het spel van anderen beter.',
      5: 'Verbindende speler; organiseert het spel en is essentieel voor teamfunctioneren.',
    },
  },
  {
    id: 'beslissingen',
    label: 'B.3  Beslissingen in het veld',
    scores: {
      1: 'Beslissingen zijn te traag of structureel verkeerd.',
      2: 'Maakt regelmatig verkeerde keuzes, ook in bekende situaties.',
      3: 'Neemt redelijke beslissingen; mist soms het juiste moment.',
      4: 'Kiest consequent de juiste optie; handelt snel en bewust.',
      5: 'Uitzonderlijk beslissingssnelheid; ziet opties die anderen missen.',
    },
  },
  {
    id: 'inzet_wedstrijd',
    label: 'B.4  Inzet & strijdlust',
    scores: {
      1: 'Geeft snel op bij achterstand of tegenslag; minimale inzet.',
      2: 'Wisselende inzet; afhankelijk van de stand of tegenstander.',
      3: 'Solide inzet gedurende de wedstrijd; geeft niet snel op.',
      4: 'Zichtbaar strijdlustig; stuwt de ploeg ook in moeilijke momenten.',
      5: 'Uitzondering in inzet; speelt altijd vol, is nooit tevreden met half werk.',
    },
  },
  {
    id: 'gedrag',
    label: 'B.5  Gedrag bij winst én verlies',
    scores: {
      1: 'Onsportief gedrag: klaagt, beschuldigt anderen of reageert boos bij verlies.',
      2: 'Moeite met omgaan met verlies of kritiek; zichtbare negatieve emoties.',
      3: 'Accepteert resultaat; gedraagt zich gepast in beide situaties.',
      4: 'Sportsmanship; feliciteert tegenstanders en leert van verlies.',
      5: 'Voorbeeldgedrag voor de groep; heeft een positieve invloed op anderen na het spel.',
    },
  },
  {
    id: 'zichtbaarheid',
    label: 'B.6  Zichtbaarheid in het spel',
    scores: {
      1: 'Nauwelijks merkbaar in de wedstrijd; loopt mee zonder impact.',
      2: 'Sporadisch actief; verdwijnt lange perioden uit het spel.',
      3: 'Redelijke aanwezigheid; doet mee op leeftijdsniveau.',
      4: 'Zichtbaar aanwezig; is herkenbaar een van de actiefste spelers.',
      5: 'Domineert het spel; is constant betrokken en bepaalt mede het ritme.',
    },
  },
]

// ─── BEREKENINGSFUNCTIES ─────────────────────────────────────

export function berekenCat1(ev) {
  const scores = [ev.passing, ev.dribbelen, ev.schot, ev.positiespel, ev.tactisch, ev.fysiek].filter(Boolean)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

export function berekenCat2(ev) {
  const scores = [ev.progressie, ev.coachbaarheid, ev.inzet, ev.zelfreflectie, ev.motivatie].filter(Boolean)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

export function berekenCat3(ev) {
  const scores = [ev.aanwezigheid, ev.attitude_lijn, ev.teamsfeer, ev.communicatie_ouders].filter(Boolean)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

export function berekenEindcijfer(cat1, cat2, cat3) {
  if (cat1 == null || cat2 == null || cat3 == null) return null
  return cat1 * 0.6 + cat2 * 0.3 + cat3 * 0.1
}

export function berekenCatB(ev) {
  const scores = [ev.technisch, ev.samenwerking, ev.beslissingen, ev.inzet_wedstrijd, ev.gedrag, ev.zichtbaarheid].filter(Boolean)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}
