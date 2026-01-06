import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Satellite, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Lightbulb, Sliders, BookOpen, Target, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, HelpCircle, Compass, LayoutDashboard } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARI PREDEFINITI
// ═══════════════════════════════════════════════════════════════════════════════
const SCENARI = {
  1: { name: 'WORST', sensori: [2500, 10000, 35000], prezzo: [3.0, 2.5, 2.0], churn: 0.03, satelliti: [2, 4, 6], costoSat: [100000, 90000, 80000], costoLancio: 20000, fte: [6, 10, 16], ral: 48000, cac: [35, 28, 22], seed: 300000, seriesA: 1000000, grants: 300000 },
  2: { name: 'MEDIUM', sensori: [5000, 25000, 100000], prezzo: [3.5, 3.0, 2.5], churn: 0.02, satelliti: [4, 8, 12], costoSat: [80000, 70000, 60000], costoLancio: 15000, fte: [9, 17, 27], ral: 50000, cac: [25, 20, 15], seed: 500000, seriesA: 2000000, grants: 650000 },
  3: { name: 'BEST', sensori: [8000, 45000, 200000], prezzo: [4.0, 3.5, 3.0], churn: 0.01, satelliti: [6, 14, 24], costoSat: [70000, 60000, 50000], costoLancio: 12000, fte: [12, 25, 40], ral: 52000, cac: [18, 14, 10], seed: 800000, seriesA: 3500000, grants: 1000000 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIZIONI KPI
// ═══════════════════════════════════════════════════════════════════════════════
const KPI_INFO = {
  grossMargin: { name: 'Gross Margin %', cosa: 'Percentuale di ricavi che resta dopo i costi diretti (ground station, cloud)', esempio: 'Incassi 100€, costi diretti 30€ → Gross Margin = 70%', perche: 'Un margine alto (>60%) significa che ogni cliente porta soldi da reinvestire.', target: '>65% per SaaS/tech.', come: 'Per migliorarlo: negozia costi infrastruttura, ottimizza uso cloud, aumenta prezzi.' },
  ebitdaMargin: { name: 'EBITDA Margin %', cosa: 'Quanto resta dopo TUTTI i costi operativi, prima di ammortamenti e tasse', esempio: 'Ricavi 500k€, costi op. 600k€ → EBITDA=-100k€, margine -20%', perche: 'Mostra se il business "gira" operativamente.', target: 'Anno 3: almeno 0% o positivo.', come: 'Per migliorarlo: aumenta ricavi più velocemente dei costi.' },
  netMargin: { name: 'Net Profit Margin %', cosa: 'Profitto finale dopo TUTTO: costi, ammortamenti, interessi, tasse', esempio: 'Ricavi 1M€, utile netto 100k€ → Net Margin = 10%', perche: 'Gli investitori guardano quando l\'utile diventa positivo.', target: '>15% a regime.', come: 'Per migliorarlo: ottimizza struttura fiscale, migliora EBITDA.' },
  revenueGrowth: { name: 'Revenue Growth YoY', cosa: 'Di quanto aumentano i ricavi rispetto all\'anno prima', esempio: 'Anno 1=100k€, Anno 2=250k€ → Crescita=+150%', perche: 'LA metrica più importante per una startup.', target: '>50%/anno buono, >100% eccellente.', come: 'Per migliorarlo: espandi canali vendita, entra in nuovi mercati.' },
  fcf: { name: 'Free Cash Flow', cosa: 'Soldi VERI che entrano/escono dalla cassa, dopo spese operative E investimenti', esempio: 'CF Operativo 200k€, CAPEX 400k€ → FCF = -200k€', perche: 'DIFFERENZA DA UTILE: l\'utile è contabile, il FCF è reale.', target: 'Positivo entro Anno 3-4.', come: 'Per migliorarlo: ritarda CAPEX, negozia pagamenti dilazionati.' },
  runway: { name: 'Runway', cosa: 'Quanti mesi puoi sopravvivere con la cassa attuale', esempio: 'Cassa 500k€, bruci 50k€/mese → Runway=10 mesi', perche: 'Se il runway è troppo corto devi cercare urgentemente finanziamenti.', target: 'Minimo 12 mesi, ideale 18-24.', come: 'Per migliorarlo: raccogli più capitale, riduci burn rate.' },
  mrr: { name: 'MRR', cosa: 'Ricavi RICORRENTI ogni mese dalle subscription', esempio: '2.500 sensori × 3.5€ = 8.750€ MRR', perche: 'LA metrica fondamentale per business in abbonamento.', target: 'In crescita costante.', come: 'Per migliorarlo: acquisisci più clienti, aumenta ARPU, riduci churn.' },
  arr: { name: 'ARR', cosa: 'MRR × 12. Modo standard per valutare aziende SaaS.', esempio: 'MRR 50k€ → ARR = 600k€', perche: 'Le valutazioni si basano su multipli dell\'ARR.', target: 'Crescita >50%/anno.', come: 'Per migliorarlo: focus su contratti annuali.' },
  cac: { name: 'CAC', cosa: 'Quanto spendi per acquisire UN nuovo cliente', esempio: 'Spendi 50k€, acquisisci 2.000 clienti → CAC = 25€', perche: 'Se il CAC è troppo alto il business non è sostenibile.', target: 'In calo anno su anno.', come: 'Per ridurlo: ottimizza marketing, migliora conversion rate.' },
  ltv: { name: 'LTV', cosa: 'Quanto VALE un cliente durante tutta la sua "vita"', esempio: 'Cliente paga 3€/mese, resta 50 mesi → LTV = 150€', perche: 'Se sai quanto vale un cliente, sai quanto puoi spendere per acquisirlo.', target: '>3× il CAC.', come: 'Per aumentarlo: riduci churn, aumenta ARPU.' },
  ltvCac: { name: 'LTV/CAC', cosa: 'IL NUMERO PIÙ IMPORTANTE. Rapporto tra valore del cliente e costo di acquisizione.', esempio: 'LTV=150€, CAC=25€ → LTV/CAC = 6×', perche: '<1× DISASTRO. 3× SOGLIA MINIMA. >5× ECCELLENTE.', target: 'Minimo 3×, ideale 4-5×.', come: 'Per migliorarlo: aumenta LTV E riduci CAC.' },
  cacPayback: { name: 'CAC Payback', cosa: 'Mesi per "ripagare" il costo di acquisizione', esempio: 'CAC=25€, ricavo mensile=3€ → Payback = 8.3 mesi', perche: 'Più è lungo, più cash devi avere per crescere.', target: '<12 mesi ideale.', come: 'Per ridurlo: aumenta ARPU primo mese, riduci CAC.' },
  churnAnnuo: { name: 'Churn Rate Annuo', cosa: 'Percentuale di clienti che perdi in un anno', esempio: 'Churn mensile 2% → Churn annuo ≈ 21%', perche: 'Alto churn = "riempi una vasca bucata".', target: '<10% annuo per B2B SaaS.', come: 'Per ridurlo: migliora onboarding, customer success.' },
  rule40: { name: 'Rule of 40', cosa: 'Crescita% + EBITDA%. Regola per salute startup SaaS.', esempio: 'Crescita 80% + EBITDA -30% = Rule of 40 = 50%', perche: 'Bilancia crescita e profittabilità.', target: '>40% è buono.', come: 'Per migliorarlo: accelera crescita o migliora profittabilità.' },
  revPerEmployee: { name: 'Revenue per Employee', cosa: 'Quanto fatturato genera ogni dipendente', esempio: 'Ricavi 500k€, team 9 persone → 55k€/dipendente', perche: 'Misura la produttività del team.', target: '€100-200k/dipendente per SaaS maturi.', come: 'Per migliorarlo: automatizza, usa AI.' },
  revPerSat: { name: 'Revenue per Satellite', cosa: 'Quanto fatturato genera ogni satellite', esempio: 'Ricavi 300k€, 4 satelliti → 75k€/satellite', perche: 'Misura efficienza dell\'investimento.', target: '>€100k/satellite a regime.', come: 'Per migliorarlo: acquisisci più clienti per satellite.' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// WIZARD STEPS INFO
// ═══════════════════════════════════════════════════════════════════════════════
const WIZARD_STEPS = [
  { id: 1, title: 'Il Tuo Progetto', subtitle: 'Scegli uno scenario di partenza', icon: Target },
  { id: 2, title: 'Il Mercato', subtitle: 'Clienti e pricing', icon: TrendingUp },
  { id: 3, title: 'L\'Infrastruttura', subtitle: 'Satelliti e costi', icon: Satellite },
  { id: 4, title: 'Acquisizione Clienti', subtitle: 'CAC e marketing', icon: Target },
  { id: 5, title: 'Il Team', subtitle: 'Persone e costi', icon: BookOpen },
  { id: 6, title: 'I Finanziamenti', subtitle: 'Funding e grants', icon: TrendingUp }
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function NanoSatBusinessPlanApp() {
  // View state
  const [viewMode, setViewMode] = useState('dashboard'); // 'wizard' | 'dashboard'
  const [wizardStep, setWizardStep] = useState(1);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  // Dashboard state
  const [scenarioId, setScenarioId] = useState(2);
  const [activeSheet, setActiveSheet] = useState('DASHBOARD');
  const [showImpact, setShowImpact] = useState({});
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [expandedHelp, setExpandedHelp] = useState({});
  const prevCalcRef = useRef(null);

  // INPUTS STATE
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

  // LocalStorage persistence
  useEffect(() => {
    const saved = localStorage.getItem('nanosat-bp-inputs');
    if (saved) {
      try { setInputs(JSON.parse(saved)); } catch (e) { console.error('Error loading saved inputs:', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nanosat-bp-inputs', JSON.stringify(inputs));
  }, [inputs]);

  // Load scenario
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

  // ═══════════════════════════════════════════════════════════════════════════════
  // CALCOLI INTEGRATI CE/SP/CF
  // ═══════════════════════════════════════════════════════════════════════════════
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

    // 10. VALUTAZIONE
    const valRevMultiple = ricaviTotali.map((r, y) => r * i.revenueMultiple[y]);
    const valArrMultiple = arr.map((a, y) => a * i.arrMultiple[y]);
    const terminalValue = fcf[2] > 0 && i.wacc[2] > i.terminalGrowth[2] ? fcf[2] * (1 + i.terminalGrowth[2]) / (i.wacc[2] - i.terminalGrowth[2]) : 0;
    const discountFactor = i.wacc.map((w, y) => 1 / Math.pow(1 + w, y + 1));
    const pvFcf = fcf.map((f, y) => f * discountFactor[y]);
    const pvTerminal = terminalValue * discountFactor[2];
    const valDcf = Math.max(0, pvFcf[0] + pvFcf[1] + pvFcf[2] + pvTerminal);
    const valMedia = [0, 1, 2].map(y => (valRevMultiple[y] + valArrMultiple[y] + (y === 2 ? valDcf : valRevMultiple[y])) / 3);

    return {
      sensoriInizio, sensoriNuovi, sensoriChurn, sensoriFine, sensoriMedi,
      ricaviSub, ricaviPremium, ricaviHardware, ricaviTotali, crescitaYoY,
      costoPersonale, affittoAnnuo, groundAnnuo, cloudAnnuo, altriOpex, opexTotale, cacTotale,
      capexSatelliti, capexAttrezzature, capexTotale, ammSatellitiAnno, ammAttrezzAnno, ammTotaleAnno,
      costiDiretti, margineLordo, margineLordoPct, totCostiOperativi, ebitda, ebitdaPct, ebit, imposteCompetenza, utileNetto, utilePct,
      immobLordo, fondoAmmCumulato, immobNetto,
      creditiCommInizio, creditiComm, deltaCrediti,
      debitiCommInizio, debitiComm, deltaDebitiComm,
      debitiTribInizio, debitiTrib, deltaDebitiTrib,
      totaleCircolante, totaleAttivo, totalePassivoCorr,
      finanziamentiAnno, pnVersamenti, pnUtiliCumulati, totalePN, totalePassivoPN, verificaSP,
      cfOperativo, cfInvestimenti, cfFinanziario, flussoNetto, cassaInizio, cassaFine,
      mrr, arr, churnAnnuo, ltv, ltvCac, cacPayback, rule40, fcf, runway, breakeven, breakevenOk, revPerEmployee, satTotali, revPerSat,
      valRevMultiple, valArrMultiple, valDcf, valMedia, terminalValue, pvFcf, pvTerminal, discountFactor
    };
  }, [inputs]);

  // Formatting
  const fmt = (n, d = 0) => n == null || isNaN(n) ? '-' : new Intl.NumberFormat('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const fmtK = (n) => n == null || isNaN(n) ? '-' : Math.abs(n) >= 1e6 ? `${fmt(n/1e6, 2)}M` : Math.abs(n) >= 1e3 ? `${fmt(n/1e3, 0)}k` : fmt(n, 0);
  const fmtPct = (n) => n == null || isNaN(n) ? '-' : `${fmt(n * 100, 1)}%`;

  // Wizard navigation with fade
  const goToStep = (step) => {
    if (step < 1 || step > 6) return;
    setFadeClass('opacity-0');
    setTimeout(() => {
      setWizardStep(step);
      setFadeClass('opacity-100');
    }, 150);
  };

  const switchView = (mode) => {
    setFadeClass('opacity-0');
    setTimeout(() => {
      setViewMode(mode);
      setFadeClass('opacity-100');
    }, 150);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // WIZARD COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════════

  const WizardProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {WIZARD_STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => goToStep(step.id)}
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
              wizardStep === step.id
                ? 'bg-blue-600 text-white scale-110 shadow-lg'
                : wizardStep > step.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {wizardStep > step.id ? <CheckCircle size={20} /> : step.id}
          </button>
          {idx < WIZARD_STEPS.length - 1 && (
            <div className={`w-12 h-1 rounded ${wizardStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const InfoBox = ({ type = 'info', title, children, collapsible = false, id }) => {
    const isExpanded = !collapsible || expandedHelp[id];
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      tip: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      warning: 'bg-red-50 border-red-200 text-red-800',
      formula: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    const icons = {
      info: <HelpCircle size={18} />,
      tip: <Lightbulb size={18} />,
      warning: <AlertTriangle size={18} />,
      formula: <BookOpen size={18} />
    };

    return (
      <div className={`rounded-lg border p-4 ${colors[type]}`}>
        <div
          className={`flex items-center gap-2 font-bold ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={() => collapsible && setExpandedHelp(prev => ({ ...prev, [id]: !prev[id] }))}
        >
          {icons[type]}
          <span>{title}</span>
          {collapsible && <ChevronRight className={`ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} size={18} />}
        </div>
        {isExpanded && <div className="mt-2 text-sm">{children}</div>}
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

  const CalcPreview = ({ label, values, format = 'currency', good }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${good === true ? 'bg-green-50' : good === false ? 'bg-red-50' : 'bg-gray-50'}`}>
      <span className="text-gray-700">{label}</span>
      <div className="flex gap-4">
        {values.map((v, y) => (
          <div key={y} className="text-right">
            <div className="text-xs text-gray-500">A{y + 1}</div>
            <div className={`font-bold ${good === false ? 'text-red-600' : good === true ? 'text-green-600' : ''}`}>
              {format === 'currency' ? fmtK(v) : format === 'percent' ? fmtPct(v) : format === 'ratio' ? `${fmt(v, 1)}x` : fmt(v, 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════════
  // WIZARD STEPS RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  const renderWizardStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Da dove vuoi partire?</h2>
        <p className="text-gray-600 mt-2">Scegli uno scenario predefinito come punto di partenza. Potrai modificare ogni singolo valore nei prossimi step.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { id: 1, name: 'WORST', color: 'red', desc: 'Scenario pessimista', icon: '🔴' },
          { id: 2, name: 'MEDIUM', color: 'yellow', desc: 'Scenario realistico', badge: 'CONSIGLIATO', icon: '🟡' },
          { id: 3, name: 'BEST', color: 'green', desc: 'Scenario ottimista', icon: '🟢' },
          { id: 0, name: 'BLANK', color: 'gray', desc: 'Parto da zero', icon: '⚪' }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => s.id !== 0 && loadScenario(s.id)}
            className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
              scenarioId === s.id ? `border-${s.color}-500 bg-${s.color}-50 shadow-lg` : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-3">{s.icon}</div>
            <div className="font-bold text-lg">{s.name}</div>
            <div className="text-sm text-gray-600">{s.desc}</div>
            {s.badge && <div className="mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">{s.badge}</div>}
          </button>
        ))}
      </div>

      <InfoBox type="tip" title="Perche 3 scenari?">
        <p>Gli investitori vogliono vedere che hai pensato a cosa succede se le cose vanno male (WORST), normalmente (MEDIUM), o bene (BEST). Ti consigliamo di partire da MEDIUM e poi adattare.</p>
      </InfoBox>

      {scenarioId && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow">
          <h3 className="font-bold text-lg mb-4">Anteprima Scenario: {SCENARI[scenarioId].name}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2"></th>
                <th className="text-right py-2">Anno 1</th>
                <th className="text-right py-2">Anno 2</th>
                <th className="text-right py-2">Anno 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-2">Sensori target</td>{inputs.sensori.map((v, i) => <td key={i} className="text-right py-2 font-medium">{fmt(v)}</td>)}</tr>
              <tr className="border-b"><td className="py-2">Satelliti</td>{inputs.satelliti.map((v, i) => <td key={i} className="text-right py-2 font-medium">{v}</td>)}</tr>
              <tr className="border-b"><td className="py-2">Team (FTE)</td>{inputs.fte.map((v, i) => <td key={i} className="text-right py-2 font-medium">{v}</td>)}</tr>
              <tr><td className="py-2 font-bold">Funding totale</td><td colSpan={3} className="text-right py-2 font-bold text-blue-600">{fmtK(calc.finanziamentiAnno.reduce((a, b) => a + b, 0))} €</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderWizardStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Quanti clienti vuoi raggiungere?</h2>
        <p className="text-gray-600 mt-2">Inserisci il numero di sensori IoT che prevedi di connettere e il prezzo.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Target size={20} /> Sensori Target</h3>
        <WizardInputRow
          label="Numero sensori target"
          values={inputs.sensori}
          inputKey="sensori"
          unit="n."
          step={1000}
          help="Sono i dispositivi IoT (sensori agricoli, ambientali, GPS, tracker, etc.) che useranno la tua connettività satellitare."
        />

        <InfoBox type="info" title="Benchmark di mercato" collapsible id="sensori-bench">
          <ul className="list-disc list-inside space-y-1">
            <li>Startup early-stage: 1.000 - 10.000 sensori Anno 1</li>
            <li>Crescita tipica: 3-5x anno su anno</li>
            <li>Leader di mercato (Iridium): ~1M dispositivi dopo 20 anni</li>
          </ul>
        </InfoBox>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><TrendingUp size={20} /> Pricing</h3>
        <WizardInputRow
          label="Canone mensile per sensore"
          values={inputs.prezzo}
          inputKey="prezzo"
          unit="€/mese"
          step={0.5}
          help="Il prezzo che ogni cliente paga ogni mese per connettere un sensore."
        />

        <InfoBox type="info" title="Come scegliere il prezzo?" collapsible id="prezzo-bench">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Iridium:</strong> 12-15€/mese (leader storico, caro)</li>
            <li><strong>Globalstar:</strong> 8-12€/mese (alternativa)</li>
            <li><strong>Starlink IoT:</strong> 5-8€/mese (nuovo entrante)</li>
            <li><strong>IL TUO VANTAGGIO:</strong> 2-4€/mese grazie ai nanosatelliti!</li>
          </ul>
          <p className="mt-2">Il prezzo può SCENDERE negli anni per economie di scala e battere la concorrenza.</p>
        </InfoBox>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><AlertTriangle size={20} /> Churn (abbandono)</h3>
        <WizardInputRow
          label="Churn mensile"
          values={inputs.churn.map(c => c * 100)}
          inputKey="churn"
          unit="%"
          step={0.5}
          help="Percentuale di clienti che smette di usare il servizio ogni mese."
        />

        <InfoBox type="warning" title="Attenzione al Churn!">
          <p>Un churn del 2% significa che su 100 clienti, 2 se ne vanno ogni mese.</p>
          <ul className="list-disc list-inside mt-2">
            <li><span className="text-green-600 font-bold">Eccellente:</span> &lt; 1% mensile</li>
            <li><span className="text-yellow-600 font-bold">Buono:</span> 1-2% mensile</li>
            <li><span className="text-red-600 font-bold">Preoccupante:</span> &gt; 3% mensile</li>
          </ul>
        </InfoBox>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Valori Calcolati</h3>
        <div className="space-y-3">
          <CalcPreview label="Sensori fine anno" values={calc.sensoriFine} format="number" />
          <CalcPreview label="Ricavi annui" values={calc.ricaviTotali} format="currency" />
          <CalcPreview label="Crescita YoY" values={calc.crescitaYoY} format="percent" good={calc.crescitaYoY[2] > 0.5} />
        </div>
      </div>
    </div>
  );

  const renderWizardStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">La tua costellazione di satelliti</h2>
        <p className="text-gray-600 mt-2">Definisci quanti satelliti lanciare e i relativi costi.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Satellite size={20} /> Numero Satelliti</h3>
        <WizardInputRow
          label="Satelliti da lanciare ogni anno"
          values={inputs.satelliti}
          inputKey="satelliti"
          unit="n."
          step={1}
          help="Il numero di nanosatelliti che prevedi di produrre e lanciare ogni anno."
        />

        <InfoBox type="info" title="Quanti satelliti servono?" collapsible id="sat-bench">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>4-6 satelliti:</strong> copertura parziale, latenza alta (ore)</li>
            <li><strong>12-20 satelliti:</strong> buona copertura, latenza media (minuti)</li>
            <li><strong>50+ satelliti:</strong> copertura globale, bassa latenza</li>
          </ul>
          <p className="mt-2">Per IoT (dati piccoli, non urgenti) bastano pochi satelliti.</p>
        </InfoBox>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6">Costi Satelliti</h3>
        <WizardInputRow
          label="Costo produzione per satellite"
          values={inputs.costoSat}
          inputKey="costoSat"
          unit="€"
          step={5000}
          help="Costo di produzione/assemblaggio di ogni singolo satellite (3U CubeSat)."
        />
        <WizardInputRow
          label="Costo lancio per satellite"
          values={inputs.costoLancio}
          inputKey="costoLancio"
          unit="€"
          step={1000}
          help="Costo del lancio in rideshare (condivisione con altri payload)."
        />
        <WizardInputRow
          label="Vita utile satellite"
          values={inputs.vitaSatellite}
          inputKey="vitaSatellite"
          unit="anni"
          step={1}
          help="Quanto tempo un satellite funziona prima di diventare inutilizzabile. Determina l'ammortamento."
        />

        <InfoBox type="formula" title="Benchmark costi nanosatelliti (3U CubeSat)">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Produzione:</strong> 50.000 - 150.000 €</li>
            <li><strong>Lancio rideshare:</strong> 10.000 - 30.000 €</li>
          </ul>
          <p className="mt-2">I costi scendono negli anni grazie a economie di scala e ottimizzazione.</p>
        </InfoBox>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Valori Calcolati</h3>
        <div className="space-y-3">
          <CalcPreview label="Satelliti totali (cumulativo)" values={calc.satTotali} format="number" />
          <CalcPreview label="CAPEX satelliti" values={calc.capexSatelliti} format="currency" />
          <CalcPreview label="Ammortamento annuo" values={calc.ammTotaleAnno} format="currency" />
          <CalcPreview label="Sensori per satellite" values={calc.sensoriFine.map((s, y) => calc.satTotali[y] > 0 ? s / calc.satTotali[y] : 0)} format="number" />
        </div>
      </div>
    </div>
  );

  const renderWizardStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Quanto costa acquisire un cliente?</h2>
        <p className="text-gray-600 mt-2">Il CAC (Customer Acquisition Cost) è fondamentale per la sostenibilità del business.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Target size={20} /> CAC - Customer Acquisition Cost</h3>
        <WizardInputRow
          label="CAC per sensore"
          values={inputs.cac}
          inputKey="cac"
          unit="€"
          step={5}
          help="Quanto spendi IN MEDIA per acquisire UN nuovo cliente/sensore. Include: marketing, vendite, promozioni, sconti, demo, etc."
        />

        <InfoBox type="info" title="Come funziona il CAC?" collapsible id="cac-info">
          <p><strong>Esempio:</strong> Se spendi 50.000€ in marketing e acquisisci 2.000 nuovi clienti, il tuo CAC = 50.000 / 2.000 = 25€</p>
          <p className="mt-2"><strong>Perché il CAC scende?</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Brand awareness: più ti conoscono, meno devi spendere</li>
            <li>Passaparola: clienti soddisfatti portano altri clienti</li>
            <li>Ottimizzazione: impari quali canali funzionano meglio</li>
          </ul>
        </InfoBox>
      </div>

      <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-800">
          <Lightbulb size={20} /> LTV/CAC: LA METRICA PIÙ IMPORTANTE
        </h3>
        <p className="mb-4 text-yellow-900">Dice se il tuo business model funziona:</p>
        <div className="grid grid-cols-4 gap-2 text-center mb-4">
          <div className="p-3 bg-red-200 rounded-lg">
            <div className="font-bold">&lt;1x</div>
            <div className="text-xs">PERDI SOLDI</div>
          </div>
          <div className="p-3 bg-yellow-200 rounded-lg">
            <div className="font-bold">1-3x</div>
            <div className="text-xs">RISCHIOSO</div>
          </div>
          <div className="p-3 bg-green-200 rounded-lg">
            <div className="font-bold">≥3x</div>
            <div className="text-xs">SANO</div>
          </div>
          <div className="p-3 bg-green-300 rounded-lg">
            <div className="font-bold">&gt;5x</div>
            <div className="text-xs">ECCELLENTE</div>
          </div>
        </div>
        <CalcPreview label="Il tuo LTV/CAC" values={calc.ltvCac} format="ratio" good={calc.ltvCac[2] >= 3} />
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">KPI Acquisizione</h3>
        <div className="space-y-3">
          <CalcPreview label="CAC Totale (spesa marketing)" values={calc.cacTotale} format="currency" />
          <CalcPreview label="LTV (valore lifetime cliente)" values={calc.ltv} format="currency" />
          <CalcPreview label="CAC Payback (mesi)" values={calc.cacPayback} format="number" good={calc.cacPayback[2] < 12} />
        </div>
      </div>
    </div>
  );

  const renderWizardStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Quante persone ti servono?</h2>
        <p className="text-gray-600 mt-2">Definisci la crescita del team e i costi del personale.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><BookOpen size={20} /> Team</h3>
        <WizardInputRow
          label="FTE totali (Full-Time Equivalent)"
          values={inputs.fte}
          inputKey="fte"
          unit="persone"
          step={1}
          help="FTE = Full-Time Equivalent = persona a tempo pieno. 2 persone part-time (50%) = 1 FTE"
        />

        <InfoBox type="info" title="Team tipico per startup space-tech" collapsible id="team-bench">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Anno 1:</strong> 5-10 persone (founders + core team)</li>
            <li><strong>Anno 2:</strong> 15-25 persone (scaling)</li>
            <li><strong>Anno 3:</strong> 25-50 persone (crescita)</li>
          </ul>
          <p className="mt-2"><strong>Composizione suggerita:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>40% Engineering (SW + HW satelliti)</li>
            <li>20% Operations (ground station, supporto)</li>
            <li>20% Sales & Marketing</li>
            <li>20% G&A (finance, HR, legal)</li>
          </ul>
        </InfoBox>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6">Costi Personale</h3>
        <WizardInputRow
          label="RAL media (Retribuzione Annua Lorda)"
          values={inputs.ral}
          inputKey="ral"
          unit="€/anno"
          step={1000}
          help="Stipendio lordo annuale medio del team."
        />
        <WizardInputRow
          label="Welfare % (costi aggiuntivi)"
          values={inputs.welfare.map(w => w * 100)}
          inputKey="welfare"
          unit="%"
          step={1}
          help="Costi aggiuntivi per l'azienda: contributi previdenziali, assicurazioni, benefit, formazione."
        />

        <InfoBox type="formula" title="Calcolo costo reale">
          <p><strong>COSTO REALE = RAL × (1 + Welfare%)</strong></p>
          <p className="mt-1">Es: 50.000€ × 1.15 = 57.500€ costo azienda per persona</p>
          <p className="mt-2"><strong>Benchmark RAL settore tech Italia:</strong></p>
          <ul className="list-disc list-inside">
            <li>Junior: 30-40k€</li>
            <li>Mid: 45-60k€</li>
            <li>Senior: 60-80k€</li>
            <li>Lead/Manager: 70-100k€</li>
          </ul>
        </InfoBox>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Valori Calcolati</h3>
        <div className="space-y-3">
          <CalcPreview label="Costo personale totale" values={calc.costoPersonale} format="currency" />
          <CalcPreview label="Costo per FTE" values={calc.costoPersonale.map((c, y) => inputs.fte[y] > 0 ? c / inputs.fte[y] : 0)} format="currency" />
          <CalcPreview label="Revenue per employee" values={calc.revPerEmployee} format="currency" good={calc.revPerEmployee[2] > 100000} />
        </div>
      </div>
    </div>
  );

  const renderWizardStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Come finanzierai l'azienda?</h2>
        <p className="text-gray-600 mt-2">Definisci le fonti di finanziamento per ogni anno.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-6">Fonti di Finanziamento</h3>

        <WizardInputRow
          label="Capitale Founders"
          values={inputs.capitaleFounders}
          inputKey="capitaleFounders"
          unit="€"
          step={10000}
          help="Soldi che mettete voi fondatori. Dimostra 'skin in the game' agli investitori. Tipico: 50-200k€ complessivi."
        />

        <WizardInputRow
          label="Seed Round"
          values={inputs.seed}
          inputKey="seed"
          unit="€"
          step={50000}
          help="Primo investimento esterno, da angel investor o fondi seed. Serve per MVP, primi clienti, validazione. Tipico: 200k - 1M€."
        />

        <WizardInputRow
          label="Series A"
          values={inputs.seriesA}
          inputKey="seriesA"
          unit="€"
          step={100000}
          help="Round di crescita, da fondi VC strutturati. Serve per scalare vendite, team, infrastruttura. Tipico: 1-5M€."
        />

        <WizardInputRow
          label="Grants pubblici"
          values={inputs.grants}
          inputKey="grants"
          unit="€"
          step={10000}
          help="Contributi pubblici A FONDO PERDUTO. Fonti: ESA, Horizon Europe, MISE, regioni, ASI. Pro: Non diluiscono. Contro: Lunghi, burocratici."
        />

        <InfoBox type="tip" title="Tipi di finanziamento spiegati" collapsible id="funding-info">
          <div className="space-y-3">
            <div><strong>Capitale Founders:</strong> I vostri soldi personali. Dimostra impegno agli investitori.</div>
            <div><strong>Seed Round:</strong> Primo round esterno (angel/fondi seed). Diluizione tipica: 10-20%</div>
            <div><strong>Series A:</strong> Round di crescita da VC. Diluizione tipica: 15-25%</div>
            <div><strong>Grants:</strong> Soldi gratis! Non devi restituirli né cedere quote.</div>
          </div>
        </InfoBox>
      </div>

      <div className={`rounded-xl p-6 ${calc.cassaFine[0] < 0 ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'}`}>
        <h3 className="font-bold text-lg mb-4">Riepilogo Finanziario</h3>
        <div className="space-y-3">
          <CalcPreview label="Funding totale anno" values={calc.finanziamentiAnno} format="currency" />
          <CalcPreview label="EBITDA" values={calc.ebitda} format="currency" good={calc.ebitda[2] > 0} />
          <CalcPreview label="Cassa fine anno" values={calc.cassaFine} format="currency" good={calc.cassaFine.every(c => c > 0)} />
          <CalcPreview label="Runway (mesi)" values={calc.runway.map(r => Math.min(r, 99))} format="number" good={calc.runway[0] >= 12} />
        </div>

        {calc.cassaFine[0] < 0 && (
          <InfoBox type="warning" title="Attenzione: Cassa negativa Anno 1!">
            <p>Con questi parametri, a fine Anno 1 avresti cassa negativa. I soldi finiscono PRIMA di fine anno!</p>
            <p className="mt-2"><strong>Soluzioni:</strong></p>
            <ul className="list-disc list-inside">
              <li>Aumenta il Seed round</li>
              <li>Riduci i costi (meno FTE, meno satelliti Anno 1)</li>
              <li>Cerca più grants</li>
            </ul>
          </InfoBox>
        )}
      </div>
    </div>
  );

  const renderWizardContent = () => {
    switch (wizardStep) {
      case 1: return renderWizardStep1();
      case 2: return renderWizardStep2();
      case 3: return renderWizardStep3();
      case 4: return renderWizardStep4();
      case 5: return renderWizardStep5();
      case 6: return renderWizardStep6();
      default: return renderWizardStep1();
    }
  };

  const renderWizard = () => (
    <div className={`transition-opacity duration-150 ${fadeClass}`}>
      <div className="max-w-4xl mx-auto">
        <WizardProgress />

        <div className="bg-blue-50 rounded-t-xl p-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            {React.createElement(WIZARD_STEPS[wizardStep - 1].icon, { size: 24, className: 'text-blue-600' })}
            <div>
              <h2 className="font-bold text-lg text-blue-900">Step {wizardStep} di 6: {WIZARD_STEPS[wizardStep - 1].title}</h2>
              <p className="text-blue-700 text-sm">{WIZARD_STEPS[wizardStep - 1].subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg p-6 mb-6">
          {renderWizardContent()}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => goToStep(wizardStep - 1)}
            disabled={wizardStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              wizardStep === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ChevronLeft size={20} /> Indietro
          </button>

          {wizardStep < 6 ? (
            <button
              onClick={() => goToStep(wizardStep + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Avanti <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={() => switchView('dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              <CheckCircle size={20} /> Completa e vai alla Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════════
  // DASHBOARD COMPONENTS (simplified versions)
  // ═══════════════════════════════════════════════════════════════════════════════

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

  // Dashboard render
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
            { label: 'Break-even', ok: calc.breakevenOk[2], value: calc.breakevenOk[2] ? 'Si' : 'No' },
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

  // Render sheet based on activeSheet
  const renderSheet = () => {
    switch (activeSheet) {
      case 'DASHBOARD': return renderDashboard();
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
      case 'CASH_FLOW': return (
        <table className="w-full text-sm"><TableHeader title="RENDICONTO FINANZIARIO" /><tbody>
          <SectionRow title="CF OPERATIVO" />
          <DataRow label="Utile netto" type="CALC" unit="€" values={calc.utileNetto} />
          <DataRow label="+ Ammortamenti" type="CALC" unit="€" values={calc.ammTotaleAnno} />
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
        </tbody></table>
      );
      case 'KPI': return (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white sticky top-0">
              <tr><th className="p-2 text-left">KPI</th><th className="p-2 w-20">A1</th><th className="p-2 w-20">A2</th><th className="p-2 w-20">A3</th><th className="p-2 w-8"></th></tr>
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
                    <td className="p-2"><button onClick={() => setSelectedKPI(row.key)} className="text-blue-500 hover:text-blue-700"><Info size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      case 'VALUATION': return (
        <table className="w-full text-sm"><TableHeader title="VALUTAZIONE" /><tbody>
          <SectionRow title="METODO 1: REVENUE MULTIPLE" />
          <DataRow label="Ricavi" type="CALC" unit="€" values={calc.ricaviTotali} />
          <DataRow label="Revenue Multiple" type="INPUT" unit="x" values={inputs.revenueMultiple} inputKey="revenueMultiple" format="number" />
          <DataRow label="VALUTAZIONE (Rev Multiple)" type="CALC" unit="€" values={calc.valRevMultiple} highlight />
          <SectionRow title="METODO 2: ARR MULTIPLE" />
          <DataRow label="ARR" type="CALC" unit="€" values={calc.arr} />
          <DataRow label="ARR Multiple" type="INPUT" unit="x" values={inputs.arrMultiple} inputKey="arrMultiple" format="decimal" step={0.5} />
          <DataRow label="VALUTAZIONE (ARR Multiple)" type="CALC" unit="€" values={calc.valArrMultiple} highlight />
          <SectionRow title="VALUTAZIONE MEDIA" />
          <DataRow label="VALUTAZIONE MEDIA" type="CALC" unit="€" values={calc.valMedia} highlight />
        </tbody></table>
      );
      default: return renderDashboard();
    }
  };

  const sheets = ['DASHBOARD', 'ASSUMPTIONS', 'RICAVI', 'CONTO_ECONOMICO', 'CASH_FLOW', 'KPI', 'VALUATION'];

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-100">
      <KPIInfoModal />

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Satellite size={28} />
            <div>
              <h1 className="text-lg font-bold">NanoSat IoT Business Plan</h1>
              <p className="text-blue-200 text-xs">Modello Integrato CE/SP/CF</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-800 rounded-lg p-1">
              <button
                onClick={() => switchView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'dashboard' ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-600'}`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button
                onClick={() => switchView('wizard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'wizard' ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-600'}`}
              >
                <Compass size={18} /> Guida
              </button>
            </div>

            {viewMode === 'dashboard' && (
              <div className="flex items-center gap-2 bg-blue-800 rounded p-1">
                {[1, 2, 3].map(id => (
                  <button key={id} onClick={() => loadScenario(id)} className={`px-4 py-1.5 rounded text-sm font-medium transition ${scenarioId === id ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-600'}`}>{SCENARI[id].name}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Tabs */}
      {viewMode === 'dashboard' && (
        <div className="bg-gray-300 border-b border-gray-400 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex">
            {sheets.map(sheet => (
              <button key={sheet} onClick={() => setActiveSheet(sheet)} className={`px-3 py-2 text-xs font-medium border-r border-gray-400 whitespace-nowrap transition ${activeSheet === sheet ? 'bg-white text-blue-800 border-t-2 border-t-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}>{sheet.replace('_', ' ')}</button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4">
        <div className={`transition-opacity duration-150 ${fadeClass}`}>
          {viewMode === 'wizard' ? (
            renderWizard()
          ) : (
            <div className="bg-white rounded shadow overflow-auto max-h-[calc(100vh-180px)]">
              {renderSheet()}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-700 text-white p-2 text-center text-xs">
        <span className="inline-flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border border-yellow-400 rounded"></span> INPUT</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-300 rounded"></span> CALC</span>
          <span>Bilancio quadra: Attivo = Passivo + PN</span>
        </span>
      </footer>
    </div>
  );
}
