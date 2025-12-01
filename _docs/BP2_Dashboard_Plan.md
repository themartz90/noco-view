# Plán projektu: BP II Klinický Dashboard
## Pro psychiatrickou konzultaci

---

## 1. Analýza současného stavu

### Co funguje dobře:
- **Graf vývoje nálady** - přehledná vizualizace trendu v čase, interaktivní body
- **Barevné kódování** - červená pro depresi, modrá pro hypománii
- **Základní metriky** v horní části (průměrný stav, průměrná nálada, dny s přetížením, stres, spánek)
- **Filtrování období** - možnost výběru časového rozsahu

### Hlavní problémy k řešení:

1. **Záznamy jsou příliš vysoké** → Těžko vidět průběh a vzorce za sebou
2. **AI analýza je nepřehledná** → Data od jednoho k druhému, chybí hierarchie důležitosti
3. **Události a vzorce nejsou dostatečně prominentní** → To nejdůležitější pro psychiatra je schované
4. **Chybí důraz na specifické vzorce BP II** → Smíšené stavy, rapid cycling, korelace fyzické/psychické zdraví
5. **Red flags a body k diskuzi jsou generické** → Nejsou personalizované na konkrétní problematiku

---

## 2. Datová struktura (z NocoDB)

### Dostupná pole:
```
Datum                    - YYYY-MM-DD
Dominantní nálada       - Škála -3 až +3 s popisem
Energie                  - Nízká / Střední / Vysoká  
Únava                    - Nízká / Střední / Silná
Spánek (délka)          - Počet hodin (number)
Spánek                   - Kvalita: Špatný / Průměrný / Dobrý
Stres (1-5)             - Numerická škála 1-5
Přetížení               - 0-3 s textovým popisem
Hypomanické příznaky    - Multi-select (čárkou oddělené)
Depresivní příznaky     - Multi-select (čárkou oddělené)
Výrazný spouštěč dne    - Volný text
Co pomohlo?             - Volný text  
Poznámka                - Volný text
```

### Klíčové vzorce identifikované v datech:

1. **Smíšené stavy** - Velmi časté: hypomanické i depresivní příznaky současně
2. **Sociální interakce jako hlavní trigger** - Návštěvy lékařů, optika, interakce s lidmi
3. **Fyzické zdraví → psychický dopad** - Artritida, virózy, závratě silně ovlivňují náladu
4. **Senzorické přetížení** - Citlivost na zvuky, ruch, pohyb
5. **Přehrávání scénářů** - Obsedantní přemýšlení o sociálních interakcích
6. **KBT jako primární coping** - Vysoká frekvence použití

---

## 3. Navrhovaná architektura nového dashboardu

### Hlavní sekce (v pořadí priority pro psychiatra):

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Období + Rychlý status + Filtry                        │
├─────────────────────────────────────────────────────────────────┤
│  SEKCE 1: Klinický přehled (Executive Summary)                  │
│  - Hlavní graf nálady                                           │
│  - 4-5 klíčových metrik v kompaktní formě                       │
├─────────────────────────────────────────────────────────────────┤
│  SEKCE 2: Kritické vzorce a upozornění (Red Flags First)        │
│  - Vizuálně výrazné, okamžitě viditelné                        │
├─────────────────────────────────────────────────────────────────┤
│  SEKCE 3: Spouštěče a jejich dopad                              │
│  - Kvantifikované, s korelacemi                                 │
├─────────────────────────────────────────────────────────────────┤
│  SEKCE 4: Timeline záznamů (kompaktní)                          │
│  - Horizontální nebo ultra-kompaktní vertikální                 │
├─────────────────────────────────────────────────────────────────┤
│  SEKCE 5: Body k diskuzi (AI-generated)                         │
│  - Konkrétní, akční, prioritizované                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailní specifikace jednotlivých sekcí

### 4.1 Header a navigace

**Komponenty:**
- Logo/název: "Deník nálad - Bipolární porucha II"
- Zobrazené období: např. "2. 9. 2025 – 30. 11. 2025 (90 dní)"
- Rychlý status badge: "Poslední týden: Smíšené stavy" (barevně kódované)
- Tlačítka filtrů: 1M | 2M | 3M | 6M | 1R | Vlastní

