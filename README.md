# NanoSat IoT Business Plan

Applicazione web per la creazione e simulazione di business plan per startup nel settore IoT satellitare.

## Funzionalita'

### Wizard Guidato (6 Step)
1. **Il Tuo Progetto** - Scegli scenario di partenza (WORST/MEDIUM/BEST)
2. **Il Mercato** - Definisci sensori target, prezzi e churn
3. **L'Infrastruttura** - Configura la costellazione di satelliti
4. **Acquisizione Clienti** - Imposta il CAC e analizza LTV/CAC
5. **Il Team** - Pianifica crescita del team e costi
6. **I Finanziamenti** - Definisci le fonti di funding

### Dashboard Completa
- **Dashboard** - KPI principali e grafici riassuntivi
- **Assumptions** - Tutti gli input modificabili
- **Ricavi** - Calcolo ricavi da subscription, premium e hardware
- **Conto Economico** - CE completo con EBITDA e utile netto
- **Cash Flow** - Rendiconto finanziario con FCF
- **KPI** - Metriche SaaS (MRR, ARR, LTV, CAC, Churn, Rule of 40)
- **Valutazione** - Valuation con Revenue Multiple, ARR Multiple e DCF

### Caratteristiche
- Calcoli integrati CE/SP/CF (il bilancio quadra!)
- 3 scenari preconfigurati (WORST, MEDIUM, BEST)
- Salvataggio automatico in localStorage
- Spiegazioni contestuali per ogni metrica
- Grafici interattivi con Recharts
- Responsive design con Tailwind CSS

## Installazione

```bash
# Clona o scarica il progetto
cd BusinessPlanSatelliti

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'applicazione sara' disponibile su http://localhost:3000

## Build per Produzione

```bash
# Crea la build ottimizzata
npm run build

# Preview della build
npm run preview
```

## Stack Tecnologico

- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Grafici
- **Lucide React** - Icone

## Struttura Progetto

```
BusinessPlanSatelliti/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx
```

## Utilizzo

1. **Avvia** l'applicazione con `npm run dev`
2. **Scegli** tra Dashboard e Guida (wizard) nell'header
3. **Compila** il wizard passo per passo o modifica direttamente nella dashboard
4. **Analizza** i risultati nei vari tab
5. I dati vengono **salvati automaticamente** nel browser

## KPI Spiegati

| KPI | Descrizione | Target |
|-----|-------------|--------|
| LTV/CAC | Valore cliente / Costo acquisizione | >= 3x |
| CAC Payback | Mesi per recuperare il CAC | < 12 mesi |
| Churn | % clienti persi al mese | < 2% |
| Rule of 40 | Crescita% + EBITDA% | >= 40% |
| Runway | Mesi di sopravvivenza | >= 18 mesi |

## Licenza

MIT
