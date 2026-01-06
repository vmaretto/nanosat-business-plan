import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Satellite, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Lightbulb, Sliders, BookOpen, Target, ArrowUpRight, ArrowDownRight, HelpCircle, ChevronRight, ChevronLeft, Check, LayoutDashboard, Compass } from 'lucide-react';

// Scenari
const SCENARI = {
  1: { name: 'WORST', sensori: [2500, 10000, 35000], prezzo: [3.0, 2.5, 2.0], churn: 0.03, satelliti: [2, 4, 6], costoSat: [100000, 90000, 80000], costoLancio: 20000, fte: [6, 10, 16], ral: 48000, cac: [35, 28, 22], seed: 300000, seriesA: 1000000, grants: 300000 },
  2: { name: 'MEDIUM', sensori: [5000, 25000, 100000], prezzo: [3.5, 3.0, 2.5], churn: 0.02, satelliti: [4, 8, 12], costoSat: [80000, 70000, 60000], costoLancio: 15000, fte: [9, 17, 27], ral: 50000, cac: [25, 20, 15], seed: 500000, seriesA: 2000000, grants: 650000 },
  3: { name: 'BEST', sensori: [8000, 45000, 200000], prezzo: [4.0, 3.5, 3.0], churn: 0.01, satelliti: [6, 14, 24], costoSat: [70000, 60000, 50000], costoLancio: 12000, fte: [12, 25, 40], ral: 52000, cac: [18, 14, 10], seed: 800000, seriesA: 3500000, grants: 1000000 }
};

// Descrizioni KPI complete
const KPI_INFO = {
  // KPI Classici
  grossMargin: {
    name: 'Gross Margin %',
    cosa: 'Percentuale di ricavi che resta dopo i costi diretti (ground station, cloud)',
    esempio: 'Incassi 100€, costi diretti 30€ → Gross Margin = 70%',
    perche: 'Un margine alto (>60%) significa che ogni cliente porta soldi da reinvestire. Se è basso devi vendere tantissimo solo per coprire i costi fissi.',
    target: '>65% per SaaS/tech. Sotto 50% problema serio.',
    come: 'Per migliorarlo: negozia costi infrastruttura, ottimizza uso cloud, aumenta prezzi se il mercato lo permette.'
  },
  ebitdaMargin: {
    name: 'EBITDA Margin %',
    cosa: 'Quanto resta dopo TUTTI i costi operativi, prima di ammortamenti e tasse',
    esempio: 'Ricavi 500k€, costi op. 600k€ → EBITDA=-100k€, margine -20%',
    perche: 'Mostra se il business "gira" operativamente. Può essere negativo all\'inizio ma deve diventare positivo entro 3-4 anni.',
    target: 'Anno 1: può essere negativo. Anno 3: almeno 0% o positivo.',
    come: 'Per migliorarlo: aumenta ricavi più velocemente dei costi, riduci OPEX non essenziali, automatizza processi.'
  },
  netMargin: {
    name: 'Net Profit Margin %',
    cosa: 'Profitto finale dopo TUTTO: costi, ammortamenti, interessi, tasse',
    esempio: 'Ricavi 1M€, utile netto 100k€ → Net Margin = 10%',
    perche: 'Gli investitori guardano quando l\'utile diventa positivo. Una startup può restare in perdita per anni ma serve un piano credibile.',
    target: '>15% a regime (lungo termine).',
    come: 'Per migliorarlo: ottimizza struttura fiscale, riduci ammortamenti con leasing, migliora EBITDA.'
  },
  revenueGrowth: {
    name: 'Revenue Growth YoY',
    cosa: 'Di quanto aumentano i ricavi rispetto all\'anno prima',
    esempio: 'Anno 1=100k€, Anno 2=250k€ → Crescita=+150%',
    perche: 'LA metrica più importante per una startup. Gli investitori valutano in base al potenziale di crescita.',
    target: '>50%/anno buono, >100% eccellente per early-stage.',
    come: 'Per migliorarlo: espandi canali vendita, entra in nuovi mercati, lancia prodotti premium, riduci churn.'
  },
  fcf: {
    name: 'Free Cash Flow',
    cosa: 'Soldi VERI che entrano/escono dalla cassa, dopo spese operative E investimenti',
    esempio: 'CF Operativo 200k€, CAPEX 400k€ → FCF = -200k€',
    perche: 'DIFFERENZA DA UTILE: l\'utile è contabile, il FCF è reale. Puoi avere utile positivo ma FCF negativo.',
    target: 'Positivo entro Anno 3-4.',
    come: 'Per migliorarlo: ritarda CAPEX, negozia pagamenti dilazionati, riduci crediti vs clienti.'
  },
  runway: {
    name: 'Runway',
    cosa: 'Quanti mesi puoi sopravvivere con la cassa attuale bruciando al ritmo corrente',
    esempio: 'Cassa 500k€, bruci 50k€/mese → Runway=10 mesi',
    perche: 'Se il runway è troppo corto devi cercare urgentemente finanziamenti. Gli investitori non finanziano aziende disperate.',
    target: 'Minimo 12 mesi, ideale 18-24. Sotto 6 mesi = EMERGENZA.',
    come: 'Per migliorarlo: raccogli più capitale, riduci burn rate, anticipa ricavi.'
  },
  breakeven: {
    name: 'Break-even Point',
    cosa: 'Ricavi necessari per coprire tutti i costi fissi. Sotto sei in perdita, sopra guadagni.',
    esempio: 'Costi fissi 300k€, margine lordo 70% → Break-even = 430k€ di ricavi',
    perche: 'Sapere il break-even ti dice quanto devi vendere per smettere di perdere soldi. È il traguardo minimo.',
    target: 'Raggiungere entro Anno 2-3.',
    come: 'Per abbassarlo: riduci costi fissi, aumenta margine lordo, negozia con fornitori.'
  },
  // KPI Avanzati
  mrr: {
    name: 'MRR (Monthly Recurring Revenue)',
    cosa: 'Ricavi RICORRENTI ogni mese dalle subscription. Non include vendite una tantum.',
    esempio: '2.500 sensori × 3.5€ = 8.750€ MRR',
    perche: 'LA metrica fondamentale per business in abbonamento. È prevedibile, stabile e permette di pianificare.',
    target: 'In crescita costante mese su mese.',
    come: 'Per migliorarlo: acquisisci più clienti, aumenta ARPU, riduci churn, fai upselling.'
  },
  arr: {
    name: 'ARR (Annual Recurring Revenue)',
    cosa: 'MRR × 12. È il modo standard per valutare aziende SaaS.',
    esempio: 'MRR 50k€ → ARR = 600k€',
    perche: 'Le valutazioni startup SaaS si basano su multipli dell\'ARR (es. valutazione = 10× ARR).',
    target: 'Crescita >50%/anno.',
    come: 'Per migliorarlo: stesse leve dell\'MRR, focus su contratti annuali invece che mensili.'
  },
  cac: {
    name: 'CAC (Customer Acquisition Cost)',
    cosa: 'Quanto spendi in media per acquisire UN nuovo cliente. Include marketing, vendite, promozioni.',
    esempio: 'Spendi 50k€ in marketing, acquisisci 2.000 clienti → CAC = 25€',
    perche: 'Se il CAC è troppo alto rispetto a quanto guadagni dal cliente, il business non è sostenibile.',
    target: 'In calo anno su anno grazie a efficienza.',
    come: 'Per ridurlo: ottimizza canali marketing, migliora conversion rate, usa referral program, content marketing.'
  },
  ltv: {
    name: 'LTV (Customer Lifetime Value)',
    cosa: 'Quanto VALE un cliente durante tutta la sua "vita". Ricavo mensile × durata media.',
    esempio: 'Cliente paga 3€/mese, resta 50 mesi → LTV = 150€',
    perche: 'Se sai quanto vale un cliente, sai quanto puoi spendere per acquisirlo restando profittevole.',
    target: '>3× il CAC.',
    come: 'Per aumentarlo: riduci churn, aumenta ARPU, fai upselling, migliora retention.'
  },
  ltvCac: {
    name: 'LTV/CAC Ratio',
    cosa: 'IL NUMERO PIÙ IMPORTANTE. Rapporto tra valore del cliente e costo di acquisizione.',
    esempio: 'LTV=150€, CAC=25€ → LTV/CAC = 6×',
    perche: '<1× DISASTRO (perdi su ogni cliente). 1-2× PROBLEMATICO. 3× SOGLIA MINIMA. 4-5× BUONO. >5× ECCELLENTE.',
    target: 'Minimo 3×, ideale 4-5×.',
    come: 'Per migliorarlo: aumenta LTV (retention, upselling) E riduci CAC (efficienza marketing).'
  },
  cacPayback: {
    name: 'CAC Payback',
    cosa: 'Mesi per "ripagare" il costo di acquisizione con i ricavi del cliente.',
    esempio: 'CAC=25€, ricavo mensile=3€ → Payback = 8.3 mesi',
    perche: 'Più è lungo, più cash devi avere per crescere. Oltre 24 mesi è molto rischioso.',
    target: '<12 mesi ideale, <18 accettabile.',
    come: 'Per ridurlo: aumenta ARPU primo mese, riduci CAC, offri piani annuali prepagati.'
  },
  churnAnnuo: {
    name: 'Churn Rate Annuo',
    cosa: 'Percentuale di clienti che perdi in un anno.',
    esempio: 'Churn mensile 2% → Churn annuo ≈ 21%',
    perche: 'Alto churn = "riempi una vasca bucata". Devi continuamente acquisire nuovi clienti solo per stare fermo.',
    target: '<10% annuo per B2B SaaS. >20% è preoccupante.',
    come: 'Per ridurlo: migliora onboarding, customer success, qualità prodotto, supporto clienti.'
  },
  rule40: {
    name: 'Rule of 40',
    cosa: 'Crescita% + EBITDA%. Regola empirica per salute complessiva startup SaaS.',
    esempio: 'Crescita 80% + EBITDA -30% = Rule of 40 = 50%',
    perche: 'Bilancia crescita e profittabilità. Puoi bruciare soldi per crescere veloce O crescere piano ma profittevolmente.',
    target: '>40% è buono. Le migliori SaaS pubbliche >60%.',
    come: 'Per migliorarlo: o acceleri la crescita o migliori la profittabilità (o entrambi).'
  },
  revPerEmployee: {
    name: 'Revenue per Employee',
    cosa: 'Quanto fatturato genera ogni dipendente in media.',
    esempio: 'Ricavi 500k€, team 9 persone → 55k€/dipendente',
    perche: 'Misura la produttività del team. Se cresce, stai scalando bene.',
    target: '€100-200k/dipendente per SaaS maturi.',
    come: 'Per migliorarlo: automatizza, usa AI, outsourcing non-core, assumi solo ruoli critici.'
  },
  revPerSat: {
    name: 'Revenue per Satellite',
    cosa: 'Quanto fatturato genera ogni satellite della costellazione.',
    esempio: 'Ricavi 300k€, 4 satelliti → 75k€/satellite',
    perche: 'Misura efficienza dell\'investimento in infrastruttura. Se troppo basso, stai sotto-utilizzando i satelliti.',
    target: 'In crescita, >€100k/satellite a regime.',
    come: 'Per migliorarlo: acquisisci più clienti per satellite, ottimizza capacità, ritarda nuovi lanci.'
  },
  costoPerSensore: {
    name: 'Costo per Sensore Servito',
    cosa: 'Quanto costa all\'azienda servire ogni singolo sensore (costi op. / sensori).',
    esempio: 'Costi 600k€, 5.000 sensori → 120€/sensore',
    perche: 'Deve SCENDERE nel tempo grazie alle economie di scala. Se non scende, il modello non scala.',
    target: 'In calo costante anno su anno.',
    come: 'Per ridurlo: aumenta base clienti, negozia costi fissi, automatizza operazioni.'
  }
};