**Doporučení:**
- Filtry jako pill buttons (současná implementace je OK)
- Přidat "Poslední kontrola" pro rychlý přehled od minulé návštěvy

---

### 4.2 SEKCE 1: Klinický přehled

#### 4.2.1 Graf vývoje nálady (zachovat s vylepšeními)

**Současný stav:** ✓ Funguje dobře

**Vylepšení:**
- Přidat druhou osu nebo overlay pro **přetížení** (0-3) - tenká čára nebo background shading
- Označit **kritické body**: těžká deprese (-3), silná hypománie (+3) výrazněji
- Přidat **event markers** - malé ikony pro významné spouštěče (návštěva lékaře, nemoc)
- Hover tooltip: kompletní shrnutí dne

**Implementace:**
```
- Primární osa Y: Nálada (-3 až +3)
- Sekundární vizualizace: Přetížení jako background gradient
- Body: Větší pro extrémní hodnoty
- Barevná škála: 
  - Červená gradient: -3 až -1 (deprese)
  - Zelená: 0 (stabilní)
  - Modrá gradient: +1 až +3 (hypománie)
```

#### 4.2.2 Klíčové metriky (kompaktnější)

**Problém současné verze:** Příliš mnoho karet, některé metriky nejsou klinicky relevantní

**Nový návrh - 5 karet v jedné řadě:**

| Metrika | Zobrazení | Klinický význam |
|---------|-----------|-----------------|
| **Dominantní stav** | "Deprese" / "Smíšené" / "Hypománie" + trend šipka | Okamžitý přehled |
| **Stabilita** | "Nízká" + počet změn >2 bodů | Rapid cycling indikátor |
| **Dny v krizi** | Číslo + mini sparkline | -3 nebo +3 hodnoty |
| **Průměrný stres** | Číslo 1-5 + barevný indikátor | Celková zátěž |
| **Spánek** | Průměr hodin + kvalita % | Základní regulátor |

**Vizuální design:**
- Menší karty než současné
- Barevný pruh nahoře indikující stav (zelená = OK, žlutá = pozor, červená = problém)
- Mikro-trend šipka (↑ ↓ →) oproti minulému období

---

### 4.3 SEKCE 2: Kritické vzorce a upozornění

**Toto je NEJDŮLEŽITĚJŠÍ sekce pro psychiatra - musí být prominentní!**

#### 4.3.1 Red Flags Panel

**Design:** Červený/oranžový panel nahoře, vždy viditelný

**Struktura:**
```
🚨 UPOZORNĚNÍ PRO TOTO OBDOBÍ
├── [Vysoká priorita] Smíšené stavy: 45% dní (hypomanické + depresivní příznaky současně)
├── [Vysoká priorita] Sociální interakce: 80% zhoršení do 48h po kontaktu
├── [Střední priorita] Spánkové problémy: 4 dny <5h, 9 dní >9h
└── [Info] Somatické vlivy: 40 dní s fyzickou bolestí/nemocí
```

**Pravidla pro generování (AI prompt instructions):**
1. Maximálně 4-5 položek
2. Seřazeno podle klinické závažnosti
3. Kvantifikované (procenta, počty dní)
4. Specifické pro BP II (ne generické)

#### 4.3.2 Smíšené stavy - speciální vizualizace

**Proč:** Toto je klíčový marker BP II a je to ve tvých datech velmi časté

**Komponenta: "Mixed State Detector"**
```
┌─────────────────────────────────────────────┐
│  SMÍŠENÉ STAVY                              │
│  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  45% dní (41 z 90)   │
│                                             │
│  Nejčastější kombinace:                     │
│  • Zrychlené myšlení + Silná únava (38×)    │
│  • Klepání nohou + Úzkost (52×)             │
│  • Přehrávání scénářů + Apatie (35×)        │
└─────────────────────────────────────────────┘
```

---

### 4.4 SEKCE 3: Spouštěče a jejich dopad

**Problém současné verze:** "Události a vzorce" jsou sice informativní, ale:
- Příliš mnoho položek
- Chybí vizuální hierarchie
- Trend "nejednoznačné" není užitečný

**Nový návrh:**

#### 4.4.1 Hlavní spouštěče (Top 5, vizuálně dominantní)

**Layout:** Horizontální karty s impact meter

