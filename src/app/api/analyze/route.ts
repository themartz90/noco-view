import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { entries } = await request.json();

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No data provided for analysis' },
        { status: 400 }
      );
    }

    // Determine period
    const dates = entries.map((e: any) => e.date).sort();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    const totalDays = entries.length;

    // Build the clinical prompt (Opus Strategy - BP II Specialized)
    const systemPrompt = `Jsi psychiatrický asistent specializovaný na bipolární poruchu II.
Analyzuj následující data z deníku nálad a vytvoř KLINICKY RELEVANTNÍ souhrn pro psychiatra.

KONTEXT PACIENTA:
- Diagnóza: Bipolární porucha II
- Komorbidity: Psoriatická artritida, senzorická hypersenzitivita
- Hlavní problémy: Sociální interakce, přetížení, smíšené stavy

Období: ${startDate}–${endDate}

Vstup dostaneš jako JSON pole denních záznamů se schématem (CZE):
- date (YYYY-MM-DD)
- mood_num (−3..+3), mood_label (text)
- energy {Nízká|Střední|Vysoká}
- fatigue {Mírná|Střední|Silná}
- sleep_hours (float), sleep_quality {Špatný|Průměrný|Dobrý}
- stress_1_5 (int)
- overload_0_3 (int)
- hypo_symptoms [text], dep_symptoms [text]
- trigger (text)
- helped (text)
- note (text)

VYTVOŘ ANALÝZU V TOMTO FORMÁTU:

1. KRITICKÉ UPOZORNĚNÍ (max 4 položky)
   - Pouze klinicky významné nálezy
   - Kvantifikované (% dní, počty)
   - Specifické pro BP II (smíšené stavy, rapid cycling)
   - S prioritou: "high" | "medium" | "info"

2. VZORCE SMÍŠENÝCH STAVŮ
   - Frekvence souběžných hypomanických + depresivních příznaků (% dní)
   - Nejčastější kombinace příznaků (top 3)
   - Příklad: "Zrychlené myšlení + Silná únava (38×)"

3. HLAVNÍ SPOUŠTĚČE (top 5)
   - Název spouštěče
   - Frekvence výskytu
   - Impact score (1-10) - jak moc to ovlivňuje náladu/stav
   - Průměrná změna nálady (např. -1.2)
   - Změna stresu (např. +0.8)
   - Časový rámec dopadu: "24h" | "48h" | "72h"
   - Typické příklady z dat

4. CO POMÁHÁ
   - Seřazeno podle frekvence použití
   - Pouze položky s pozitivní korelací

Extraktivní pravidla (pro text „trigger" a „note"):
- Detekuj události/kontexty a normalizuj je do kategorií (může jich být více v jednom dni):
  { "návštěva_lékaře", "sociální_interakce", "pracovní_zátěž",
    "fyzická_zátěž/bolest", "spánkový_deficit", "konflikt/stresor",
    "cestování/změna_rutiny", "nemoc/somatika", "lékový_režim/ADL_změna",
    "počasí/teplo", "jiné" }
- Příklady klíčových frází:
  - návštěva_lékaře: "doktor", "psychiatr", "praktik", "kontrola", "vyšetření"
  - sociální_interakce: "návštěva", "schůzka", "rodina", "kamarád", "crowd", "nákupy"
  - fyzická_zátěž/bolest: "bolest", "psoriatická artritida", "unava po zátěži", "cvičení"
  - spánkový_deficit: "málo spánku", "<5 h", "nespal", "ponocování"
  - konflikt/stresor: "hádka", "stres", "deadline", "přetížení"
  - cestování/změna_rutiny: "cesta", "řízení", "mimo domov", "změna režimu"
  - nemoc/somatika: "nachlazení", "zánět", "horečka", "zhoršené trávení"
  - lékový_režim/ADL_změna: "změna dávky", "vynechání", "nový lék", "NLPZ"
  - počasí/teplo: "vedro", "tlak", "fronta"
- Neomezuj se jen na klíčová slova – ber v potaz význam (synonyma, kontext).
- V části „co pomohlo" normalizuj intervence: {"KBT/techniky", "odpočinek", "spánek/nižší stimuly", "procházka/pohyb", "sociální opora", "organizace/plán", "meditace/dýchání", "farmako-adherence (bez doporučení)"}

Analýza časových vzorců (heuristiky, bez tvrdé kauzality):
- Clustery nálady: hypománie = mood_num ≥ +2 po ≥2 dnech; deprese = mood_num ≤ −2 po ≥3 dnech.
- Smíšené rysy: ve stejný den přítomny alespoň 1 hypomanický a 1 depresivní příznak NEBO skok nálady ≤−1 → ≥+1 (či opačně) v rámci 48 h.
- Spánek odlehlý: <5 h nebo >9–10 h.
- Vysoký stres: 4–5/5. Přetížení významné: overload ≥2.
- Pro každou z detekovaných událostí (např. „návštěva_lékaře", „sociální_interakce"):
  * spočti, kolikrát se vyskytla v období,
  * a zda v průměru do 24–72 h po události dochází k posunu nálady (Δmood) nebo nárůstu stresu/přetížení; uveď to jako orientační trend (např. „často následoval pokles o ~0.6 v 48 h").
  * pokud nejsou data dostatečná, uveď „trend nejednoznačný".

Bezpečnost a tón:
- Piš stručně, česky, klinicky; nepřidávej metodiku ani interní úvahy.
- Neuváděj léčebná doporučení ani změny farmakoterapie.
- Pokud něco chybí, explicitně napiš „chybějící data" u dané metriky.

Formát výstupu:
- Vrať strukturovaný JSON dle schématu níže.
- Drž se přesně daných klíčů a pořadí v šabloně.

DŮLEŽITÉ:
- Nepoužívej generické fráze
- Vše kvantifikuj
- Zaměř se na BP II specifika (smíšené stavy, rapid cycling)
- Zohledni somatické komorbidity

JSON schéma (dodržuj PŘESNĚ tuto strukturu):
{
  "period": {
    "from": "YYYY-MM-DD",
    "to": "YYYY-MM-DD",
    "coverage_days": 0,
    "total_days": 0
  },
  "critical_warnings": [
    {
      "priority": "high|medium|info",
      "title": "Smíšené stavy",
      "description": "45% dní (41 z 90) - hypomanické + depresivní příznaky současně",
      "metric": "45% dní"
    }
  ],
  "mixed_states": {
    "frequency_percent": 45,
    "days_count": 41,
    "total_days": 90,
    "top_combinations": [
      {
        "combination": "Zrychlené myšlení + Silná únava",
        "count": 38
      },
      {
        "combination": "Klepání nohou + Úzkost",
        "count": 52
      },
      {
        "combination": "Přehrávání scénářů + Apatie",
        "count": 35
      }
    ]
  },
  "triggers": [
    {
      "name": "Sociální interakce",
      "icon": "🏥",
      "frequency": 20,
      "impact_score": 8,
      "mood_change": -1.2,
      "stress_change": 0.8,
      "timeframe": "48h",
      "examples": ["návštěva lékaře", "optika", "jednání s lidmi"]
    }
  ],
  "helped_top": [
    {
      "label": "KBT techniky",
      "count": 60
    }
  ],
  "metrics": {
    "mood": { "avg": 0, "min": 0, "max": 0, "days_ge_+2": 0, "days_le_-2": 0, "longest_streak_nonzero": 0 },
    "sleep": { "avg_h": 0, "outliers_lt5": 0, "outliers_gt9_10": 0, "quality_mode": "Průměrný" },
    "stress": { "avg_1_5": 0, "days_ge4": 0 },
    "overload": { "avg_0_3": 0 }
  },
  "symptoms": {
    "hypomanic_top": [{"label": "…", "count": 0}],
    "depressive_top": [{"label": "…", "count": 0}]
  }
}`;

    const userPrompt = `Zde jsou data za období ${startDate} až ${endDate} (${totalDays} záznamů za poslední 3 měsíce):

${JSON.stringify(entries, null, 2)}

Proveď analýzu a vrať výsledek ve formátu JSON.`;

    // Call GPT-4.1-mini (best balance of quality, speed, and cost)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    // Log the full response for debugging
    console.log('OpenAI Response:', JSON.stringify(completion, null, 2));

    const message = completion.choices[0]?.message;
    if (!message) {
      throw new Error('No message in OpenAI response');
    }

    const result = message.content;

    if (!result) {
      console.error('Full message object:', message);
      throw new Error('No content in OpenAI response. Check server logs for details.');
    }

    const analysisData = JSON.parse(result);

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
      },
    });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate analysis',
        details: error.message
      },
      { status: 500 }
    );
  }
}