export default function NanoSatDashboard() {
  const [scenarioId, setScenarioId] = useState(2);
  const [activeSheet, setActiveSheet] = useState('DASHBOARD');
  const [showImpact, setShowImpact] = useState({});
  const [selectedKPI, setSelectedKPI] = useState(null);
  const prevCalcRef = useRef(null);

  // Wizard states
  const [viewMode, setViewMode] = useState('dashboard'); // 'wizard' | 'dashboard'
  const [wizardStep, setWizardStep] = useState(1);
  const [expandedHelp, setExpandedHelp] = useState({});

  // INPUTS
  const [inputs, setInputs] = useState({
    satelliti: [4, 8, 12], costoSat: [80000, 70000, 60000], costoLancio: [15000, 15000, 15000], vitaSatellite: [3, 3, 3],
    sensori: [5000, 25000, 100000], prezzo: [3.5, 3.0, 2.5], churn: [0.02, 0.02, 0.02], cac: [25, 20, 15],
    fte: [9, 17, 27], ral: [50000, 50000, 50000], welfare: [0.15, 0.15, 0.15],
    affitto: [3000, 5000, 8000], groundStation: [5000, 8000, 12000], cloudIT: [2000, 4000, 8000],
    licenze: [50000, 30000, 30000], assicurazione: [25000, 40000, 60000], legal: [30000, 25000, 20000],
    rnd: [100000, 80000, 60000], marketing: [50000, 100000, 150000], travel: [20000, 35000, 50000],
    capitaleFounders: [200000, 0, 0], seed: [500000, 0, 0], seriesA: [0, 2000000, 0], grants: [195000, 260000, 195000],
    premiumPct: [0.05, 0.10, 0.15], premiumExtra: [50, 45, 40], hardwarePct: [0.30, 0.25, 0.20], hardwareMargin: [80, 70, 60],
    revenueMultiple: [8, 8, 8], arrMultiple: [10, 12.5, 15], wacc: [0.25, 0.22, 0.20], terminalGrowth: [0.03, 0.03, 0.03],
    attrezzature: [50000, 30000, 40000],
    ggIncasso: [30, 30, 30], ggPagamento: [60, 60, 60]
  });

  const loadScenario = (id) => {
    const s = SCENARI[id];
    setInputs(prev => ({
      ...prev, sensori: [...s.sensori], prezzo: [...s.prezzo], churn: [s.churn, s.churn, s.churn],
      satelliti: [...s.satelliti], costoSat: [...s.costoSat], costoLancio: [s.costoLancio, s.costoLancio, s.costoLancio],
      fte: [...s.fte], ral: [s.ral, s.ral, s.ral], cac: [...s.cac],
      seed: [s.seed, 0, 0], seriesA: [0, s.seriesA, 0], grants: [s.grants * 0.3, s.grants * 0.4, s.grants * 0.3]
    }));
    setScenarioId(id);
  };

  const updateInput = (key, yearIndex, value) => {
    const percentKeys = ['churn', 'welfare', 'premiumPct', 'hardwarePct', 'wacc', 'terminalGrowth'];
    const actualValue = percentKeys.includes(key) ? value / 100 : value;
    setInputs(prev => ({ ...prev, [key]: prev[key].map((v, idx) => idx === yearIndex ? actualValue : v) }));
  };

  // localStorage persistence
  useEffect(() => {
    const saved = localStorage.getItem('nanosat-bp-inputs');
    if (saved) {
      try {
        setInputs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nanosat-bp-inputs', JSON.stringify(inputs));
  }, [inputs]);

  // ═══════════════════════════════════════════════════════════════
  // CALCOLI INTEGRATI CE/SP/CF - IL BILANCIO QUADRA PERFETTAMENTE
  // ═══════════════════════════════════════════════════════════════
  const calc = useMemo(() => {
    const i = inputs;
    
    // 1. RICAVI
    const sensoriInizio = [0, 0, 0];
    const sensoriNuovi = [0, 0, 0];
    const sensoriChurn = [0, 0, 0];
    const sensoriFine = [0, 0, 0];
    const sensoriMedi = [0, 0, 0];
    
    for (let y = 0; y < 3; y++) {
      sensoriInizio[y] = y === 0 ? 0 : sensoriFine[y-1];
      sensoriNuovi[y] = Math.max(0, i.sensori[y] - sensoriInizio[y]);
      sensoriChurn[y] = Math.round(sensoriInizio[y] * i.churn[y] * 12);
      sensoriFine[y] = Math.max(0, sensoriInizio[y] + sensoriNuovi[y] - sensoriChurn[y]);
      sensoriMedi[y] = (sensoriInizio[y] + sensoriFine[y]) / 2;
    }
    
    const ricaviSub = sensoriMedi.map((s, y) => s * i.prezzo[y] * 12);
    const ricaviPremium = sensoriMedi.map((s, y) => s * i.premiumPct[y] * i.premiumExtra[y] * 12);
    const ricaviHardware = sensoriNuovi.map((s, y) => s * i.hardwarePct[y] * i.hardwareMargin[y]);
    const ricaviTotali = [0, 1, 2].map(y => ricaviSub[y] + ricaviPremium[y] + ricaviHardware[y]);
    const crescitaYoY = [0, ricaviTotali[0] > 0 ? (ricaviTotali[1] - ricaviTotali[0]) / ricaviTotali[0] : 0, 
                           ricaviTotali[1] > 0 ? (ricaviTotali[2] - ricaviTotali[1]) / ricaviTotali[1] : 0];

    // 2. COSTI OPERATIVI
    const costoPersonale = i.fte.map((f, y) => f * i.ral[y] * (1 + i.welfare[y]));
    const affittoAnnuo = i.affitto.map(x => x * 12);
    const groundAnnuo = i.groundStation.map(x => x * 12);
    const cloudAnnuo = i.cloudIT.map(x => x * 12);
    const altriOpex = [0, 1, 2].map(y => i.licenze[y] + i.assicurazione[y] + i.legal[y] + i.rnd[y] + i.marketing[y] + i.travel[y]);
    const opexTotale = [0, 1, 2].map(y => affittoAnnuo[y] + groundAnnuo[y] + cloudAnnuo[y] + altriOpex[y]);
    const cacTotale = sensoriNuovi.map((s, y) => s * i.cac[y]);

    // 3. CAPEX E AMMORTAMENTI
    const capexSatelliti = i.satelliti.map((s, y) => s * (i.costoSat[y] + i.costoLancio[y]));
    const capexAttrezzature = [...i.attrezzature];
    const capexTotale = capexSatelliti.map((c, y) => c + capexAttrezzature[y]);
    
    const ammSatellitiAnno = [
      capexSatelliti[0] / i.vitaSatellite[0],
      capexSatelliti[0] / i.vitaSatellite[0] + capexSatelliti[1] / i.vitaSatellite[1],
      capexSatelliti[0] / i.vitaSatellite[0] + capexSatelliti[1] / i.vitaSatellite[1] + capexSatelliti[2] / i.vitaSatellite[2]
    ];
    const ammAttrezzAnno = [
      capexAttrezzature[0] / 5,
      capexAttrezzature[0] / 5 + capexAttrezzature[1] / 5,
      capexAttrezzature[0] / 5 + capexAttrezzature[1] / 5 + capexAttrezzature[2] / 5
    ];
    const ammTotaleAnno = ammSatellitiAnno.map((a, y) => a + ammAttrezzAnno[y]);

    // 4. CONTO ECONOMICO
    const costiDiretti = groundAnnuo.map((g, y) => g + cloudAnnuo[y]);
    const margineLordo = ricaviTotali.map((r, y) => r - costiDiretti[y]);
    const margineLordoPct = ricaviTotali.map((r, y) => r > 0 ? margineLordo[y] / r : 0);
    
    const totCostiOperativi = [0, 1, 2].map(y => costoPersonale[y] + opexTotale[y] - costiDiretti[y] + cacTotale[y]);
    const ebitda = margineLordo.map((m, y) => m - totCostiOperativi[y]);
    const ebitdaPct = ricaviTotali.map((r, y) => r > 0 ? ebitda[y] / r : 0);
    
    const ebit = ebitda.map((e, y) => e - ammTotaleAnno[y]);
    const ebitPct = ricaviTotali.map((r, y) => r > 0 ? ebit[y] / r : 0);
    const imposteCompetenza = ebit.map(e => e > 0 ? e * 0.279 : 0);
    const utileNetto = ebit.map((e, y) => e - imposteCompetenza[y]);
    const utilePct = ricaviTotali.map((r, y) => r > 0 ? utileNetto[y] / r : 0);

    // 5. FINANZIAMENTI
    const finanziamentiAnno = [0, 1, 2].map(y => 
      i.capitaleFounders[y] + i.seed[y] + i.seriesA[y] + i.grants[y]
    );

    // 6. STATO PATRIMONIALE
    const immobLordo = [capexTotale[0], capexTotale[0] + capexTotale[1], capexTotale[0] + capexTotale[1] + capexTotale[2]];
    const fondoAmmCumulato = [ammTotaleAnno[0], ammTotaleAnno[0] + ammTotaleAnno[1], ammTotaleAnno[0] + ammTotaleAnno[1] + ammTotaleAnno[2]];
    const immobNetto = immobLordo.map((l, y) => l - fondoAmmCumulato[y]);

    const creditiComm = ricaviTotali.map((r, y) => r * i.ggIncasso[y] / 365);
    const creditiCommInizio = [0, creditiComm[0], creditiComm[1]];

    const costiPagabili = [0, 1, 2].map(y => costoPersonale[y] + opexTotale[y] + cacTotale[y]);
    const debitiComm = costiPagabili.map((c, y) => c * i.ggPagamento[y] / 365);
    const debitiCommInizio = [0, debitiComm[0], debitiComm[1]];

    const debitiTrib = imposteCompetenza.map(im => im * 0.5);
    const debitiTribInizio = [0, debitiTrib[0], debitiTrib[1]];

    const pnVersamenti = [finanziamentiAnno[0], finanziamentiAnno[0] + finanziamentiAnno[1], finanziamentiAnno[0] + finanziamentiAnno[1] + finanziamentiAnno[2]];
    const pnUtiliCumulati = [utileNetto[0], utileNetto[0] + utileNetto[1], utileNetto[0] + utileNetto[1] + utileNetto[2]];
    const totalePN = pnVersamenti.map((v, y) => v + pnUtiliCumulati[y]);

    // 7. CASH FLOW
    const deltaCrediti = creditiComm.map((c, y) => c - creditiCommInizio[y]);
    const deltaDebitiComm = debitiComm.map((d, y) => d - debitiCommInizio[y]);
    const deltaDebitiTrib = debitiTrib.map((d, y) => d - debitiTribInizio[y]);
    
    const cfOperativo = [0, 1, 2].map(y => 
      utileNetto[y] + ammTotaleAnno[y] - deltaCrediti[y] + deltaDebitiComm[y] + deltaDebitiTrib[y]
    );
    const cfInvestimenti = capexTotale.map(c => -c);
    const cfFinanziario = [...finanziamentiAnno];
    const flussoNetto = [0, 1, 2].map(y => cfOperativo[y] + cfInvestimenti[y] + cfFinanziario[y]);
    
    const cassaInizio = [0, 0, 0];
    const cassaFine = [0, 0, 0];
    for (let y = 0; y < 3; y++) {
      cassaInizio[y] = y === 0 ? 0 : cassaFine[y-1];
      cassaFine[y] = cassaInizio[y] + flussoNetto[y];
    }

    // 8. VERIFICA QUADRATURA
    const totaleCircolante = cassaFine.map((c, y) => c + creditiComm[y]);
    const totaleAttivo = totaleCircolante.map((c, y) => c + immobNetto[y]);
    const totalePassivoCorr = debitiComm.map((d, y) => d + debitiTrib[y]);
    const totalePassivoPN = totalePassivoCorr.map((p, y) => p + totalePN[y]);
    const verificaSP = totaleAttivo.map((a, y) => Math.round((a - totalePassivoPN[y]) * 100) / 100);

    // 9. KPI
    const mrr = sensoriMedi.map((s, y) => s * i.prezzo[y]);
    const arr = mrr.map(m => m * 12);
    const churnAnnuo = i.churn.map(c => 1 - Math.pow(1 - c, 12));
    const ltv = i.prezzo.map((p, y) => i.churn[y] > 0 ? p / i.churn[y] : p * 36);
    const ltvCac = ltv.map((l, y) => i.cac[y] > 0 ? l / i.cac[y] : 0);
    const cacPayback = i.prezzo.map((p, y) => p > 0 ? i.cac[y] / p : 0);
    const rule40 = [ebitdaPct[0] * 100, crescitaYoY[1] * 100 + ebitdaPct[1] * 100, crescitaYoY[2] * 100 + ebitdaPct[2] * 100];
    const fcf = cfOperativo.map((o, y) => o + cfInvestimenti[y]);
    const runway = ebitda.map((e, y) => e < 0 && cassaFine[y] > 0 ? cassaFine[y] / (-e / 12) : 99);
    const breakeven = margineLordoPct.map((m, y) => m > 0 ? totCostiOperativi[y] / m : 0);
    const breakevenOk = ricaviTotali.map((r, y) => r >= breakeven[y]);
    const revPerEmployee = ricaviTotali.map((r, y) => i.fte[y] > 0 ? r / i.fte[y] : 0);
    const satTotali = [i.satelliti[0], i.satelliti[0] + i.satelliti[1], i.satelliti[0] + i.satelliti[1] + i.satelliti[2]];
    const revPerSat = ricaviTotali.map((r, y) => satTotali[y] > 0 ? r / satTotali[y] : 0);
    const costoPerSensore = sensoriFine.map((s, y) => s > 0 ? (costoPersonale[y] + opexTotale[y]) / s : 0);

    // 10. VALUTAZIONE
    const valRevMultiple = ricaviTotali.map((r, y) => r * i.revenueMultiple[y]);
    const valArrMultiple = arr.map((a, y) => a * i.arrMultiple[y]);
    const terminalValue = fcf[2] > 0 && i.wacc[2] > i.terminalGrowth[2] ? fcf[2] * (1 + i.terminalGrowth[2]) / (i.wacc[2] - i.terminalGrowth[2]) : 0;
    const discountFactor = i.wacc.map((w, y) => 1 / Math.pow(1 + w, y + 1));
    const pvFcf = fcf.map((f, y) => f * discountFactor[y]);
    const pvTerminal = terminalValue * discountFactor[2];
    const valDcf = Math.max(0, pvFcf[0] + pvFcf[1] + pvFcf[2] + pvTerminal);
    const valMedia = [0, 1, 2].map(y => (valRevMultiple[y] + valArrMultiple[y] + (y === 2 ? valDcf : valRevMultiple[y])) / 3);
    const diluizioneFounders = [0, 1, 2].map(y => {
      const inv = i.seed[0] + (y > 0 ? i.seriesA[1] : 0);
      return valMedia[y] > 0 ? inv / (valMedia[y] + inv) : 0;
    });

    return {
      sensoriInizio, sensoriNuovi, sensoriChurn, sensoriFine, sensoriMedi,
      ricaviSub, ricaviPremium, ricaviHardware, ricaviTotali, crescitaYoY,
      costoPersonale, affittoAnnuo, groundAnnuo, cloudAnnuo, altriOpex, opexTotale, cacTotale,
      capexSatelliti, capexAttrezzature, capexTotale, ammSatellitiAnno, ammAttrezzAnno, ammTotaleAnno,
      costiDiretti, margineLordo, margineLordoPct, totCostiOperativi, ebitda, ebitdaPct, ebit, ebitPct, imposteCompetenza, utileNetto, utilePct,
      immobLordo, fondoAmmCumulato, immobNetto,
      creditiCommInizio, creditiComm, deltaCrediti,
      debitiCommInizio, debitiComm, deltaDebitiComm,
      debitiTribInizio, debitiTrib, deltaDebitiTrib,
      totaleCircolante, totaleAttivo, totalePassivoCorr,
      finanziamentiAnno, pnVersamenti, pnUtiliCumulati, totalePN, totalePassivoPN, verificaSP,
      cfOperativo, cfInvestimenti, cfFinanziario, flussoNetto, cassaInizio, cassaFine,
      mrr, arr, churnAnnuo, ltv, ltvCac, cacPayback, rule40, fcf, runway, breakeven, breakevenOk, revPerEmployee, satTotali, revPerSat, costoPerSensore,
      valRevMultiple, valArrMultiple, valDcf, valMedia, terminalValue, pvFcf, pvTerminal, discountFactor, diluizioneFounders
    };
  }, [inputs]);

  // Track impacts
  useEffect(() => {
    if (prevCalcRef.current) {
      const impacts = {};
      ['ricaviTotali', 'ebitda', 'utileNetto', 'cassaFine', 'ltvCac', 'valMedia'].forEach(key => {
        for (let y = 0; y < 3; y++) {
          const prev = prevCalcRef.current[key]?.[y];
          const curr = calc[key]?.[y];
          if (prev !== undefined && curr !== undefined && Math.abs(curr - prev) > 1) {
            impacts[`${key}_${y}`] = curr - prev;
          }
        }
      });
      if (Object.keys(impacts).length > 0) { setShowImpact(impacts); setTimeout(() => setShowImpact({}), 3000); }
    }
    prevCalcRef.current = calc;
  }, [calc]);

  // Formatting
  const fmt = (n, d = 0) => n == null || isNaN(n) ? '-' : new Intl.NumberFormat('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const fmtK = (n) => n == null || isNaN(n) ? '-' : Math.abs(n) >= 1e6 ? `${fmt(n/1e6, 2)}M` : Math.abs(n) >= 1e3 ? `${fmt(n/1e3, 0)}k` : fmt(n, 0);
  const fmtPct = (n) => n == null || isNaN(n) ? '-' : `${fmt(n * 100, 1)}%`;

  // Components
  const InputCell = ({ value, onChange, step = 1 }) => (
    <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} step={step}
      className="w-full px-2 py-1 text-right font-medium text-blue-700 bg-yellow-100 border border-yellow-400 rounded focus:ring-2 focus:ring-blue-500" />
  );

  const CalcCell = ({ value, format = 'currency', highlight = false }) => {
    const formatted = format === 'currency' ? fmtK(value) : format === 'percent' ? fmtPct(value) : format === 'number' ? fmt(value, 0) : fmt(value, 1);
    return (
      <div className={`px-2 py-1 text-right font-medium rounded ${highlight ? 'bg-green-200 font-bold' : 'bg-green-50'} ${value < 0 ? 'text-red-600' : ''}`}>
        {formatted}
      </div>
    );
  };

  const SectionRow = ({ title }) => <tr className="bg-gray-200"><td colSpan={6} className="px-3 py-1 font-bold text-gray-700 text-sm">{title}</td></tr>;

  const DataRow = ({ label, type, unit, values, format = 'currency', inputKey, highlight = false, step = 1 }) => (
    <tr className={`border-b hover:bg-gray-50 ${highlight ? 'bg-blue-50' : ''}`}>
      <td className="px-3 py-1 text-sm">{label}</td>
      <td className="px-2 py-1 text-xs text-center text-gray-500">{type}</td>
      <td className="px-2 py-1 text-xs text-center text-gray-500">{unit}</td>
      {[0, 1, 2].map(y => (
        <td key={y} className="px-2 py-1">
          {type === 'INPUT' ? <InputCell value={values[y]} onChange={(v) => updateInput(inputKey, y, v)} step={step} />
            : <CalcCell value={values[y]} format={format} highlight={highlight} />}
        </td>
      ))}
    </tr>
  );

  const TableHeader = ({ title }) => (
    <thead className="bg-blue-900 text-white sticky top-0">
      <tr>
        <th className="px-3 py-2 text-left w-56">{title}</th>
        <th className="px-2 py-2 w-16">Tipo</th>
        <th className="px-2 py-2 w-12">U.M.</th>
        <th className="px-3 py-2 w-28">Anno 1</th>
        <th className="px-3 py-2 w-28">Anno 2</th>
        <th className="px-3 py-2 w-28">Anno 3</th>
      </tr>
    </thead>
  );

  // KPI Info Modal
  const KPIInfoModal = () => {
    if (!selectedKPI) return null;
    const info = KPI_INFO[selectedKPI];
    if (!info) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedKPI(null)}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="p-4 bg-blue-900 text-white rounded-t-lg"><h3 className="text-lg font-bold">{info.name}</h3></div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2 items-start"><BookOpen className="text-blue-600 mt-1 flex-shrink-0" size={18} /><div><div className="font-bold text-sm text-gray-600">COS'È</div><div className="text-sm">{info.cosa}</div></div></div>
            <div className="flex gap-2 items-start bg-gray-50 p-2 rounded"><Target className="text-green-600 mt-1 flex-shrink-0" size={18} /><div><div className="font-bold text-sm text-gray-600">ESEMPIO</div><div className="text-sm">{info.esempio}</div></div></div>
            <div className="flex gap-2 items-start"><AlertTriangle className="text-orange-500 mt-1 flex-shrink-0" size={18} /><div><div className="font-bold text-sm text-gray-600">PERCHÉ CONTA</div><div className="text-sm">{info.perche}</div></div></div>
            <div className="flex gap-2 items-start bg-green-50 p-2 rounded"><CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={18} /><div><div className="font-bold text-sm text-gray-600">TARGET</div><div className="text-sm font-medium">{info.target}</div></div></div>
            <div className="flex gap-2 items-start bg-blue-50 p-2 rounded border-l-4 border-blue-500"><Lightbulb className="text-yellow-500 mt-1 flex-shrink-0" size={18} /><div><div className="font-bold text-sm text-gray-600">COME MIGLIORARLO</div><div className="text-sm">{info.come}</div></div></div>
          </div>
          <div className="p-4 bg-gray-100 rounded-b-lg"><button onClick={() => setSelectedKPI(null)} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Chiudi</button></div>
        </div>
      </div>
    );
  };

  // IL PROGETTO - Descrizione del Business
  const renderProgetto = () => (
    <div className="p-6 space-y-8 bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-4 rounded-full">
            <Satellite size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-blue-900 mb-3">NanoSat IoT</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connettività satellitare a basso costo per i sensori IoT in aree remote
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
            -75% costi vs concorrenti
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
            Copertura globale
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold">
            Plug & Play
          </div>
        </div>
      </div>

      {/* Il Problema */}
      <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
        <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Il Problema
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          Milioni di sensori IoT sono installati in zone senza copertura cellulare: campi agricoli, foreste,
          oceani, deserti. Per trasmettere i loro dati devono usare satelliti come <strong>Iridium</strong> (12-15€/mese)
          o <strong>Globalstar</strong> (8-12€/mese).
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mt-3">
          <strong>Il paradosso:</strong> i sensori IoT generano <em>microdati</em> (pochi byte, poche volte al giorno)
          ma pagano per infrastrutture pensate per video e voce. È come noleggiare un TIR per consegnare una lettera.
        </p>
      </div>

      {/* La Soluzione */}
      <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-500" /> La Soluzione
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          <strong>NanoSat IoT</strong> è una costellazione di nanosatelliti (CubeSat) ottimizzata esclusivamente
          per i microdati IoT. Niente video, niente voce: solo piccoli pacchetti di dati dai sensori.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-3xl font-bold text-green-600">2-4€</div>
            <div className="text-gray-600">per sensore/mese</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600">copertura globale</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-3xl font-bold text-purple-600">24</div>
            <div className="text-gray-600">nanosatelliti (Anno 3)</div>
          </div>
        </div>
      </div>

      {/* Come Funziona */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Info className="text-blue-500" /> Come Funziona
        </h2>
        <div className="space-y-6 text-gray-700">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <h3 className="font-bold text-lg">Il Sensore Raccoglie i Dati</h3>
              <p>Il sensore IoT (umidità, temperatura, GPS...) rileva un valore e lo trasforma in un piccolo pacchetto digitale di pochi byte. Alimentato a batteria o solare, può funzionare per anni senza manutenzione.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <h3 className="font-bold text-lg">Il Sensore Parla al Gateway</h3>
              <p>Il sensore invia i dati a un <strong>gateway</strong> nel campo usando tecnologie radio a basso consumo (LoRa, NB-IoT). Un gateway può raccogliere dati da centinaia di sensori nel raggio di 5-10 km.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <h3 className="font-bold text-lg">Il Gateway Parla al Satellite</h3>
              <p>Quando un nanosatellite passa sopra la zona (più volte al giorno), il gateway trasmette i dati verso lo spazio. Il satellite orbita a 400-600 km e "vede" una zona per pochi minuti - sufficiente per i microdati IoT.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
            <div>
              <h3 className="font-bold text-lg">Il Satellite Porta i Dati a Terra</h3>
              <p>Il nanosatellite memorizza i dati e, continuando la sua orbita, li scarica quando passa sopra una <strong>ground station</strong>. Bastano poche stazioni posizionate strategicamente.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">5</div>
            <div>
              <h3 className="font-bold text-lg">Il Cliente Riceve i Dati</h3>
              <p>I dati arrivano alla nostra <strong>piattaforma cloud</strong>, vengono elaborati e resi disponibili via app e dashboard. L'agricoltore vede che il campo 3 ha bisogno di irrigazione, tutto in automatico.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mercato Target */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Target className="text-orange-500" /> Mercato Target
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border-t-4 border-green-500">
            <div className="text-2xl font-bold text-green-700">40%</div>
            <div className="font-bold text-gray-800">Agricoltura</div>
            <p className="text-sm text-gray-600 mt-2">Sensori umidità, meteo, irrigazione smart</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-t-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-700">25%</div>
            <div className="font-bold text-gray-800">Ambiente</div>
            <p className="text-sm text-gray-600 mt-2">Qualità aria/acqua, incendi, fauna</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border-t-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-700">20%</div>
            <div className="font-bold text-gray-800">Logistica</div>
            <p className="text-sm text-gray-600 mt-2">Container, flotte, asset tracking</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border-t-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-700">15%</div>
            <div className="font-bold text-gray-800">Energy</div>
            <p className="text-sm text-gray-600 mt-2">Pipeline, reti elettriche, pozzi</p>
          </div>
        </div>
      </div>

      {/* Metriche Chiave Spiegate */}
      <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-500">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
          <BookOpen className="text-yellow-600" /> Metriche Chiave Spiegate
        </h2>

        <div className="space-y-6">
          {/* CAC */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">CAC</span>
              Customer Acquisition Cost
            </h3>
            <p className="mt-2 text-gray-700">
              <strong>Quanto costa conquistare un nuovo cliente?</strong> Se spendi 10.000€ in marketing e acquisisci
              500 sensori, il tuo CAC è 10.000€ ÷ 500 = <strong>20€ per sensore</strong>.
            </p>
            <p className="mt-2 text-gray-600 text-sm">
              Include: pubblicità, venditori, fiere, demo, sconti promozionali. Un CAC basso = sei efficiente nel trovare clienti.
            </p>
            <div className="mt-2 bg-blue-50 px-3 py-2 rounded text-sm">
              📊 <strong>Benchmark:</strong> 15-30€ per sensore è considerato buono nel settore.
            </div>
          </div>

          {/* Churn */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-bold text-lg text-red-900 flex items-center gap-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">CHURN</span>
              Tasso di Abbandono
            </h3>
            <p className="mt-2 text-gray-700">
              <strong>Quanti clienti perdi ogni mese?</strong> Se hai 1.000 sensori e 20 disdiscono,
              il churn è 20 ÷ 1.000 = <strong>2% mensile</strong>.
            </p>
            <p className="mt-2 text-gray-600 text-sm">
              ⚠️ Attenzione: 2% mensile = 22% annuale! È come un secchio bucato: se il buco è grosso, non si riempirà mai.
            </p>
            <div className="mt-2 flex gap-2 text-sm">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">🟢 &lt;1%: Eccellente</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🟡 1-2%: Buono</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">🔴 &gt;3%: Problema</span>
            </div>
          </div>

          {/* LTV */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">LTV</span>
              Lifetime Value
            </h3>
            <p className="mt-2 text-gray-700">
              <strong>Quanto vale un cliente durante tutta la sua "vita" con te?</strong> Se paga 3€/mese
              e resta 50 mesi, LTV = 3€ × 50 = <strong>150€</strong>.
            </p>
            <div className="mt-2 bg-gray-100 px-3 py-2 rounded font-mono text-sm">
              Formula: <strong>LTV = Prezzo Mensile ÷ Churn Mensile</strong><br/>
              Esempio: 3€ ÷ 0.02 = 150€
            </div>
            <p className="mt-2 text-gray-600 text-sm">
              L'LTV ti dice quanto puoi permetterti di spendere per acquisire un cliente.
            </p>
          </div>

          {/* LTV/CAC */}
          <div className="bg-white rounded-lg p-4 shadow border-2 border-yellow-400">
            <h3 className="font-bold text-lg text-purple-900 flex items-center gap-2">
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">LTV/CAC</span>
              Il Rapporto che Decide Tutto ⭐
            </h3>
            <p className="mt-2 text-gray-700">
              <strong>Quanto VALE un cliente ÷ quanto COSTA acquisirlo.</strong><br/>
              Se LTV = 150€ e CAC = 20€, allora LTV/CAC = <strong>7.5x</strong>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                <strong>&lt;1x:</strong> Perdi soldi su ogni cliente! 🔴
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded">
                <strong>1-3x:</strong> Sostenibile ma rischioso 🟡
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded">
                <strong>3-5x:</strong> Business sano 🟢
              </div>
              <div className="bg-green-200 text-green-900 px-3 py-2 rounded">
                <strong>&gt;5x:</strong> Ottimo! Puoi crescere di più 🟢🟢
              </div>
            </div>
            <p className="mt-3 text-gray-700 font-medium">
              💡 <strong>Regola del 3x:</strong> Gli investitori vogliono vedere almeno 3x. Significa che per ogni € speso in acquisizione, ne torneranno almeno 3.
            </p>
          </div>
        </div>
      </div>

      {/* Perché Nanosatelliti */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Satellite className="text-blue-500" /> Perché Nanosatelliti?
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 bg-gray-100 text-left">Aspetto</th>
                <th className="p-3 bg-red-100 text-center">Satellite Tradizionale</th>
                <th className="p-3 bg-green-100 text-center">Nanosatellite (CubeSat)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium">Costo produzione</td>
                <td className="p-3 text-center text-red-600 font-bold">50-500 M€</td>
                <td className="p-3 text-center text-green-600 font-bold">50-100 k€</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-medium">Costo lancio</td>
                <td className="p-3 text-center text-red-600 font-bold">10-50 M€</td>
                <td className="p-3 text-center text-green-600 font-bold">10-30 k€</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">Tempo sviluppo</td>
                <td className="p-3 text-center text-red-600">3-5 anni</td>
                <td className="p-3 text-center text-green-600">6-18 mesi</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-medium">Vita utile</td>
                <td className="p-3 text-center">10-15 anni</td>
                <td className="p-3 text-center">2-5 anni</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Rischio</td>
                <td className="p-3 text-center text-red-600">Altissimo (tutto su uno)</td>
                <td className="p-3 text-center text-green-600">Distribuito (costellazione)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-gray-700 bg-blue-50 p-3 rounded">
          💡 <strong>Vantaggio chiave:</strong> Possiamo lanciare, testare, iterare velocemente. Se un satellite fallisce, ne lanciamo un altro.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Pronto a Esplorare i Numeri?</h2>
        <p className="text-blue-100 mb-6">Vai alla Dashboard per vedere le proiezioni finanziarie complete</p>
        <button
          onClick={() => setActiveSheet('DASHBOARD')}
          className="bg-white text-blue-800 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
        >
          📊 Vai alla Dashboard
        </button>
      </div>
    </div>
  );

  // DASHBOARD
  const renderDashboard = () => (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ricavi A3', value: calc.ricaviTotali[2], fmt: 'currency' },
          { label: 'EBITDA A3', value: calc.ebitda[2], fmt: 'currency', good: calc.ebitda[2] > 0 },
          { label: 'LTV/CAC', value: calc.ltvCac[2], fmt: 'x', good: calc.ltvCac[2] >= 3 },
          { label: 'Valutazione A3', value: calc.valMedia[2], fmt: 'currency' }
        ].map((kpi, idx) => (
          <div key={idx} className={`p-4 rounded-lg shadow ${kpi.good === false ? 'bg-red-50 border-l-4 border-red-500' : kpi.good === true ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white border-l-4 border-blue-500'}`}>
            <div className="text-sm text-gray-600">{kpi.label}</div>
            <div className="text-2xl font-bold">{kpi.fmt === 'x' ? `${fmt(kpi.value, 1)}x` : fmtK(kpi.value) + ' €'}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">Performance Finanziaria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ name: 'A1', Ricavi: calc.ricaviTotali[0], EBITDA: calc.ebitda[0], Utile: calc.utileNetto[0] },{ name: 'A2', Ricavi: calc.ricaviTotali[1], EBITDA: calc.ebitda[1], Utile: calc.utileNetto[1] },{ name: 'A3', Ricavi: calc.ricaviTotali[2], EBITDA: calc.ebitda[2], Utile: calc.utileNetto[2] }]}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
              <Tooltip formatter={v => fmtK(v) + ' €'} /><Legend />
              <Bar dataKey="Ricavi" fill="#1f4e79" /><Bar dataKey="EBITDA" fill="#22c55e" /><Bar dataKey="Utile" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">Cassa e Cash Flow</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ name: 'A1', Cassa: calc.cassaFine[0], FCF: calc.fcf[0] },{ name: 'A2', Cassa: calc.cassaFine[1], FCF: calc.fcf[1] },{ name: 'A3', Cassa: calc.cassaFine[2], FCF: calc.fcf[2] }]}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
              <Tooltip formatter={v => fmtK(v) + ' €'} /><Legend />
              <Bar dataKey="Cassa" fill="#3b82f6" /><Bar dataKey="FCF" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-3">Semafori Anno 3</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Break-even', ok: calc.breakevenOk[2], value: calc.breakevenOk[2] ? 'Sì' : 'No' },
            { label: 'LTV/CAC ≥3x', ok: calc.ltvCac[2] >= 3, value: `${fmt(calc.ltvCac[2], 1)}x` },
            { label: 'EBITDA > 0', ok: calc.ebitda[2] > 0, value: fmtK(calc.ebitda[2]) },
            { label: 'Runway ≥18m', ok: calc.runway[2] >= 18, value: calc.runway[2] >= 99 ? '∞' : `${fmt(calc.runway[2], 0)}m` },
            { label: 'Rule of 40', ok: calc.rule40[2] >= 40, value: `${fmt(calc.rule40[2], 0)}%` }
          ].map((s, i) => (
            <div key={i} className={`p-2 rounded text-center ${s.ok ? 'bg-green-100' : 'bg-red-100'}`}>
              {s.ok ? <CheckCircle className="mx-auto text-green-600" size={18} /> : <AlertTriangle className="mx-auto text-red-600" size={18} />}
              <div className="text-xs font-medium mt-1">{s.label}</div>
              <div className="text-xs">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // SIMULATORE
  const renderSimulator = () => (
    <div className="space-y-4 p-4">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 rounded-lg">
        <h3 className="font-bold flex items-center gap-2"><Sliders size={20} /> SIMULATORE RAPIDO</h3>
        <p className="text-blue-200 text-sm">Modifica i parametri chiave e vedi l'impatto in tempo reale</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-bold text-gray-800 mb-3">Parametri Chiave Anno 3</h4>
          <div className="space-y-4">
            {[
              { label: 'Sensori Target', key: 'sensori', value: inputs.sensori[2], min: 10000, max: 500000, step: 10000 },
              { label: 'Prezzo €/mese', key: 'prezzo', value: inputs.prezzo[2], min: 1, max: 10, step: 0.5 },
              { label: 'Churn mensile %', key: 'churn', value: inputs.churn[2] * 100, min: 0.5, max: 5, step: 0.5, isPct: true },
              { label: 'CAC €', key: 'cac', value: inputs.cac[2], min: 5, max: 50, step: 5 },
              { label: 'N. Satelliti', key: 'satelliti', value: inputs.satelliti[2], min: 2, max: 30, step: 2 },
              { label: 'FTE Team', key: 'fte', value: inputs.fte[2], min: 5, max: 60, step: 5 }
            ].map(param => (
              <div key={param.key} className="flex items-center gap-3">
                <label className="w-32 text-sm text-gray-600">{param.label}</label>
                <input type="range" min={param.min} max={param.max} step={param.step} value={param.value} 
                  onChange={(e) => updateInput(param.key, 2, parseFloat(e.target.value))} className="flex-1" />
                <span className="w-20 text-right font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {param.isPct ? `${param.value.toFixed(1)}%` : fmt(param.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-bold text-gray-800 mb-3">Impatto sui KPI Principali</h4>
          <div className="space-y-3">
            {[
              { label: 'Ricavi A3', value: calc.ricaviTotali[2], target: 3000000, key: 'ricavi' },
              { label: 'EBITDA A3', value: calc.ebitda[2], target: 0, key: 'ebitda', isZeroTarget: true },
              { label: 'LTV/CAC', value: calc.ltvCac[2], target: 3, key: 'ltvCac', isRatio: true },
              { label: 'Runway (mesi)', value: Math.min(calc.runway[2], 36), target: 18, key: 'runway' },
              { label: 'Rule of 40 %', value: calc.rule40[2], target: 40, key: 'rule40' },
              { label: 'Valutazione', value: calc.valMedia[2], target: 10000000, key: 'val' }
            ].map(kpi => {
              const isGood = kpi.isZeroTarget ? kpi.value >= 0 : kpi.isRatio ? kpi.value >= kpi.target : kpi.value >= kpi.target;
              const pct = kpi.isZeroTarget ? (kpi.value >= 0 ? 100 : 50) : Math.min((kpi.value / kpi.target) * 100, 150);
              return (
                <div key={kpi.key} className="flex items-center gap-2">
                  <span className="w-24 text-sm">{kpi.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className={`h-full transition-all ${isGood ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className={`w-20 text-right font-bold text-sm ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.isRatio ? `${fmt(kpi.value, 1)}x` : fmtK(kpi.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-bold text-yellow-800 flex items-center gap-2"><Lightbulb size={18} /> Suggerimenti</h4>
        <div className="mt-2 space-y-2 text-sm">
          {calc.ltvCac[2] < 3 && <div className="flex items-start gap-2"><ArrowUpRight className="text-red-500 flex-shrink-0" size={16} /><span><b>LTV/CAC sotto 3x:</b> Riduci CAC ({fmt(inputs.cac[2])}€) o churn ({fmt(inputs.churn[2]*100,1)}%)</span></div>}
          {calc.ebitda[2] < 0 && <div className="flex items-start gap-2"><ArrowUpRight className="text-red-500 flex-shrink-0" size={16} /><span><b>EBITDA negativo:</b> Aumenta sensori o prezzo, oppure riduci team</span></div>}
          {calc.runway[2] < 18 && calc.runway[2] < 99 && <div className="flex items-start gap-2"><ArrowUpRight className="text-orange-500 flex-shrink-0" size={16} /><span><b>Runway corto:</b> Riduci burn rate o raccogli più capitale</span></div>}
          {calc.ltvCac[2] >= 3 && calc.ebitda[2] >= 0 && <div className="flex items-start gap-2"><CheckCircle className="text-green-500 flex-shrink-0" size={16} /><span><b>Ottimo!</b> KPI principali in target.</span></div>}
        </div>
      </div>
    </div>
  );

  // KPI CLASSICI
  const renderKPIClassici = () => (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-blue-900 text-white sticky top-0">
          <tr><th className="p-2 text-left">KPI</th><th className="p-2 w-20">A1</th><th className="p-2 w-20">A2</th><th className="p-2 w-20">A3</th><th className="p-2 text-left">COS'È</th><th className="p-2 text-left">TARGET</th><th className="p-2 w-8"></th></tr>
        </thead>
        <tbody>
          {[
            { key: 'grossMargin', values: calc.margineLordoPct, format: 'percent' },
            { key: 'ebitdaMargin', values: calc.ebitdaPct, format: 'percent' },
            { key: 'netMargin', values: calc.utilePct, format: 'percent' },
            { key: 'revenueGrowth', values: calc.crescitaYoY, format: 'percent' },
            { key: 'fcf', values: calc.fcf, format: 'currency' },
            { key: 'runway', values: calc.runway.map(r => Math.min(r, 99)), format: 'number' }
          ].map(row => {
            const info = KPI_INFO[row.key];
            return (
              <tr key={row.key} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{info?.name}</td>
                {[0,1,2].map(y => <td key={y} className="p-2"><CalcCell value={row.values[y]} format={row.format} /></td>)}
                <td className="p-2 text-xs text-gray-600">{info?.cosa?.substring(0, 60)}...</td>
                <td className="p-2 text-xs font-medium text-green-700">{info?.target}</td>
                <td className="p-2"><button onClick={() => setSelectedKPI(row.key)} className="text-blue-500 hover:text-blue-700"><Info size={16} /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // KPI AVANZATI
  const renderKPIAvanzati = () => (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-blue-900 text-white sticky top-0">
          <tr><th className="p-2 text-left">KPI</th><th className="p-2 w-20">A1</th><th className="p-2 w-20">A2</th><th className="p-2 w-20">A3</th><th className="p-2 text-left">COS'È</th><th className="p-2 text-left">TARGET</th><th className="p-2 w-8"></th></tr>
        </thead>
        <tbody>
          {[
            { key: 'mrr', values: calc.mrr, format: 'currency' },
            { key: 'arr', values: calc.arr, format: 'currency' },
            { key: 'ltv', values: calc.ltv, format: 'currency' },
            { key: 'ltvCac', values: calc.ltvCac, format: 'decimal', highlight: true },
            { key: 'cacPayback', values: calc.cacPayback, format: 'decimal' },
            { key: 'churnAnnuo', values: calc.churnAnnuo, format: 'percent' },
            { key: 'rule40', values: calc.rule40.map(r => r/100), format: 'percent' },
            { key: 'revPerEmployee', values: calc.revPerEmployee, format: 'currency' },
            { key: 'revPerSat', values: calc.revPerSat, format: 'currency' }
          ].map(row => {
            const info = KPI_INFO[row.key];
            const isLtvCac = row.key === 'ltvCac';
            return (
              <tr key={row.key} className={`border-b hover:bg-gray-50 ${isLtvCac ? 'bg-yellow-50' : ''}`}>
                <td className={`p-2 font-medium ${isLtvCac ? 'font-bold' : ''}`}>{isLtvCac ? '⭐ ' : ''}{info?.name}</td>
                {[0,1,2].map(y => (
                  <td key={y} className="p-2">
                    {isLtvCac ? (
                      <div className={`px-2 py-1 text-center font-bold rounded ${row.values[y] >= 3 ? 'bg-green-300' : row.values[y] >= 2 ? 'bg-yellow-300' : 'bg-red-300'}`}>
                        {fmt(row.values[y], 1)}x
                      </div>
                    ) : <CalcCell value={row.values[y]} format={row.format} />}
                  </td>
                ))}
                <td className="p-2 text-xs text-gray-600">{info?.cosa?.substring(0, 60)}...</td>
                <td className="p-2 text-xs font-medium text-green-700">{info?.target}</td>
                <td className="p-2"><button onClick={() => setSelectedKPI(row.key)} className="text-blue-500 hover:text-blue-700"><Info size={16} /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // VALUATION
  const renderValuation = () => (
    <table className="w-full text-sm"><TableHeader title="VALUTAZIONE" /><tbody>
      <SectionRow title="METODO 1: REVENUE MULTIPLE" />
      <DataRow label="Ricavi" type="CALC" unit="€" values={calc.ricaviTotali} />
      <DataRow label="Revenue Multiple" type="INPUT" unit="x" values={inputs.revenueMultiple} inputKey="revenueMultiple" format="number" />
      <DataRow label="VALUTAZIONE (Rev Multiple)" type="CALC" unit="€" values={calc.valRevMultiple} highlight />
      <SectionRow title="METODO 2: ARR MULTIPLE" />
      <DataRow label="ARR" type="CALC" unit="€" values={calc.arr} />
      <DataRow label="ARR Multiple" type="INPUT" unit="x" values={inputs.arrMultiple} inputKey="arrMultiple" format="decimal" step={0.5} />
      <DataRow label="VALUTAZIONE (ARR Multiple)" type="CALC" unit="€" values={calc.valArrMultiple} highlight />
      <SectionRow title="METODO 3: DCF" />
      <DataRow label="Free Cash Flow" type="CALC" unit="€" values={calc.fcf} />
      <DataRow label="WACC" type="INPUT" unit="%" values={inputs.wacc.map(w => w * 100)} inputKey="wacc" format="number" />
      <tr className="border-b"><td className="px-3 py-1">Terminal Value</td><td></td><td></td><td colSpan={3} className="px-2 py-1 text-right">{fmtK(calc.terminalValue)} €</td></tr>
      <tr className="border-b"><td className="px-3 py-1">VALUTAZIONE DCF</td><td></td><td></td><td colSpan={3} className="px-2 py-1"><CalcCell value={calc.valDcf} highlight /></td></tr>
      <SectionRow title="VALUTAZIONE MEDIA" />
      <DataRow label="VALUTAZIONE MEDIA" type="CALC" unit="€" values={calc.valMedia} highlight />
      <DataRow label="Diluizione founders (stima)" type="CALC" unit="%" values={calc.diluizioneFounders} format="percent" />
    </tbody></table>
  );

  // SENSITIVITY
  const renderSensitivity = () => {
    // Calcoli per Tornado Chart
    const baseRicavi = calc.ricaviTotali[2];
    const baseCAPEX = calc.capexTotale[2];
    const tornadoData = [
      { name: 'Sensori A3', base: inputs.sensori[2], low: inputs.sensori[2] * 0.8, high: inputs.sensori[2] * 1.2, 
        impactLow: inputs.sensori[2] * 0.8 * inputs.prezzo[2] * 12, impactHigh: inputs.sensori[2] * 1.2 * inputs.prezzo[2] * 12 },
      { name: 'Prezzo A3', base: inputs.prezzo[2], low: inputs.prezzo[2] * 0.8, high: inputs.prezzo[2] * 1.2,
        impactLow: inputs.sensori[2] * inputs.prezzo[2] * 0.8 * 12, impactHigh: inputs.sensori[2] * inputs.prezzo[2] * 1.2 * 12 },
      { name: 'Costo Sat A3', base: inputs.costoSat[2], low: inputs.costoSat[2] * 0.8, high: inputs.costoSat[2] * 1.2,
        impactLow: inputs.satelliti[2] * inputs.costoSat[2] * 0.8, impactHigh: inputs.satelliti[2] * inputs.costoSat[2] * 1.2 },
      { name: 'N. Satelliti A3', base: inputs.satelliti[2], low: Math.round(inputs.satelliti[2] * 0.8), high: Math.round(inputs.satelliti[2] * 1.2),
        impactLow: Math.round(inputs.satelliti[2] * 0.8) * (inputs.costoSat[2] + inputs.costoLancio[2]), impactHigh: Math.round(inputs.satelliti[2] * 1.2) * (inputs.costoSat[2] + inputs.costoLancio[2]) },
      { name: 'CAC A3', base: inputs.cac[2], low: inputs.cac[2] * 0.8, high: inputs.cac[2] * 1.2,
        impactLow: calc.sensoriNuovi[2] * inputs.cac[2] * 0.8, impactHigh: calc.sensoriNuovi[2] * inputs.cac[2] * 1.2 },
      { name: 'FTE A3', base: inputs.fte[2], low: Math.round(inputs.fte[2] * 0.8), high: Math.round(inputs.fte[2] * 1.2),
        impactLow: Math.round(inputs.fte[2] * 0.8) * inputs.ral[2] * 1.15, impactHigh: Math.round(inputs.fte[2] * 1.2) * inputs.ral[2] * 1.15 },
    ];

    // Break-even analysis
    const margineLordo = 0.75; // 75% margine lordo stimato
    const costiFissi = calc.totCostiOperativi[2];
    const breakEvenData = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0].map(prezzo => {
      const contribuzione = prezzo * 12 * margineLordo;
      const breakEvenSensori = costiFissi / contribuzione;
      const target = inputs.sensori[2];
      return { prezzo, contribuzione, breakEvenSensori, raggiungibile: breakEvenSensori <= target };
    });

    return (
    <div className="space-y-6 p-4">
      {/* TABELLA 1: Ricavi */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Target size={18} /> TABELLA 1: Ricavi A3 (Sensori × Prezzo)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 bg-blue-900 text-white">Sensori \ Prezzo</th>
              {[1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5].map(p => <th key={p} className="p-2 bg-blue-900 text-white">{p}€</th>)}</tr></thead>
            <tbody>
              {[25000, 50000, 75000, 100000, 150000, 200000, 250000].map(s => (
                <tr key={s}>
                  <td className="p-2 bg-gray-100 font-medium">{fmt(s)}</td>
                  {[1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5].map(p => {
                    const ricavi = s * p * 12;
                    const isBase = s === inputs.sensori[2] && Math.abs(p - inputs.prezzo[2]) < 0.1;
                    return <td key={p} className={`p-2 text-right ${isBase ? 'bg-yellow-200 font-bold ring-2 ring-blue-500' : 'bg-green-50'}`}>{fmtK(ricavi)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABELLA 2: LTV/CAC */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} /> TABELLA 2: LTV/CAC (CAC × Churn mensile)</h3>
        <p className="text-xs text-gray-500 mb-2">LTV calcolato con prezzo {inputs.prezzo[2]}€/mese</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 bg-blue-900 text-white">CAC \ Churn</th>
              {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0].map(c => <th key={c} className="p-2 bg-blue-900 text-white">{c}%</th>)}</tr></thead>
            <tbody>
              {[10, 15, 20, 25, 30, 40, 50].map(cac => (
                <tr key={cac}>
                  <td className="p-2 bg-gray-100 font-medium">{cac}€</td>
                  {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0].map(c => {
                    const ltv = inputs.prezzo[2] / (c / 100);
                    const ratio = ltv / cac;
                    const isBase = cac === inputs.cac[2] && Math.abs(c - inputs.churn[2] * 100) < 0.2;
                    return <td key={c} className={`p-2 text-center font-medium ${isBase ? 'ring-2 ring-blue-500' : ''} ${ratio >= 3 ? 'bg-green-200' : ratio >= 2 ? 'bg-yellow-200' : 'bg-red-200'}`}>{ratio.toFixed(1)}x</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">🟢 Verde ≥3x | 🟡 Giallo 2-3x | 🔴 Rosso &lt;2x</p>
      </div>

      {/* TABELLA 3: CAPEX */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Satellite size={18} /> TABELLA 3: CAPEX Satelliti (N. Satelliti × Costo produzione)</h3>
        <p className="text-xs text-gray-500 mb-2">Escluso costo lancio ({fmtK(inputs.costoLancio[2])} per satellite)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 bg-blue-900 text-white">Satelliti \ Costo</th>
              {[40000, 50000, 60000, 70000, 80000, 90000, 100000].map(c => <th key={c} className="p-2 bg-blue-900 text-white">{fmtK(c)}</th>)}</tr></thead>
            <tbody>
              {[6, 10, 14, 20, 24, 30, 40].map(sat => (
                <tr key={sat}>
                  <td className="p-2 bg-gray-100 font-medium">{sat} sat.</td>
                  {[40000, 50000, 60000, 70000, 80000, 90000, 100000].map(costo => {
                    const capex = sat * costo;
                    const totSat = inputs.satelliti[0] + inputs.satelliti[1] + inputs.satelliti[2];
                    const isBase = sat === totSat && costo === inputs.costoSat[2];
                    return <td key={costo} className={`p-2 text-right ${isBase ? 'bg-yellow-200 font-bold ring-2 ring-blue-500' : 'bg-green-50'}`}>{fmtK(capex)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TORNADO CHART */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Sliders size={18} /> TORNADO CHART: Impatto variabili ±20%</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 bg-blue-900 text-white text-left">Variabile</th>
                <th className="p-2 bg-blue-900 text-white">Valore Base</th>
                <th className="p-2 bg-blue-900 text-white">-20%</th>
                <th className="p-2 bg-blue-900 text-white">+20%</th>
                <th className="p-2 bg-blue-900 text-white">Impatto -20%</th>
                <th className="p-2 bg-blue-900 text-white">Impatto +20%</th>
                <th className="p-2 bg-blue-900 text-white">Delta</th>
              </tr>
            </thead>
            <tbody>
              {tornadoData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-medium">{row.name}</td>
                  <td className="p-2 text-center">{typeof row.base === 'number' && row.base > 1000 ? fmtK(row.base) : fmt(row.base, row.base < 10 ? 1 : 0)}</td>
                  <td className="p-2 text-center text-red-600">{typeof row.low === 'number' && row.low > 1000 ? fmtK(row.low) : fmt(row.low, row.low < 10 ? 1 : 0)}</td>
                  <td className="p-2 text-center text-green-600">{typeof row.high === 'number' && row.high > 1000 ? fmtK(row.high) : fmt(row.high, row.high < 10 ? 1 : 0)}</td>
                  <td className="p-2 text-center bg-red-50">{fmtK(row.impactLow)}</td>
                  <td className="p-2 text-center bg-green-50">{fmtK(row.impactHigh)}</td>
                  <td className="p-2 text-center font-bold">{fmtK(Math.abs(row.impactHigh - row.impactLow))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFRONTO SCENARI */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart size={18} /> CONFRONTO SCENARI (Anno 3)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 bg-blue-900 text-white text-left">Metrica</th>
                <th className="p-2 bg-red-700 text-white">WORST</th>
                <th className="p-2 bg-yellow-600 text-white">MEDIUM</th>
                <th className="p-2 bg-green-700 text-white">BEST</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 font-medium">Sensori target A3</td><td className="p-2 text-center">{fmt(SCENARI[1].sensori[2])}</td><td className="p-2 text-center font-bold">{fmt(SCENARI[2].sensori[2])}</td><td className="p-2 text-center">{fmt(SCENARI[3].sensori[2])}</td></tr>
              <tr><td className="p-2 font-medium">Ricavi A3 (€)</td><td className="p-2 text-center">{fmtK(SCENARI[1].sensori[2] * SCENARI[1].prezzo[2] * 12)}</td><td className="p-2 text-center font-bold">{fmtK(SCENARI[2].sensori[2] * SCENARI[2].prezzo[2] * 12)}</td><td className="p-2 text-center">{fmtK(SCENARI[3].sensori[2] * SCENARI[3].prezzo[2] * 12)}</td></tr>
              <tr className="bg-gray-50"><td className="p-2 font-medium">Satelliti totali</td><td className="p-2 text-center">{SCENARI[1].satelliti.reduce((a,b)=>a+b, 0)}</td><td className="p-2 text-center font-bold">{SCENARI[2].satelliti.reduce((a,b)=>a+b, 0)}</td><td className="p-2 text-center">{SCENARI[3].satelliti.reduce((a,b)=>a+b, 0)}</td></tr>
              <tr><td className="p-2 font-medium">CAPEX totale (€)</td><td className="p-2 text-center">{fmtK(SCENARI[1].satelliti.reduce((a,b,i)=>a+b*(SCENARI[1].costoSat[i]+SCENARI[1].costoLancio),0))}</td><td className="p-2 text-center font-bold">{fmtK(SCENARI[2].satelliti.reduce((a,b,i)=>a+b*(SCENARI[2].costoSat[i]+SCENARI[2].costoLancio),0))}</td><td className="p-2 text-center">{fmtK(SCENARI[3].satelliti.reduce((a,b,i)=>a+b*(SCENARI[3].costoSat[i]+SCENARI[3].costoLancio),0))}</td></tr>
              <tr className="bg-gray-50"><td className="p-2 font-medium">Team FTE A3</td><td className="p-2 text-center">{SCENARI[1].fte[2]}</td><td className="p-2 text-center font-bold">{SCENARI[2].fte[2]}</td><td className="p-2 text-center">{SCENARI[3].fte[2]}</td></tr>
              <tr><td className="p-2 font-medium">Funding totale (€)</td><td className="p-2 text-center">{fmtK(SCENARI[1].seed + SCENARI[1].seriesA + SCENARI[1].grants)}</td><td className="p-2 text-center font-bold">{fmtK(SCENARI[2].seed + SCENARI[2].seriesA + SCENARI[2].grants)}</td><td className="p-2 text-center">{fmtK(SCENARI[3].seed + SCENARI[3].seriesA + SCENARI[3].grants)}</td></tr>
              <tr className="bg-gray-50"><td className="p-2 font-medium">LTV/CAC A3</td><td className="p-2 text-center">{(SCENARI[1].prezzo[2] / SCENARI[1].churn / SCENARI[1].cac[2]).toFixed(1)}x</td><td className="p-2 text-center font-bold">{(SCENARI[2].prezzo[2] / SCENARI[2].churn / SCENARI[2].cac[2]).toFixed(1)}x</td><td className="p-2 text-center">{(SCENARI[3].prezzo[2] / SCENARI[3].churn / SCENARI[3].cac[2]).toFixed(1)}x</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ANALISI BREAK-EVEN */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Target size={18} /> ANALISI BREAK-EVEN</h3>
        <p className="text-xs text-gray-500 mb-2">Ipotesi: Costi fissi operativi A3 = {fmtK(costiFissi)}, Margine Lordo = 75%</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 bg-blue-900 text-white">Prezzo €/mese</th>
                <th className="p-2 bg-blue-900 text-white">Contribuzione annua</th>
                <th className="p-2 bg-blue-900 text-white">Break-even Sensori</th>
                <th className="p-2 bg-blue-900 text-white">vs Target ({fmt(inputs.sensori[2])})</th>
              </tr>
            </thead>
            <tbody>
              {breakEvenData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 text-center font-medium">{row.prezzo}€</td>
                  <td className="p-2 text-center">{fmt(row.contribuzione, 1)}€</td>
                  <td className="p-2 text-center">{fmt(Math.round(row.breakEvenSensori))}</td>
                  <td className={`p-2 text-center font-medium ${row.raggiungibile ? 'text-green-600' : 'text-red-600'}`}>
                    {row.raggiungibile ? '✓ Raggiungibile' : '⚠ Sopra target'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GUIDA */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <h3 className="font-bold mb-2 flex items-center gap-2"><Lightbulb size={18} /> Come usare queste tabelle</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>TABELLA 1:</strong> Trova la combinazione sensori/prezzo per raggiungere i ricavi target</li>
          <li><strong>TABELLA 2:</strong> Verifica se il tuo LTV/CAC è sostenibile (verde ≥3x)</li>
          <li><strong>TABELLA 3:</strong> Pianifica il budget CAPEX in base alla costellazione</li>
          <li><strong>TORNADO:</strong> Identifica quali variabili hanno più impatto sul business</li>
          <li><strong>CONFRONTO:</strong> Valuta le differenze tra scenari pessimista/medio/ottimista</li>
          <li><strong>BREAK-EVEN:</strong> Determina quanti sensori servono per coprire i costi</li>
        </ul>
      </div>
    </div>
  );
  };

  // STATO PATRIMONIALE
  const renderStatoPatrimoniale = () => (
    <table className="w-full text-sm"><TableHeader title="STATO PATRIMONIALE" /><tbody>
      <SectionRow title="ATTIVO CIRCOLANTE" />
      <DataRow label="Cassa inizio anno" type="CALC" unit="€" values={calc.cassaInizio} />
      <DataRow label="Flusso netto" type="CALC" unit="€" values={calc.flussoNetto} />
      <DataRow label="Cassa fine anno" type="CALC" unit="€" values={calc.cassaFine} highlight />
      <DataRow label="Crediti commerciali" type="CALC" unit="€" values={calc.creditiComm} />
      <DataRow label="TOTALE CIRCOLANTE" type="CALC" unit="€" values={calc.totaleCircolante} highlight />
      <SectionRow title="ATTIVO IMMOBILIZZATO" />
      <DataRow label="Immobilizzazioni (lordo)" type="CALC" unit="€" values={calc.immobLordo} />
      <DataRow label="Fondo ammortamento" type="CALC" unit="€" values={calc.fondoAmmCumulato.map(v => -v)} />
      <DataRow label="TOTALE IMMOBILIZZATO" type="CALC" unit="€" values={calc.immobNetto} highlight />
      <DataRow label="TOTALE ATTIVO" type="CALC" unit="€" values={calc.totaleAttivo} highlight />
      <SectionRow title="PASSIVO CORRENTE" />
      <DataRow label="Debiti commerciali" type="CALC" unit="€" values={calc.debitiComm} />
      <DataRow label="Debiti tributari" type="CALC" unit="€" values={calc.debitiTrib} />
      <DataRow label="TOTALE PASSIVO" type="CALC" unit="€" values={calc.totalePassivoCorr} highlight />
      <SectionRow title="PATRIMONIO NETTO" />
      <DataRow label="Versamenti soci (cumulativi)" type="CALC" unit="€" values={calc.pnVersamenti} />
      <DataRow label="Utili cumulati" type="CALC" unit="€" values={calc.pnUtiliCumulati} />
      <DataRow label="TOTALE PN" type="CALC" unit="€" values={calc.totalePN} highlight />
      <DataRow label="TOTALE PASSIVO + PN" type="CALC" unit="€" values={calc.totalePassivoPN} highlight />
      <tr className={`border-t-2 ${calc.verificaSP.every(v => v === 0) ? 'bg-green-100' : 'bg-red-100'}`}>
        <td colSpan={3} className="px-3 py-2 font-bold">✓ VERIFICA (Attivo - Passivo - PN)</td>
        {[0,1,2].map(y => <td key={y} className="px-2 py-1"><div className={`px-2 py-1 text-center font-bold rounded ${calc.verificaSP[y] === 0 ? 'bg-green-300' : 'bg-red-300'}`}>{calc.verificaSP[y] === 0 ? '✓ QUADRA' : calc.verificaSP[y]}</div></td>)}
      </tr>
    </tbody></table>
  );

  // CASH FLOW
  const renderCashFlow = () => (
    <table className="w-full text-sm"><TableHeader title="RENDICONTO FINANZIARIO" /><tbody>
      <SectionRow title="CF OPERATIVO (metodo indiretto)" />
      <DataRow label="Utile netto" type="CALC" unit="€" values={calc.utileNetto} />
      <DataRow label="+ Ammortamenti" type="CALC" unit="€" values={calc.ammTotaleAnno} />
      <DataRow label="- Δ Crediti" type="CALC" unit="€" values={calc.deltaCrediti.map(d => -d)} />
      <DataRow label="+ Δ Debiti commerciali" type="CALC" unit="€" values={calc.deltaDebitiComm} />
      <DataRow label="+ Δ Debiti tributari" type="CALC" unit="€" values={calc.deltaDebitiTrib} />
      <DataRow label="CF OPERATIVO" type="CALC" unit="€" values={calc.cfOperativo} highlight />
      <SectionRow title="CF INVESTIMENTI" />
      <DataRow label="CAPEX" type="CALC" unit="€" values={calc.cfInvestimenti} />
      <SectionRow title="CF FINANZIARIO" />
      <DataRow label="Finanziamenti" type="CALC" unit="€" values={calc.cfFinanziario} />
      <SectionRow title="RIEPILOGO" />
      <DataRow label="Cassa inizio" type="CALC" unit="€" values={calc.cassaInizio} />
      <DataRow label="FLUSSO NETTO" type="CALC" unit="€" values={calc.flussoNetto} highlight />
      <DataRow label="CASSA FINE" type="CALC" unit="€" values={calc.cassaFine} highlight />
      <DataRow label="Free Cash Flow" type="CALC" unit="€" values={calc.fcf} />
      <DataRow label="Runway (mesi)" type="CALC" unit="m" values={calc.runway.map(r => Math.min(r, 99))} format="number" />
    </tbody></table>
  );

  // SCENARI
  const renderScenari = () => (
    <div className="p-4 space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-blue-900 mb-2">📊 Selezione Scenario</h3>
        <p className="text-sm text-gray-700 mb-3">Scegli uno scenario per vedere come cambiano tutti i calcoli del business plan.</p>
        <div className="flex gap-2">
          {[1, 2, 3].map(id => (
            <button key={id} onClick={() => loadScenario(id)} 
              className={`px-6 py-3 rounded-lg font-bold transition ${scenarioId === id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
              {SCENARI[id].name}
            </button>
          ))}
        </div>
      </div>
      
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-3 bg-blue-900 text-white text-left">Parametro</th>
            <th className="p-3 bg-red-700 text-white text-center">WORST</th>
            <th className="p-3 bg-yellow-600 text-white text-center">MEDIUM</th>
            <th className="p-3 bg-green-700 text-white text-center">BEST</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-200"><td colSpan={4} className="p-2 font-bold">📈 MERCATO E ADOZIONE</td></tr>
          <tr><td className="p-2 border">Sensori Anno 1</td><td className="p-2 border text-center">{fmt(SCENARI[1].sensori[0])}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmt(SCENARI[2].sensori[0])}</td><td className="p-2 border text-center">{fmt(SCENARI[3].sensori[0])}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Sensori Anno 2</td><td className="p-2 border text-center">{fmt(SCENARI[1].sensori[1])}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmt(SCENARI[2].sensori[1])}</td><td className="p-2 border text-center">{fmt(SCENARI[3].sensori[1])}</td></tr>
          <tr><td className="p-2 border">Sensori Anno 3</td><td className="p-2 border text-center">{fmt(SCENARI[1].sensori[2])}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmt(SCENARI[2].sensori[2])}</td><td className="p-2 border text-center">{fmt(SCENARI[3].sensori[2])}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Canone mensile A1</td><td className="p-2 border text-center">{SCENARI[1].prezzo[0]}€</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].prezzo[0]}€</td><td className="p-2 border text-center">{SCENARI[3].prezzo[0]}€</td></tr>
          <tr><td className="p-2 border">Canone mensile A2</td><td className="p-2 border text-center">{SCENARI[1].prezzo[1]}€</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].prezzo[1]}€</td><td className="p-2 border text-center">{SCENARI[3].prezzo[1]}€</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Canone mensile A3</td><td className="p-2 border text-center">{SCENARI[1].prezzo[2]}€</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].prezzo[2]}€</td><td className="p-2 border text-center">{SCENARI[3].prezzo[2]}€</td></tr>
          <tr><td className="p-2 border">Churn mensile</td><td className="p-2 border text-center">{(SCENARI[1].churn*100).toFixed(1)}%</td><td className="p-2 border text-center font-bold bg-yellow-50">{(SCENARI[2].churn*100).toFixed(1)}%</td><td className="p-2 border text-center">{(SCENARI[3].churn*100).toFixed(1)}%</td></tr>
          
          <tr className="bg-gray-200"><td colSpan={4} className="p-2 font-bold">🛰️ INFRASTRUTTURA</td></tr>
          <tr><td className="p-2 border">Satelliti Anno 1</td><td className="p-2 border text-center">{SCENARI[1].satelliti[0]}</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].satelliti[0]}</td><td className="p-2 border text-center">{SCENARI[3].satelliti[0]}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Satelliti Anno 2</td><td className="p-2 border text-center">{SCENARI[1].satelliti[1]}</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].satelliti[1]}</td><td className="p-2 border text-center">{SCENARI[3].satelliti[1]}</td></tr>
          <tr><td className="p-2 border">Satelliti Anno 3</td><td className="p-2 border text-center">{SCENARI[1].satelliti[2]}</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].satelliti[2]}</td><td className="p-2 border text-center">{SCENARI[3].satelliti[2]}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Costo produzione sat A1</td><td className="p-2 border text-center">{fmtK(SCENARI[1].costoSat[0])}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].costoSat[0])}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].costoSat[0])}</td></tr>
          <tr><td className="p-2 border">Costo produzione sat A2</td><td className="p-2 border text-center">{fmtK(SCENARI[1].costoSat[1])}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].costoSat[1])}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].costoSat[1])}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Costo produzione sat A3</td><td className="p-2 border text-center">{fmtK(SCENARI[1].costoSat[2])}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].costoSat[2])}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].costoSat[2])}</td></tr>
          <tr><td className="p-2 border">Costo lancio per satellite</td><td className="p-2 border text-center">{fmtK(SCENARI[1].costoLancio)}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].costoLancio)}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].costoLancio)}</td></tr>
          
          <tr className="bg-gray-200"><td colSpan={4} className="p-2 font-bold">👥 TEAM</td></tr>
          <tr><td className="p-2 border">FTE Anno 1</td><td className="p-2 border text-center">{SCENARI[1].fte[0]}</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].fte[0]}</td><td className="p-2 border text-center">{SCENARI[3].fte[0]}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">FTE Anno 2</td><td className="p-2 border text-center">{SCENARI[1].fte[1]}</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].fte[1]}</td><td className="p-2 border text-center">{SCENARI[3].fte[1]}</td></tr>
          <tr><td className="p-2 border">FTE Anno 3</td><td className="p-2 border text-center">{SCENARI[1].fte[2]}</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].fte[2]}</td><td className="p-2 border text-center">{SCENARI[3].fte[2]}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">RAL media</td><td className="p-2 border text-center">{fmtK(SCENARI[1].ral)}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].ral)}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].ral)}</td></tr>
          
          <tr className="bg-gray-200"><td colSpan={4} className="p-2 font-bold">💰 FINANZIAMENTI</td></tr>
          <tr><td className="p-2 border">Seed round</td><td className="p-2 border text-center">{fmtK(SCENARI[1].seed)}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].seed)}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].seed)}</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">Series A</td><td className="p-2 border text-center">{fmtK(SCENARI[1].seriesA)}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].seriesA)}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].seriesA)}</td></tr>
          <tr><td className="p-2 border">Grants pubblici</td><td className="p-2 border text-center">{fmtK(SCENARI[1].grants)}</td><td className="p-2 border text-center font-bold bg-yellow-50">{fmtK(SCENARI[2].grants)}</td><td className="p-2 border text-center">{fmtK(SCENARI[3].grants)}</td></tr>
          
          <tr className="bg-gray-200"><td colSpan={4} className="p-2 font-bold">📣 CAC E MARKETING</td></tr>
          <tr><td className="p-2 border">CAC Anno 1</td><td className="p-2 border text-center">{SCENARI[1].cac[0]}€</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].cac[0]}€</td><td className="p-2 border text-center">{SCENARI[3].cac[0]}€</td></tr>
          <tr className="bg-gray-50"><td className="p-2 border">CAC Anno 2</td><td className="p-2 border text-center">{SCENARI[1].cac[1]}€</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].cac[1]}€</td><td className="p-2 border text-center">{SCENARI[3].cac[1]}€</td></tr>
          <tr><td className="p-2 border">CAC Anno 3</td><td className="p-2 border text-center">{SCENARI[1].cac[2]}€</td><td className="p-2 border text-center font-bold bg-yellow-50">{SCENARI[2].cac[2]}€</td><td className="p-2 border text-center">{SCENARI[3].cac[2]}€</td></tr>
        </tbody>
      </table>
      
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <h4 className="font-bold mb-2">💡 Come usare gli scenari</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>WORST:</strong> Scenario pessimista - usa per stress test e piano B</li>
          <li><strong>MEDIUM:</strong> Scenario realistico - base per la pianificazione</li>
          <li><strong>BEST:</strong> Scenario ottimista - mostra il potenziale massimo</li>
        </ul>
      </div>
    </div>
  );

  // MERCATO
  const renderMercato = () => {
    // Calcoli TAM/SAM/SOM basati sugli input
    const tamSensori = 500000000; // 500M sensori IoT globali
    const tamValore = tamSensori * 2 * 12; // €2/mese media mercato
    const samPct = 0.05; // 5% addressable (agricoltura, ambiente remoto)
    const samSensori = tamSensori * samPct;
    const samValore = tamValore * samPct;
    const somPct = inputs.sensori[2] / samSensori; // quota raggiungibile
    const somSensori = inputs.sensori[2];
    const somValore = calc.ricaviTotali[2];
    
    return (
    <div className="p-4 space-y-6">
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-green-900 mb-2">🌍 Analisi di Mercato</h3>
        <p className="text-sm text-gray-700">Il mercato IoT satellitare è in forte crescita. Ecco come si posiziona NanoSat IoT.</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-900">TAM</h4>
          <p className="text-xs text-gray-500">Total Addressable Market</p>
          <p className="text-2xl font-bold mt-2">{fmtK(tamValore)}</p>
          <p className="text-sm text-gray-600">{fmtK(tamSensori)} sensori</p>
          <p className="text-xs text-gray-500 mt-2">Tutto il mercato IoT globale che potrebbe usare connettività satellitare</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <h4 className="font-bold text-green-900">SAM</h4>
          <p className="text-xs text-gray-500">Serviceable Addressable Market</p>
          <p className="text-2xl font-bold mt-2">{fmtK(samValore)}</p>
          <p className="text-sm text-gray-600">{fmtK(samSensori)} sensori</p>
          <p className="text-xs text-gray-500 mt-2">Segmenti che puoi realmente servire (agricoltura, ambiente, logistica remota)</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <h4 className="font-bold text-orange-900">SOM</h4>
          <p className="text-xs text-gray-500">Serviceable Obtainable Market</p>
          <p className="text-2xl font-bold mt-2">{fmtK(somValore)}</p>
          <p className="text-sm text-gray-600">{fmtK(somSensori)} sensori</p>
          <p className="text-xs text-gray-500 mt-2">Quota di mercato realisticamente raggiungibile in 3 anni</p>
        </div>
      </div>
      
      <table className="w-full text-sm"><thead><tr>
        <th className="p-3 bg-blue-900 text-white text-left">Metrica</th>
        <th className="p-3 bg-blue-900 text-white text-center">Anno 1</th>
        <th className="p-3 bg-blue-900 text-white text-center">Anno 2</th>
        <th className="p-3 bg-blue-900 text-white text-center">Anno 3</th>
      </tr></thead><tbody>
        <tr className="bg-gray-100"><td colSpan={4} className="p-2 font-bold">📊 DIMENSIONE MERCATO</td></tr>
        <tr><td className="p-2 border">TAM (valore €)</td><td className="p-2 border text-right">{fmtK(tamValore)}</td><td className="p-2 border text-right">{fmtK(tamValore * 1.1)}</td><td className="p-2 border text-right">{fmtK(tamValore * 1.21)}</td></tr>
        <tr className="bg-gray-50"><td className="p-2 border">SAM (valore €)</td><td className="p-2 border text-right">{fmtK(samValore)}</td><td className="p-2 border text-right">{fmtK(samValore * 1.15)}</td><td className="p-2 border text-right">{fmtK(samValore * 1.32)}</td></tr>
        <tr><td className="p-2 border">SOM target (sensori)</td><td className="p-2 border text-right">{fmt(inputs.sensori[0])}</td><td className="p-2 border text-right">{fmt(inputs.sensori[1])}</td><td className="p-2 border text-right">{fmt(inputs.sensori[2])}</td></tr>
        <tr className="bg-gray-50"><td className="p-2 border">SOM target (€)</td><td className="p-2 border text-right">{fmtK(calc.ricaviTotali[0])}</td><td className="p-2 border text-right">{fmtK(calc.ricaviTotali[1])}</td><td className="p-2 border text-right">{fmtK(calc.ricaviTotali[2])}</td></tr>
        <tr><td className="p-2 border font-bold">Quota SAM %</td><td className="p-2 border text-right font-bold">{fmtPct(inputs.sensori[0] / samSensori)}</td><td className="p-2 border text-right font-bold">{fmtPct(inputs.sensori[1] / samSensori)}</td><td className="p-2 border text-right font-bold">{fmtPct(inputs.sensori[2] / samSensori)}</td></tr>
        
        <tr className="bg-gray-100"><td colSpan={4} className="p-2 font-bold">🎯 POSIZIONAMENTO COMPETITIVO</td></tr>
        <tr><td className="p-2 border">Prezzo NanoSat (€/mese)</td><td className="p-2 border text-right text-green-600 font-bold">{inputs.prezzo[0]}€</td><td className="p-2 border text-right text-green-600 font-bold">{inputs.prezzo[1]}€</td><td className="p-2 border text-right text-green-600 font-bold">{inputs.prezzo[2]}€</td></tr>
        <tr className="bg-gray-50"><td className="p-2 border">Prezzo Iridium (€/mese)</td><td className="p-2 border text-right text-red-600">15€</td><td className="p-2 border text-right text-red-600">15€</td><td className="p-2 border text-right text-red-600">15€</td></tr>
        <tr><td className="p-2 border">Prezzo Globalstar (€/mese)</td><td className="p-2 border text-right text-red-600">12€</td><td className="p-2 border text-right text-red-600">12€</td><td className="p-2 border text-right text-red-600">12€</td></tr>
        <tr className="bg-gray-50"><td className="p-2 border font-bold">Vantaggio prezzo vs Iridium</td><td className="p-2 border text-right text-green-600 font-bold">-{fmtPct(1 - inputs.prezzo[0]/15)}</td><td className="p-2 border text-right text-green-600 font-bold">-{fmtPct(1 - inputs.prezzo[1]/15)}</td><td className="p-2 border text-right text-green-600 font-bold">-{fmtPct(1 - inputs.prezzo[2]/15)}</td></tr>
      </tbody></table>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-bold mb-3">🎯 Segmenti Target</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Agricoltura di precisione (40%)</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Monitoraggio ambientale (25%)</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-full"></span> Logistica e trasporti (20%)</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full"></span> Energy & Utilities (15%)</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-bold mb-3">💪 Vantaggi Competitivi</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Prezzo 70-80% più basso</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Focus su basso data rate IoT</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Nanosatelliti = costi inferiori</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Integrazione semplice</li>
          </ul>
        </div>
      </div>
    </div>
  );
  };

  // COSTI
  const renderCosti = () => (
    <table className="w-full text-sm"><TableHeader title="STRUTTURA COSTI" /><tbody>
      <SectionRow title="💰 CAPEX (Investimenti)" />
      <DataRow label="Produzione satelliti" type="CALC" unit="€" values={calc.capexSatelliti} />
      <DataRow label="Attrezzature" type="CALC" unit="€" values={calc.capexAttrezzature} />
      <DataRow label="TOTALE CAPEX" type="CALC" unit="€" values={calc.capexTotale} highlight />
      
      <SectionRow title="👥 COSTO PERSONALE" />
      <DataRow label="FTE totali" type="INPUT" unit="n." values={inputs.fte} inputKey="fte" format="number" />
      <DataRow label="RAL media" type="INPUT" unit="€" values={inputs.ral} inputKey="ral" />
      <DataRow label="Welfare %" type="INPUT" unit="%" values={inputs.welfare.map(w => w * 100)} inputKey="welfare" format="number" />
      <DataRow label="COSTO PERSONALE TOTALE" type="CALC" unit="€" values={calc.costoPersonale} highlight />
      
      <SectionRow title="🏢 OPEX (Costi Operativi)" />
      <DataRow label="Affitto annuo" type="CALC" unit="€" values={calc.affittoAnnuo} />
      <DataRow label="Ground station annuo" type="CALC" unit="€" values={calc.groundAnnuo} />
      <DataRow label="Cloud & IT annuo" type="CALC" unit="€" values={calc.cloudAnnuo} />
      <DataRow label="Altri OPEX (licenze, legal, R&D...)" type="CALC" unit="€" values={calc.altriOpex} />
      <DataRow label="TOTALE OPEX" type="CALC" unit="€" values={calc.opexTotale} highlight />
      
      <SectionRow title="📣 COSTI ACQUISIZIONE CLIENTI" />
      <DataRow label="CAC unitario" type="INPUT" unit="€" values={inputs.cac} inputKey="cac" />
      <DataRow label="Nuovi sensori acquisiti" type="CALC" unit="n." values={calc.sensoriNuovi} format="number" />
      <DataRow label="CAC TOTALE" type="CALC" unit="€" values={calc.cacTotale} highlight />
      
      <SectionRow title="📉 AMMORTAMENTI" />
      <DataRow label="Ammortamento satelliti" type="CALC" unit="€" values={calc.ammSatellitiAnno} />
      <DataRow label="Ammortamento attrezzature" type="CALC" unit="€" values={calc.ammAttrezzAnno} />
      <DataRow label="TOTALE AMMORTAMENTI" type="CALC" unit="€" values={calc.ammTotaleAnno} highlight />
      
      <SectionRow title="📊 RIEPILOGO COSTI" />
      <DataRow label="Totale Costi Operativi" type="CALC" unit="€" values={calc.totCostiOperativi} />
      <DataRow label="Totale CAPEX + OPEX + Personale" type="CALC" unit="€" values={[0,1,2].map(y => calc.capexTotale[y] + calc.opexTotale[y] + calc.costoPersonale[y] + calc.cacTotale[y])} highlight />
      
      <tr className="bg-blue-50">
        <td colSpan={3} className="px-3 py-2 font-bold">📈 Costo per Sensore Servito</td>
        {[0,1,2].map(y => (
          <td key={y} className="px-2 py-1">
            <div className="px-2 py-1 text-right font-bold bg-blue-100 rounded">
              {calc.sensoriFine[y] > 0 ? `${fmt((calc.costoPersonale[y] + calc.opexTotale[y]) / calc.sensoriFine[y], 1)}€` : '-'}
            </div>
          </td>
        ))}
      </tr>
    </tbody></table>
  );

  // Render sheet
  const renderSheet = () => {
    switch (activeSheet) {
      case 'IL_PROGETTO': return renderProgetto();
      case 'DASHBOARD': return renderDashboard();
      case 'SIMULATORE': return renderSimulator();
      case 'SCENARI': return renderScenari();
      case 'MERCATO': return renderMercato();
      case 'ASSUMPTIONS': return (
        <table className="w-full text-sm"><TableHeader title="ASSUMPTIONS" /><tbody>
          <SectionRow title="COSTELLAZIONE" />
          <DataRow label="Numero satelliti" type="INPUT" unit="n." values={inputs.satelliti} inputKey="satelliti" format="number" />
          <DataRow label="Costo produzione satellite" type="INPUT" unit="€" values={inputs.costoSat} inputKey="costoSat" />
          <DataRow label="Costo lancio satellite" type="INPUT" unit="€" values={inputs.costoLancio} inputKey="costoLancio" />
          <DataRow label="Vita utile satellite" type="INPUT" unit="anni" values={inputs.vitaSatellite} inputKey="vitaSatellite" format="number" />
          <SectionRow title="MERCATO" />
          <DataRow label="Sensori IoT target" type="INPUT" unit="n." values={inputs.sensori} inputKey="sensori" format="number" />
          <DataRow label="Canone mensile" type="INPUT" unit="€" values={inputs.prezzo} inputKey="prezzo" step={0.1} />
          <DataRow label="Churn mensile" type="INPUT" unit="%" values={inputs.churn.map(c => c * 100)} inputKey="churn" format="number" step={0.1} />
          <DataRow label="CAC" type="INPUT" unit="€" values={inputs.cac} inputKey="cac" />
          <SectionRow title="TEAM" />
          <DataRow label="FTE totali" type="INPUT" unit="n." values={inputs.fte} inputKey="fte" format="number" />
          <DataRow label="RAL media" type="INPUT" unit="€" values={inputs.ral} inputKey="ral" />
          <SectionRow title="WORKING CAPITAL" />
          <DataRow label="Giorni incasso" type="INPUT" unit="gg" values={inputs.ggIncasso} inputKey="ggIncasso" format="number" />
          <DataRow label="Giorni pagamento" type="INPUT" unit="gg" values={inputs.ggPagamento} inputKey="ggPagamento" format="number" />
          <SectionRow title="FINANZIAMENTI" />
          <DataRow label="Capitale founders" type="INPUT" unit="€" values={inputs.capitaleFounders} inputKey="capitaleFounders" />
          <DataRow label="Seed" type="INPUT" unit="€" values={inputs.seed} inputKey="seed" />
          <DataRow label="Series A" type="INPUT" unit="€" values={inputs.seriesA} inputKey="seriesA" />
          <DataRow label="Grants" type="INPUT" unit="€" values={inputs.grants} inputKey="grants" />
        </tbody></table>
      );
      case 'RICAVI': return (
        <table className="w-full text-sm"><TableHeader title="RICAVI" /><tbody>
          <SectionRow title="SENSORI" />
          <DataRow label="Sensori inizio" type="CALC" unit="n." values={calc.sensoriInizio} format="number" />
          <DataRow label="Nuovi sensori" type="CALC" unit="n." values={calc.sensoriNuovi} format="number" />
          <DataRow label="Churn" type="CALC" unit="n." values={calc.sensoriChurn} format="number" />
          <DataRow label="Sensori fine" type="CALC" unit="n." values={calc.sensoriFine} format="number" highlight />
          <SectionRow title="RICAVI" />
          <DataRow label="Subscription" type="CALC" unit="€" values={calc.ricaviSub} />
          <DataRow label="Premium" type="CALC" unit="€" values={calc.ricaviPremium} />
          <DataRow label="Hardware" type="CALC" unit="€" values={calc.ricaviHardware} />
          <DataRow label="TOTALE RICAVI" type="CALC" unit="€" values={calc.ricaviTotali} highlight />
          <DataRow label="Crescita YoY" type="CALC" unit="%" values={calc.crescitaYoY} format="percent" />
        </tbody></table>
      );
      case 'COSTI': return renderCosti();
      case 'CONTO_ECONOMICO': return (
        <table className="w-full text-sm"><TableHeader title="CONTO ECONOMICO" /><tbody>
          <DataRow label="Ricavi" type="CALC" unit="€" values={calc.ricaviTotali} highlight />
          <DataRow label="Costi diretti" type="CALC" unit="€" values={calc.costiDiretti} />
          <DataRow label="MARGINE LORDO" type="CALC" unit="€" values={calc.margineLordo} highlight />
          <DataRow label="Margine %" type="CALC" unit="%" values={calc.margineLordoPct} format="percent" />
          <SectionRow title="COSTI OPERATIVI" />
          <DataRow label="Personale" type="CALC" unit="€" values={calc.costoPersonale} />
          <DataRow label="Altri OPEX" type="CALC" unit="€" values={calc.opexTotale.map((o,y) => o - calc.costiDiretti[y])} />
          <DataRow label="CAC" type="CALC" unit="€" values={calc.cacTotale} />
          <DataRow label="EBITDA" type="CALC" unit="€" values={calc.ebitda} highlight />
          <DataRow label="EBITDA %" type="CALC" unit="%" values={calc.ebitdaPct} format="percent" />
          <DataRow label="Ammortamenti" type="CALC" unit="€" values={calc.ammTotaleAnno} />
          <DataRow label="EBIT" type="CALC" unit="€" values={calc.ebit} highlight />
          <DataRow label="Imposte" type="CALC" unit="€" values={calc.imposteCompetenza} />
          <DataRow label="UTILE NETTO" type="CALC" unit="€" values={calc.utileNetto} highlight />
        </tbody></table>
      );
      case 'STATO_PATRIMONIALE': return renderStatoPatrimoniale();
      case 'CASH_FLOW': return renderCashFlow();
      case 'KPI_CLASSICI': return renderKPIClassici();
      case 'KPI_AVANZATI': return renderKPIAvanzati();
      case 'VALUATION': return renderValuation();
      case 'SENSITIVITY': return renderSensitivity();
      default: return renderDashboard();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // WIZARD COMPONENTS & STEPS
  // ═══════════════════════════════════════════════════════════════

  const WIZARD_STEPS = [
    { id: 1, title: 'Il Tuo Progetto', subtitle: 'Scegli il punto di partenza' },
    { id: 2, title: 'Il Mercato', subtitle: 'Sensori, prezzi e churn' },
    { id: 3, title: 'L\'Infrastruttura', subtitle: 'Satelliti e costi' },
    { id: 4, title: 'Acquisizione Clienti', subtitle: 'CAC e strategia' },
    { id: 5, title: 'Il Team', subtitle: 'Persone e costi' },
    { id: 6, title: 'I Finanziamenti', subtitle: 'Fonti di funding' }
  ];

  const WizardProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {WIZARD_STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => setWizardStep(step.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              wizardStep === step.id ? 'bg-blue-600 text-white scale-110' :
              wizardStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {wizardStep > step.id ? <Check size={18} /> : step.id}
          </button>
          {idx < WIZARD_STEPS.length - 1 && (
            <div className={`w-12 h-1 rounded ${wizardStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const InfoBox = ({ type = 'info', children }) => {
    const styles = {
      tip: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      formula: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    const icons = { tip: <Lightbulb size={18} />, warning: <AlertTriangle size={18} />, info: <Info size={18} />, formula: <Target size={18} /> };
    return (
      <div className={`flex gap-3 p-4 rounded-lg border ${styles[type]} mb-4`}>
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="text-sm">{children}</div>
      </div>
    );
  };

  const WizardInputRow = ({ label, values, inputKey, unit = '€', step = 1, help }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <label className="font-medium text-gray-700">{label}</label>
        {help && (
          <button onClick={() => setExpandedHelp(prev => ({ ...prev, [inputKey]: !prev[inputKey] }))} className="text-blue-500 hover:text-blue-700">
            <HelpCircle size={16} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map(y => (
          <div key={y}>
            <div className="text-xs text-gray-500 mb-1 font-medium">Anno {y + 1}</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={values[y]}
                onChange={(e) => updateInput(inputKey, y, parseFloat(e.target.value) || 0)}
                step={step}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-medium"
              />
              <span className="text-gray-500 text-sm whitespace-nowrap min-w-[50px]">{unit}</span>
            </div>
          </div>
        ))}
      </div>
      {expandedHelp[inputKey] && help && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">{help}</div>
      )}
    </div>
  );

  const WizardNav = () => (
    <div className="flex justify-between mt-8 pt-6 border-t">
      <button
        onClick={() => setWizardStep(s => s - 1)}
        disabled={wizardStep === 1}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
          wizardStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <ChevronLeft size={20} /> Indietro
      </button>
      {wizardStep < 6 ? (
        <button onClick={() => setWizardStep(s => s + 1)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Avanti <ChevronRight size={20} />
        </button>
      ) : (
        <button onClick={() => setViewMode('dashboard')} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
          <CheckCircle size={20} /> Vai alla Dashboard
        </button>
      )}
    </div>
  );

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Benvenuto nel Wizard</h2>
            <p className="text-gray-600 mb-6">Scegli uno scenario di partenza o parti da zero per compilare il tuo business plan.</p>
            <InfoBox type="tip">Gli scenari preimpostati contengono valori realistici basati su ricerche di mercato. Puoi modificare ogni valore nei passi successivi.</InfoBox>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map(id => (
                <button
                  key={id}
                  onClick={() => { loadScenario(id); setWizardStep(2); }}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    scenarioId === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`text-lg font-bold mb-2 ${id === 1 ? 'text-red-600' : id === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {SCENARI[id].name}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📡 {SCENARI[id].sensori[2].toLocaleString()} sensori (Y3)</div>
                    <div>🛰️ {SCENARI[id].satelliti[2]} satelliti (Y3)</div>
                    <div>👥 {SCENARI[id].fte[2]} dipendenti (Y3)</div>
                    <div>💰 €{((SCENARI[id].seed + SCENARI[id].seriesA + SCENARI[id].grants) / 1000).toFixed(0)}k funding</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Il Mercato</h2>
            <p className="text-gray-600 mb-6">Definisci quanti sensori prevedi di connettere, a quale prezzo e il tasso di abbandono.</p>
            <InfoBox type="info">Il prezzo per sensore dovrebbe bilanciare competitività e sostenibilità. Considera che il churn mensile impatta fortemente sul LTV.</InfoBox>
            <div className="bg-gray-50 rounded-xl p-6">
              <WizardInputRow label="Sensori connessi" values={inputs.sensori} inputKey="sensori" unit="sensori" step={100} help="Numero di sensori IoT che prevedi di connettere alla tua rete satellitare." />
              <WizardInputRow label="Prezzo per sensore" values={inputs.prezzo} inputKey="prezzo" unit="€/mese" step={0.1} help="Ricavo mensile per ogni sensore connesso. Include la subscription base." />
              <WizardInputRow label="Churn mensile" values={inputs.churn.map(v => v * 100)} inputKey="churn" unit="%" step={0.1} help="Percentuale di clienti che perdi ogni mese. Un churn del 2% significa che perdi ~21% dei clienti all'anno." />
            </div>
            <InfoBox type="formula" className="mt-4">
              <strong>LTV = ARPU ÷ Churn</strong> — Con €3/mese e 2% churn: LTV = 3 ÷ 0.02 = €150 per cliente
            </InfoBox>
          </div>
        );

      case 3:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">L'Infrastruttura</h2>
            <p className="text-gray-600 mb-6">Configura la tua costellazione di satelliti e i costi associati.</p>
            <InfoBox type="warning">I satelliti sono CAPEX pesanti. Ogni satellite ha una vita utile limitata (3-5 anni) e richiede ammortamento.</InfoBox>
            <div className="bg-gray-50 rounded-xl p-6">
              <WizardInputRow label="Numero satelliti" values={inputs.satelliti} inputKey="satelliti" unit="sat" step={1} help="Quanti satelliti prevedi di lanciare. Più satelliti = più copertura ma più CAPEX." />
              <WizardInputRow label="Costo per satellite" values={inputs.costoSat} inputKey="costoSat" unit="€" step={1000} help="Costo di costruzione/acquisto di ogni satellite. Può scendere con le economie di scala." />
              <WizardInputRow label="Costo lancio (per sat)" values={inputs.costoLancio} inputKey="costoLancio" unit="€" step={1000} help="Costo per mettere in orbita ogni satellite. Include quota del vettore." />
              <WizardInputRow label="Vita utile satellite" values={inputs.vitaSatellite} inputKey="vitaSatellite" unit="anni" step={1} help="Durata operativa prevista. Determina il periodo di ammortamento." />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acquisizione Clienti</h2>
            <p className="text-gray-600 mb-6">Quanto costa acquisire ogni nuovo cliente?</p>
            <InfoBox type="info">Il CAC include tutti i costi di marketing e vendita divisi per il numero di nuovi clienti. Un LTV/CAC ratio di almeno 3x è considerato sano.</InfoBox>
            <div className="bg-gray-50 rounded-xl p-6">
              <WizardInputRow label="CAC (per sensore)" values={inputs.cac} inputKey="cac" unit="€" step={1} help="Customer Acquisition Cost: quanto spendi per acquisire ogni nuovo sensore connesso." />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[0, 1, 2].map(y => {
                const ltv = inputs.prezzo[y] / inputs.churn[y];
                const ratio = ltv / inputs.cac[y];
                return (
                  <div key={y} className={`p-4 rounded-lg ${ratio >= 3 ? 'bg-green-50' : ratio >= 1 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                    <div className="text-sm text-gray-500">Anno {y + 1}</div>
                    <div className="text-2xl font-bold">{ratio.toFixed(1)}x</div>
                    <div className="text-xs text-gray-600">LTV/CAC ratio</div>
                    <div className={`text-xs font-medium mt-1 ${ratio >= 3 ? 'text-green-600' : ratio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {ratio >= 3 ? '✓ Ottimo' : ratio >= 1 ? '⚠ Da migliorare' : '✗ Critico'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Il Team</h2>
            <p className="text-gray-600 mb-6">Pianifica la crescita del team e i costi del personale.</p>
            <InfoBox type="tip">Il costo del personale è spesso la voce più grande. Considera RAL + welfare + contributi (~40% extra sul lordo).</InfoBox>
            <div className="bg-gray-50 rounded-xl p-6">
              <WizardInputRow label="Numero dipendenti (FTE)" values={inputs.fte} inputKey="fte" unit="FTE" step={1} help="Full-Time Equivalent: numero di dipendenti a tempo pieno." />
              <WizardInputRow label="RAL media" values={inputs.ral} inputKey="ral" unit="€/anno" step={1000} help="Retribuzione Annua Lorda media per dipendente." />
              <WizardInputRow label="Welfare %" values={inputs.welfare.map(v => v * 100)} inputKey="welfare" unit="%" step={1} help="Percentuale di benefit aggiuntivi (buoni pasto, assicurazione, formazione...)." />
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Costo totale personale stimato:</strong>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {[0, 1, 2].map(y => (
                    <div key={y}>Anno {y + 1}: <strong>€{fmt(inputs.fte[y] * inputs.ral[y] * (1 + inputs.welfare[y]) * 1.4)}</strong></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">I Finanziamenti</h2>
            <p className="text-gray-600 mb-6">Definisci le fonti di finanziamento per il tuo progetto.</p>
            <InfoBox type="info">Mix di equity (founders, seed, series) e grants permette di bilanciare diluzione e runway.</InfoBox>
            <div className="bg-gray-50 rounded-xl p-6">
              <WizardInputRow label="Capitale Founders" values={inputs.capitaleFounders} inputKey="capitaleFounders" unit="€" step={10000} help="Capitale iniziale versato dai fondatori." />
              <WizardInputRow label="Seed Round" values={inputs.seed} inputKey="seed" unit="€" step={10000} help="Primo round di finanziamento da angel/VC." />
              <WizardInputRow label="Series A" values={inputs.seriesA} inputKey="seriesA" unit="€" step={100000} help="Round di crescita tipicamente 1-5M€." />
              <WizardInputRow label="Grants & Contributi" values={inputs.grants} inputKey="grants" unit="€" step={10000} help="Finanziamenti a fondo perduto (EU, ASI, regionali...)." />
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Totale funding:</strong> €{fmt(inputs.capitaleFounders.reduce((a, b) => a + b, 0) + inputs.seed.reduce((a, b) => a + b, 0) + inputs.seriesA.reduce((a, b) => a + b, 0) + inputs.grants.reduce((a, b) => a + b, 0))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderWizard = () => (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <WizardProgress />
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-sm text-gray-500 mb-4">
          Passo {wizardStep} di 6: <span className="font-medium text-gray-700">{WIZARD_STEPS[wizardStep - 1].title}</span>
        </div>
        {renderWizardStep()}
        <WizardNav />
      </div>
    </div>
  );

  const sheets = ['IL_PROGETTO', 'DASHBOARD', 'SIMULATORE', 'SCENARI', 'ASSUMPTIONS', 'MERCATO', 'RICAVI', 'COSTI', 'CONTO_ECONOMICO', 'STATO_PATRIMONIALE', 'CASH_FLOW', 'KPI_CLASSICI', 'KPI_AVANZATI', 'VALUATION', 'SENSITIVITY'];

  return (
    <div className="min-h-screen bg-gray-100">
      <KPIInfoModal />
      <style>{`.fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Satellite size={28} />
            <div><h1 className="text-lg font-bold">NanoSat IoT Business Plan</h1><p className="text-blue-200 text-xs">Modello Integrato CE/SP/CF - Il bilancio quadra ✓</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-blue-800 rounded p-1">
              <button onClick={() => setViewMode('dashboard')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition ${viewMode === 'dashboard' ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-600'}`}>
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button onClick={() => setViewMode('wizard')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition ${viewMode === 'wizard' ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-600'}`}>
                <Compass size={16} /> Guida
              </button>
            </div>
            {viewMode === 'dashboard' && (
              <div className="flex items-center gap-1 bg-blue-800 rounded p-1">
                {[1, 2, 3].map(id => (
                  <button key={id} onClick={() => loadScenario(id)} className={`px-4 py-1.5 rounded text-sm font-medium transition ${scenarioId === id ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-600'}`}>{SCENARI[id].name}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      {viewMode === 'wizard' ? (
        <div className="fade-in">
          {renderWizard()}
        </div>
      ) : (
        <>
          <div className="bg-gray-300 border-b border-gray-400 overflow-x-auto">
            <div className="max-w-7xl mx-auto flex">
              {sheets.map(sheet => (
                <button key={sheet} onClick={() => setActiveSheet(sheet)} className={`px-3 py-2 text-xs font-medium border-r border-gray-400 whitespace-nowrap transition ${activeSheet === sheet ? 'bg-white text-blue-800 border-t-2 border-t-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}>{sheet.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
          <main className="max-w-7xl mx-auto p-4">
            <div className="bg-white rounded shadow overflow-auto max-h-[calc(100vh-180px)]">{renderSheet()}</div>
          </main>
          <footer className="bg-gray-700 text-white p-2 text-center text-xs">
            <span className="inline-flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border border-yellow-400 rounded"></span> INPUT</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-300 rounded"></span> CALC</span>
              <span>✓ Bilancio quadra: Attivo = Passivo + PN</span>
            </span>
          </footer>
        </>
      )}
    </div>
  );
}