```
┌────────────────────────────────────────────────────────────────┐
│  HLAVNÍ SPOUŠTĚČE                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🏥 SOCIÁLNÍ INTERAKCE                          Dopad: ████████░░ 8/10
│     20× za období | Průměrný pokles nálady: -1.2 do 48h        │
│     Typické: návštěva lékaře, optika, jednání s lidmi          │
│                                                                │
│  🤕 FYZICKÁ BOLEST / NEMOC                      Dopad: ███████░░░ 7/10
│     60× za období | Zvýšení stresu: +0.8 do 24h                │
│     Typické: artritida, viróza, závratě                        │
│                                                                │
│  😴 SPÁNKOVÝ DEFICIT                            Dopad: ██████░░░░ 6/10
│     13× za období | Zvýšení přetížení: +0.5 do 48h             │
│     Typické: <5h spánku, problémy s usínáním                   │
│                                                                │
│  🔊 SENZORICKÉ PŘETÍŽENÍ                        Dopad: ██████░░░░ 6/10
│     38× za období | Nutnost izolace                            │
│     Typické: ruch, zvuky, veřejná místa                        │
│                                                                │
│  💭 RUMINACE / PŘEHRÁVÁNÍ                       Dopad: █████░░░░░ 5/10
│     Přítomno 75% dní | Spojeno s úzkostí                       │
│     Typické: sociální scénáře, budoucnost                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### 4.4.2 Co pomáhá (důležité pro léčebný plán)

**Kompaktní zobrazení:**
```
✓ CO POMÁHÁ
  KBT techniky (60×) | Odpočinek (40×) | Izolace/ticho (25×) | Spánek (15×)
```

---

### 4.5 SEKCE 4: Timeline záznamů (KLÍČOVÁ ZMĚNA)

**Hlavní problém:** Současné záznamy jsou příliš vysoké → nelze vidět vzorce

#### Návrh A: Ultra-kompaktní vertikální timeline (DOPORUČENO)

**Koncept:** Každý den = 1 řádek, všechny klíčové info na první pohled

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZÁZNAMY                                                    ▼ Rozbalit vše  │
├─────────────────────────────────────────────────────────────────────────────┤
│  DATUM      NÁLADA  PŘETÍŽ  SPÁNEK  STRES  KLÍČOVÉ                    VÍCE │
├─────────────────────────────────────────────────────────────────────────────┤
│  30.11 Ne   ●-2     ███     7h ◐    ④     Nervozita, stres z maličkostí  › │
│  29.11 So   ●+1     █       6h ◐    ②     Artritida, utlumení hypománie  › │
│  28.11 Pá   ●+2     ░       7h ◐    ②     Artritida, silná únava         › │
│  27.11 Čt   ●-2     █       5h ○    ④     Viróza, úzkost, optika ⚠       › │
│  26.11 St   ●-2     █       6h ○    ④     Viróza, přehrávání scénářů     › │
│  ...                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

LEGENDA:
Nálada: ●-3 až ●+3 (barevně: červená→zelená→modrá)
Přetížení: ░ = 0, █ = 1, ██ = 2, ███ = 3
Spánek: ○ = špatný, ◐ = průměrný, ● = dobrý
Stres: ①②③④⑤ (v kruhu)
⚠ = Významná událost / interakce
```

**Výhody:**
- Vidíš 15-20 dní najednou bez scrollování
- Vzorce jsou okamžitě patrné (série červených teček = depresivní epizoda)
- Rychlé skenování očima

**Po kliknutí na řádek:** Rozbalení s plnými detaily (jako současná verze)

#### Návrh B: Horizontální timeline (alternativa)

```
                    ZÁŘÍ                      ŘÍJEN                    LISTOPAD
         1  5  10  15  20  25  30  |  5  10  15  20  25  30  |  5  10  15  20  25  30
Nálada   ●● ●●●○○●●●●●●○○○●●●●●●|●●●○○○○●●●●●●●●●●○○○○○○●|●●●●●●●●●●●●○○○●●●●●●●●●
Přetíž   ▁▁▂▂▃▃▂▁▁▁▂▂▃▃▂▁▁▁▂▂▃▃|▂▁▁▁▂▂▃▃▂▁▁▁▂▂▃▃▂▁▁▁▂▂▃|▃▂▁▁▁▂▂▃▃▂▁▁▁▂▂▃▃▂▁▁▁▂
Spánek   ████░░████████░░████████|████░░████████░░████████|████░░████████░░████████
```

