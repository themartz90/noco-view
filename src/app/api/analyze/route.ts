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

    // Build the clinical prompt
    const systemPrompt = `Jsi klinický psychiatr. Píšeš stručný, datově podložený souhrn pro psychiatra („lékař-pro-lékaře") z období ${startDate}–${endDate} u pacienta s bipolární poruchou II. typu.

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

Cíl:
1) Shrni metriky a časové vzorce (nálada, spánek, stres, přetížení).
2) Vytěž z volného textu (trigger, note, helped) opakovaná témata a „klíčové momenty" a popiš jejich možnou souvislost s vývojem (opatrná formulace, bez kauzálních tvrzení).
3) Identifikuj red flags a navrhni 3–5 stručných bodů k diskuzi na kontrole.

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
- Neuváděj léčebná doporučení ani změny farmakoterapie; v závěru pouze „Body k diskuzi" (neutrální formulace „zvážit/ověřit").
- Pokud něco chybí, explicitně napiš „chybějící data" u dané metriky.

Formát výstupu:
- Vrať strukturovaný JSON dle schématu níže a stručný Markdown souhrn (pro lékaře).
- Drž se přesně daných klíčů a pořadí v šabloně.

Šablona výstupu (Markdown):

**Souhrn období:** {YYYY-MM-DD} – {YYYY-MM-DD} • Pokrytí: {X/Y dní}

## Klíčové metriky
- Nálada (−3..+3): průměr {…}, min/max {…}/{…}; dny ≥+2: {n}; dny ≤−2: {n}; nejdelší streak (mimo 0): {…} dnů
- Spánek: průměr {…} h (odlehlé: <5 h {n} d; >9–10 h {n} d) • kvalita: {nejčastější}
- Stres: průměr {…}/5; dny 4–5/5: {n} • Přetížení (0–3): průměr {…}

## Příznaky a vzorce
- Hypomanické (top): {…} ({počet}), {…} ({počet})
- Depresivní (top): {…} ({počet}), {…} ({počet})
- Smíšené rysy: {ano/ne + 1 věta}

## Události / klíčové momenty a orientační následné trendy
- {kategorie}: {frekvence}× v období • typicky do 24–72 h: {trend (např. pokles nálady o ~0.6; ↑ stres o ~0.7; nejednoznačné)}
- {kategorie}: …

## Co pomohlo (nejčastěji)
- {intervence} ({frekvence}), {intervence} ({frekvence})

## Bezpečnost / Red flags
- {stručné body nebo „Nezachyceno v datech tohoto období."}

## Body k diskuzi na kontrole
1) {max 1 věta}
2) {max 1 věta}
3) {max 1 věta}

JSON schéma:
{
  "period": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD", "coverage_days": 0, "total_days": 0 },
  "metrics": {
    "mood": { "avg": 0, "min": 0, "max": 0, "days_ge_+2": 0, "days_le_-2": 0, "longest_streak_nonzero": 0 },
    "sleep": { "avg_h": 0, "outliers_lt5": 0, "outliers_gt9_10": 0, "quality_mode": "Průměrný" },
    "stress": { "avg_1_5": 0, "days_ge4": 0 },
    "overload": { "avg_0_3": 0 }
  },
  "symptoms": {
    "hypomanic_top": [{"label": "…", "count": 0}],
    "depressive_top": [{"label": "…", "count": 0}],
    "mixed_features": { "present": false, "note": "" }
  },
  "events": [
    { "category": "návštěva_lékaře", "count": 0, "post_24_72h_trend": "nejednoznačné" }
  ],
  "helped_top": [{"label": "KBT/techniky", "count": 0}],
  "red_flags": ["…"],
  "discussion_points": ["…", "…", "…"],
  "markdown_summary": "…"
}`;

    const userPrompt = `Zde jsou data za období ${startDate} až ${endDate} (${totalDays} záznamů za poslední 3 měsíce):

${JSON.stringify(entries, null, 2)}

Proveď analýzu a vrať výsledek ve formátu JSON včetně markdown_summary.`;

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

    // GPT-5 reasoning models may have content in different locations
    const result = message.content || message.text;

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
