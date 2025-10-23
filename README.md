# NocoDB Viewer - Deník nálad

Moderní webová aplikace pro zobrazení deníku nálad z NocoDB, optimalizovaná pro psychiatrické konzultace.

## Funkce

- 📊 **Přehledné karty** - Každý záznam nálady zobrazen na vlastní kartě s plným obsahem
- 🎨 **Barevné rozlišení** - Nálady vizuálně odlišené barvami podle intenzity
- 📅 **Filtrace podle data** - Výběr období (1-12 měsíců, celé období)
- 🔄 **Automatické řazení** - Nejnovější záznamy nahoře
- 🇨🇿 **Česky** - Kompletní lokalizace do češtiny
- 🖨️ **Připraveno pro tisk** - (PDF export bude přidán později)

## Technologie

- **Next.js 14** - React framework
- **TypeScript** - Typová bezpečnost
- **Tailwind CSS** - Moderní styling s fialovými akcenty
- **NocoDB API** - Zdroj dat
- **Docker** - Snadné nasazení

## Vývoj (Windows)

```bash
# Instalace závislostí
npm install

# Spuštění dev serveru
npm run dev
```

Aplikace bude dostupná na http://localhost:3000

## Nasazení (Linux Mint Server)

```bash
# Přenos souborů na server
scp -r . user@server:~/Docker/noco-view/

# Na serveru
cd ~/Docker/noco-view
chmod +x deploy.sh start.sh
./deploy.sh
```

Aplikace bude dostupná na http://server:3443

## Konfigurace

- **NocoDB Server**: `http://192.168.50.191:33860`
- **Tabulka ID**: `mvj3iz12lui2i2h`
- **API Key**: Uložen v `src/app/api/mood/route.ts`
- **Port**: `3443` (nastaveno v `docker-compose.yml`)

## Struktura projektu

```
noco-view/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── mood/route.ts    # NocoDB API integration
│   │   │   └── health/route.ts  # Health check endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Hlavní stránka
│   │   └── globals.css
│   ├── components/
│   │   └── MoodCard.tsx         # Karta pro zobrazení záznamu
│   └── types/
│       └── mood.ts              # TypeScript typy
├── docker-compose.yml
├── Dockerfile
├── deploy.sh                    # Deployment script
└── package.json
```

## Plánované funkce

- [ ] PDF export v landscape formátu A4
- [ ] Tisk optimalizace
- [ ] Vlastní rozsah dat (date picker)
- [ ] Pokročilé filtry (podle nálady, příznaků)
- [ ] Grafické trendy

## Poznámky

- Aplikace je optimalizována pro 16:9 displeje
- Data se načítají přímo z NocoDB serveru
- Žádná lokální databáze není potřeba
- Všechny texty jsou v češtině
