# Nasazení na Linux Mint Server

## Příprava

1. **Na Windows (vývoj)**: Zkontrolujte, že aplikace funguje lokálně
   ```bash
   npm run dev
   ```
   Otevřete http://localhost:3000

2. **Přenos souborů na server**:
   ```bash
   # Vytvořte tar archiv (bez node_modules)
   tar -czf noco-view.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .

   # Přeneste na server
   scp noco-view.tar.gz user@server:~/
   ```

## Na Linux Mint Serveru

1. **Rozbalení projektu**:
   ```bash
   cd ~/Docker
   mkdir -p noco-view
   cd noco-view
   tar -xzf ~/noco-view.tar.gz
   ```

2. **Nastavení práv**:
   ```bash
   chmod +x deploy.sh
   chmod +x start.sh
   ```

3. **První nasazení**:
   ```bash
   ./deploy.sh
   ```

4. **Ověření**:
   ```bash
   # Zkontrolujte, že kontejner běží
   docker compose ps

   # Zkontrolujte logy
   docker compose logs -f noco-view
   ```

5. **Přístup k aplikaci**:
   - Na serveru: http://localhost:3443
   - Z jiného počítače v síti: http://192.168.50.191:3443 (nahraďte IP adresou serveru)

## Aktualizace aplikace

Jednoduše spusťte deploy script znovu:
```bash
cd ~/Docker/noco-view
./deploy.sh
```

## Řešení problémů

### Aplikace se nespustí

```bash
# Zkontrolujte logy
docker compose logs noco-view

# Restartujte kontejner
docker compose restart noco-view
```

### Port 3443 je obsazený

V souboru `docker-compose.yml` změňte port:
```yaml
ports:
  - "3444:3000"  # Změňte 3443 na jiný port
```

### NocoDB není dostupný

Zkontrolujte, že:
- NocoDB server běží na http://192.168.50.191:33860
- API klíč je správný
- Síťové připojení funguje

```bash
# Test z kontejneru
docker compose exec noco-view wget -O- http://192.168.50.191:33860
```

## Bezpečnost

⚠️ **Důležité**: API klíč je momentálně hardcoded v kódu. Pro produkci zvažte:
- Použití environment proměnných
- Omezení přístupu k aplikaci pomocí firewall
- HTTPS certifikát pro šifrovanou komunikaci

## Užitečné příkazy

```bash
# Zastavit aplikaci
docker compose down

# Spustit aplikaci
docker compose up -d

# Zobrazit logy
docker compose logs -f noco-view

# Restartovat aplikaci
docker compose restart noco-view

# Odstranit kontejner a znovu vytvořit
docker compose down
docker compose up --build -d
```

## Automatický start po restartu serveru

Aplikace se automaticky spustí při restartu serveru díky:
```yaml
restart: unless-stopped
```

## Monitoring

Health check běží každých 30 sekund a kontroluje:
- Dostupnost API endpointu `/api/health`
- Odpověď do 3 sekund
- Až 3 pokusy při selhání

```bash
# Zkontrolovat health status
docker compose ps
```