**Poznámka:** Horizontální je vhodnější pro delší období (6M, 1R), vertikální pro kratší

---

### 4.6 SEKCE 5: Body k diskuzi (AI generované)

**Problém současné verze:** Příliš generické, nejsou akční

**Nový formát:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 BODY K DISKUZI NA KONTROLE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. MEDIKACE                                               [!]  │
│     Zvážit úpravu vzhledem k přetrvávajícím smíšeným stavům    │
│     (45% dní) a častému rapid cyclingu (6 změn >2 body/týden)  │
│                                                                 │
│  2. SOCIÁLNÍ EXPOZICE                                      [?]  │
│     Interakce konzistentně zhoršují stav o 1-2 body            │
│     → Diskutovat strategii pro nutné návštěvy lékařů           │
│                                                                 │
│  3. SOMATIKA ↔ PSYCHIKA                                    [i]  │
│     Silná korelace artritida/viróza → depresivní epizody       │
│     → Koordinace s revmatologem?                               │
│                                                                 │
│  4. KBT EFEKTIVITA                                         [+]  │
│     Časté používání (60×), pomáhá zejména před spaním          │
│     → Zvážit rozšíření technik pro sociální situace            │
│                                                                 │
│  5. SPÁNEK                                                 [!]  │
│     Variabilita 4-16h, problémy s usínáním při hypománii       │
│     → Spánková hygiena / případná medikace?                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

[!] = Prioritní k řešení
[?] = K diskuzi
[i] = Informativní
[+] = Pozitivní/funguje
```

---

## 5. AI Analýza - Prompt Engineering

### 5.1 Struktura promptu pro GPT-4

```markdown
Jsi psychiatrický asistent specializovaný na bipolární poruchu II. 
Analyzuj následující data z deníku nálad a vytvoř KLINICKY RELEVANTNÍ souhrn.

KONTEXT PACIENTA:
- Diagnóza: Bipolární porucha II
- Komorbidity: Psoriatická artritida, senzorická hypersenzitivita
- Hlavní problémy: Sociální interakce, přetížení, smíšené stavy

DATA:
[JSON záznamy]

VYTVOŘ ANALÝZU V TOMTO FORMÁTU:

1. KRITICKÉ UPOZORNĚNÍ (max 4 položky)
   - Pouze klinicky významné nálezy
   - Kvantifikované (% dní, počty)
   - Specifické pro BP II

2. VZORCE SMÍŠENÝCH STAVŮ
   - Frekvence souběžných hypomanických + depresivních příznaků
   - Nejčastější kombinace

3. HLAVNÍ SPOUŠTĚČE (top 5)
   - Název spouštěče
   - Frekvence výskytu
   - Kvantifikovaný dopad na náladu/stres/přetížení
   - Časový rámec dopadu (24h, 48h, 72h)

4. CO POMÁHÁ
   - Seřazeno podle frekvence použití
   - Pouze položky s pozitivní korelací

5. BODY K DISKUZI (max 5)
   - Konkrétní, akční
   - S prioritou [!], [?], [i], [+]
   - Relevantní pro farmakoterapii i psychoterapii

DŮLEŽITÉ:
- Nepoužívej generické fráze
- Vše kvantifikuj
- Zaměř se na BP II specifika (smíšené stavy, rapid cycling)
- Zohledni somatické komorbidity
```

### 5.2 Doporučení pro implementaci

1. **Caching:** Zachovat současný systém cache s možností "Znovu analyzovat"
2. **Token limit:** Použít sumarizaci dat před odesláním (ne raw CSV)
3. **Fallback:** Pokud AI selže, zobrazit základní statistiky z dat
4. **Progresivní loading:** Zobrazit sekce postupně jak jsou generovány

---

## 6. Technická specifikace

### 6.1 Doporučený tech stack

```
Framework:     Next.js 14+ (App Router)
Styling:       Tailwind CSS
Grafy:         Recharts nebo Chart.js
AI:            OpenAI API (GPT-4.1 Mini - současné) nebo Claude API
State:         React Query pro data fetching
Database:      NocoDB API (současné)
```

### 6.2 Komponenty k vytvoření

```
/components
├── layout/
│   ├── Header.tsx              # Název, období, filtry
│   └── Navigation.tsx          # Přepínání sekcí (pokud tabs)
├── overview/
│   ├── MoodChart.tsx           # Hlavní graf (vylepšený)
│   ├── MetricCard.tsx          # Jednotlivá metrika
│   └── MetricsRow.tsx          # Řada 5 metrik
├── analysis/
│   ├── RedFlagsPanel.tsx       # Kritická upozornění
│   ├── MixedStateIndicator.tsx # Smíšené stavy vizualizace
│   ├── TriggerCard.tsx         # Jednotlivý spouštěč
│   └── TriggersSection.tsx     # Sekce spouštěčů
├── records/
│   ├── CompactTimeline.tsx     # Ultra-kompaktní seznam
│   ├── RecordRow.tsx           # Jeden řádek záznamu
│   └── RecordDetail.tsx        # Rozbalený detail
├── discussion/
│   └── DiscussionPoints.tsx    # Body k diskuzi
└── common/
    ├── MoodBadge.tsx           # Barevný badge nálady
    ├── OverloadMeter.tsx       # Vizualizace přetížení
    └── TrendArrow.tsx          # Šipka trendu
```

### 6.3 Datové typy (TypeScript)

```typescript
interface MoodRecord {
  date: string;                    // ISO date
  mood: number;                    // -3 to +3
  moodLabel: string;               // Textový popis
  energy: 'Nízká' | 'Střední' | 'Vysoká';
  fatigue: 'Nízká' | 'Střední' | 'Silná';
  sleepHours: number;
  sleepQuality: 'Špatný' | 'Průměrný' | 'Dobrý';
  stress: number;                  // 1-5
  overload: number;                // 0-3
  overloadLabel: string;
  hypomanicSymptoms: string[];
  depressiveSymptoms: string[];
  trigger: string | null;
  whatHelped: string | null;
  note: string | null;
}

interface AnalysisSummary {
  redFlags: RedFlag[];
  mixedStates: MixedStateAnalysis;
  triggers: TriggerAnalysis[];
  whatHelps: string[];
  discussionPoints: DiscussionPoint[];
}

interface RedFlag {
  priority: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  metric: string;              // např. "45% dní"
}

interface TriggerAnalysis {
  name: string;
  icon: string;
  frequency: number;
  impactScore: number;         // 1-10
  moodChange: number;          // průměrná změna
  stressChange: number;
  timeframe: string;           // "24h", "48h", "72h"
  examples: string[];
}

interface DiscussionPoint {
  priority: '!' | '?' | 'i' | '+';
  topic: string;
  detail: string;
}
```

---

## 7. Layout a responsivita

### 7.1 Desktop layout (primární)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER (fixed)                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  GRAF NÁLADY (50% výšky viewportu)                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│  │Metric│ │Metric│ │Metric│ │Metric│ │Metric│  ← 5 karet v řadě        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  RED FLAGS (collapsible, default expanded)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────┐ ┌─────────────────────────────────┐   │
│  │  SPOUŠTĚČE (2/3)            │ │  CO POMÁHÁ (1/3)                │   │
│  └─────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  TIMELINE ZÁZNAMŮ (scrollable, compact)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  BODY K DISKUZI                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Print layout (pro tisk / PDF)

- Vynechat interaktivní prvky
- Rozbalit všechny sekce
- Jednodušší barvy (tisk-friendly)
- Záhlaví: "Deník nálad - [Jméno] - [Období]"

---

## 8. Barevná paleta (návrh)

```css
/* Nálada */
--mood-severe-depression: #DC2626;   /* -3 */
--mood-depression: #F87171;          /* -2 */
--mood-mild-depression: #FCA5A5;     /* -1 */
--mood-stable: #22C55E;              /* 0 */
--mood-mild-hypomania: #93C5FD;      /* +1 */
--mood-hypomania: #3B82F6;           /* +2 */
--mood-severe-hypomania: #1D4ED8;    /* +3 */

/* Přetížení */
--overload-none: #E5E7EB;
--overload-mild: #FEF3C7;
--overload-moderate: #FED7AA;
--overload-severe: #FECACA;

/* Priority */
--priority-high: #DC2626;
--priority-medium: #F59E0B;
--priority-info: #3B82F6;
--priority-positive: #22C55E;

/* UI */
--background: #F9FAFB;
--card: #FFFFFF;
--border: #E5E7EB;
--text-primary: #111827;
--text-secondary: #6B7280;
```

---

## 9. Implementační plán (fáze)

### Fáze 1: Základ (1-2 dny)
- [ ] Nový Next.js projekt
- [ ] NocoDB API integrace
- [ ] Základní layout a routing
- [ ] Data fetching a parsing

### Fáze 2: Vizualizace (2-3 dny)
- [ ] Vylepšený graf nálady
- [ ] Kompaktní metriky
- [ ] Ultra-kompaktní timeline záznamů

### Fáze 3: AI Analýza (1-2 dny)
- [ ] Nový prompt pro GPT
- [ ] Red flags panel
- [ ] Spouštěče vizualizace
- [ ] Body k diskuzi

### Fáze 4: Polish (1 den)
- [ ] Responsivita
- [ ] Loading states
- [ ] Error handling
- [ ] Print CSS

---

## 10. Přílohy

### A. Ukázka dat pro testování

```json
{
  "date": "2025-11-30",
  "mood": -2,
  "moodLabel": "Smutek, útlum, stažení",
  "energy": "Nízká",
  "fatigue": "Střední",
  "sleepHours": 7,
  "sleepQuality": "Průměrný",
  "stress": 4,
  "overload": 3,
  "overloadLabel": "Silné (musím se izolovat...)",
  "hypomanicSymptoms": [
    "Klepání nohou / tělesný neklid",
    "Zrychlené myšlení nebo jednání",
    "Přehrávání imaginárních scénářů"
  ],
  "depressiveSymptoms": [
    "Tlak na prsou / tíha / uzel v hrudi",
    "Apatie (nezájem o běžné věci)",
    "Úzkost"
  ],
  "trigger": "Nervozita, podráždění, pocit stresu z maličkostí",
  "whatHelped": "KBT, izolace, ticho",
  "note": "Dnes od rána větší podráždění a stres..."
}
```

### B. Příznaky - kompletní seznam pro reference

**Hypomanické:**
- Klepání nohou / tělesný neklid
- Říkanky / zpívání si dokola
- Nutkání k mluvení nahlas i bez kontextu
- Nutkání k impulzivnímu chování
- Zvýšený zájem o sexualitu
- Zrychlené myšlení nebo jednání
- Silné přemýšlení o sociálních interakcích
- Přehrávání imaginárních scénářů
- Sklon k filozofickým nebo grandiózním myšlenkám
- Nespavost bez tělesné únavy
- Příval energie bez důvodu
- Pocit „musím něco dělat teď hned"
- Nadměrné pocení
- Nutkání hledat nové podměty
- Vztek a podráždění nebo výbušnost

**Depresivní:**
- Silná únava bez zjevného důvodu
- Tlak na prsou / tíha / uzel v hrudi
- Apatie (nezájem o běžné věci)
- Smutek bez důvodu
- Bezmoc / pocit zbytečnosti
- Myšlenky na to že to nemá cenu / beznaděj
- Neschopnost se soustředit
- Zpomalené myšlení
- Výpadky paměti / ztráta slov
- Strach z budoucnosti / z vlastního stavu
- Nechuť k činnosti i když je známá a příjemná
- Pocity viny nebo sebekritiky
- Vyhýbání se kontaktu s lidmi
- Úzkost
- Silná úzkost

---

## 11. Závěr

Tento plán vytváří dashboard, který:

1. **Je klinicky zaměřený** - Psychiatr vidí nejdůležitější informace jako první
2. **Zdůrazňuje BP II specifika** - Smíšené stavy, rapid cycling, spouštěče
3. **Je přehledný** - Kompaktní timeline místo vysokých karet
4. **Je personalizovaný** - Reflektuje tvoje konkrétní vzorce (sociální interakce, artritida)
5. **Je akční** - Body k diskuzi jsou konkrétní a prioritizované

Doporučuji začít s Fází 1 a 2 (základ + vizualizace) a až to bude funkční, přidat AI analýzu. Tím získáš rychle funkční nástroj, který můžeš iterativně vylepšovat.

Hodně štěstí s implementací! 🧠
