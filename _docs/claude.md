# NocoDB Viewer - Development Context

## Project Overview

A Next.js application for viewing bipolar disorder mood diary data from NocoDB, designed specifically for psychiatric consultations. The app emphasizes clarity, scannability, and professional presentation of medical data with comprehensive security features.

**Purpose**: Replace NocoDB's native view with a custom interface optimized for:
- Medical professionals (psychiatrists) viewing data for the first time
- Quick pattern recognition across multiple days
- Statistical overview with KPI cards
- Visual trend analysis with interactive charts
- Detailed information access without overwhelming the viewer
- Secure, authenticated access to sensitive health data

---

## Current Version

**Version**: 1.0.1 (Released 2025-10-25)
- GitHub: https://github.com/themartz90/noco-view
- Latest Commit: `b0b96ad`
- Previous Tag: `v1.0.0` (2025-10-23)

**Status**: Fully operational with Docker networking fixes and AI analysis feature working

---

## Technical Stack

- **Framework**: Next.js 14.2.33 (TypeScript)
- **Styling**: Tailwind CSS 3.3.0 with custom medical teal theme
- **Icons**: Lucide React 0.263.1
- **Date Handling**: date-fns 2.30.0
- **Data Source**: NocoDB API
  - Server: `http://192.168.50.191:33860` (dev) / `http://nocodb:8080` (prod)
  - Table ID (Mood): `mvj3iz12lui2i2h`
  - Table ID (AI Analysis): `m1w6ly4p8iu64s9`
  - API Key: `LehBM_s0bzNbhywtVYr_egxfe4AM3h75yLulZif3`
- **AI Analysis**: OpenAI GPT-4.1-mini (v1.0.1)
  - Model: `gpt-4.1-mini`
  - Temperature: 0.2
  - Max tokens: 8000
  - Response format: JSON with Czech markdown summary
- **Authentication**: Cookie-based passcode (90-day retention)
- **Deployment**: Docker with health checks and automated backups

---

## Key Features Implemented

### ✅ Core Functionality (v1.0.0)

1. **Timeline View with Spine** - Vertical timeline with colored dots for each mood entry
2. **Interactive Mood Chart** - SVG line chart showing mood trends (-3 to +3)
   - Clickable data points that scroll to specific entries
   - Color-coded severity indicators
   - Smooth animations and highlight effects
3. **KPI Summary Cards** - 5 statistical overview cards:
   - Average Mood (numerical)
   - Average State (7-level severity classification)
   - Overload Days Count
   - Average Stress Level
   - Average Sleep Duration
4. **Date Range Filtering** - 1, 2, 3, 6, 12 months, all time
5. **Period Header** - Shows current filter with entry count and jump-to link
6. **Expandable Timeline Entries** - Click entire card to expand/collapse
7. **Czech Language** - All labels and interface in Czech
8. **Logo Integration** - Brain icon in header
9. **AI Clinical Analysis** (v1.0.1) - GPT-4.1-mini powered psychiatric summary:
   - Analyzes last 3 months of mood data
   - Identifies patterns, triggers, and interventions
   - Extracts event categories with post-event mood trends
   - Generates red flags and discussion points for psychiatrist
   - Caches results in NocoDB for cross-device access
   - Czech language clinical report

### 🔒 Security Features (v1.0.0)

1. **Passcode Authentication**
   - Single passcode: `120290`
   - 90-day cookie retention
   - Clean authentication page
   - Middleware protection on all routes
2. **Robots.txt** - Blocks all search engines and AI crawlers:
   - Google, Bing, Yahoo
   - GPTBot, ChatGPT-User, Claude-Web
   - PerplexityBot, FacebookBot, etc.
3. **Security Headers**:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security` (HSTS)
   - `Content-Security-Policy` (CSP)
   - `Permissions-Policy`
   - `Referrer-Policy`
4. **Geo-Restriction** - Cloudflare configured for Czech Republic only

### 💾 Deployment & Operations (v1.0.0)

1. **Automated Backup System**
   - Runs before each deployment
   - 30-day retention policy
   - Volume-based backups
   - Graceful handling of first deploy (no volume yet)
2. **Health Checks**
   - `/api/health` endpoint
   - Docker healthcheck every 30s
   - Deployment verification
3. **Production Optimization**
   - Multi-stage Docker build
   - Standalone output mode
   - Non-root container user
   - Image cleanup on deploy

### 🐳 Docker Networking (v1.0.1 - 2025-10-25)

**CRITICAL**: Docker network configuration to avoid Tailscale VPN conflicts

#### Problem Discovered (2025-10-25)
- Docker was auto-assigning `192.168.0.x` subnet which conflicts with Tailscale VPN on `192.168.0.1`
- Caused "Connection reset by peer" and complete service unavailability
- Application would start but refuse all HTTP connections

#### Solution Implemented
1. **Custom Bridge Network** in `docker-compose.yml`:
   ```yaml
   networks:
     noco-view-network:
       driver: bridge
       ipam:
         config:
           - subnet: 172.35.0.0/16
             gateway: 172.35.0.1
     overseerr-net:
       external: true  # Shared network with NocoDB container
   ```

2. **Dual Network Attachment**:
   - `noco-view-network`: Custom network to avoid Tailscale conflicts
   - `overseerr-net`: External network to connect with NocoDB container

3. **Container-to-Container Communication**:
   - NocoDB runs in `overseerr-net` Docker network
   - API routes use container hostname in production: `http://nocodb:8080`
   - Falls back to LAN IP for local development: `http://192.168.50.191:33860`

#### Files Updated for Network Connectivity
- `docker-compose.yml`: Network configuration + `extra_hosts` for host gateway
- `src/app/api/mood/route.ts`: Dynamic NOCODB_URL based on environment
- `src/app/api/ai-analysis/route.ts`: Dynamic NOCODB_URL based on environment

#### Docker Daemon Configuration (Server)
**Prevent future subnet conflicts** by configuring default address pools:

Location: `/etc/docker/daemon.json`
```json
{
  "hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"],
  "default-address-pools": [
    {
      "base": "172.16.0.0/12",
      "size": 24
    },
    {
      "base": "10.10.0.0/16",
      "size": 24
    }
  ]
}
```

**Apply**: `sudo systemctl restart docker`

This ensures Docker only uses `172.16.x.x` and `10.10.x.x` ranges, avoiding:
- `192.168.0.x` (Tailscale VPN)
- `192.168.1.x` (Common home routers)
- `192.168.50.x` (Local LAN)

#### Environment Variables Fix
**Problem**: OPENAI_API_KEY not loading from docker-compose environment
**Solution**: Use `env_file` directive in `docker-compose.yml`:
```yaml
services:
  noco-view:
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - AUTH_PASSCODE=120290
```

#### Verification Commands
```bash
# Check container networks
docker inspect noco-view | grep -A 20 '"Networks"'

# Test NocoDB connectivity from container
docker exec noco-view wget -T 2 -O- http://nocodb:8080/api/v2

# Test API endpoints
curl http://localhost:3448/api/health
curl http://localhost:3448/api/mood | head -c 200
curl "http://localhost:3448/api/ai-analysis?period_key=test"
```

---

## UI/UX Design

### Color Theme: Medical Teal

**Primary Color** (Teal/Cyan - Professional medical aesthetic):
- `primary-50`: #ecfeff (lightest)
- `primary-600`: #0891b2 (main accent)
- `primary-700`: #0e7490 (darker)

**Rationale**: Teal/cyan chosen for:
- Medical/clinical association
- Calming, professional appearance
- No conflicts with mood indicators (red/blue)
- Better suited for psychiatric context than purple

### Layout Structure

1. **Main Header** (always visible)
   - Logo + "Deník nálad" title
   - Subtitle: "Bipolární porucha - Přehled záznamů"

2. **Period Header** (when data loaded)
   - "Zobrazeno období: {range}"
   - Entry count as subtitle
   - "Zobrazit záznamy" button (jumps to entries)

3. **Filter Bar**
   - Date range buttons with calendar icons
   - Active filter highlighted in teal

4. **KPI Summary**
   - 5 cards in responsive grid
   - Color-coded severity badges
   - Helpful icons for each metric

5. **Mood Chart**
   - SVG line chart with gradient fill
   - Legend explaining colors
   - **Clickable points** - jump to entry with highlight
   - Only highlights severe cases (-3, +3) and stable (0)

6. **Timeline Entries**
   - Vertical spine with colored dots
   - Zebra striping (alternating backgrounds)
   - Clickable entire card for expand/collapse
   - Each entry has `id="entry-{date}"` for anchor links

### Visual Hierarchy

**Dominant Elements**:
- Large mood pill with score (-3 to +3)
- Timeline dots (color-coded by mood)
- KPI card values

**Supporting Elements**:
- Small metrics (Energy, Fatigue, Stress)
- Chart legend
- Entry dates

**Progressive Disclosure**:
- KPI summary always visible
- Chart always visible
- Entry details on click

### Color Coding

**Mood States**:
- **Depression** (red shades):
  - `-3` = Dark red (severe depression)
  - `-2` = Medium red (depression)
  - `-1` = Light red (mild depression)
- **Hypomania** (blue shades):
  - `+3` = Dark blue (severe hypomania)
  - `+2` = Medium blue (hypomania)
  - `+1` = Light blue (mild hypomania)
- **Stable**: Green (0)

**Timeline Dots**:
- Severe states (-3, +3): Larger with pulse ring
- Stable (0): Green, medium size
- Other states: Smaller, subtle

---

## Component Architecture

### New Components (v1.0.0)

**KpiSummary.tsx**
```typescript
// 5 statistical cards showing:
// - Average mood (numerical with trend color)
// - Average state (7-level severity: těžká deprese → jasná hypománie)
// - Overload days (count of days with overload)
// - Average stress (1-5 scale)
// - Average sleep (hours)
```

**MoodChart.tsx**
```typescript
// SVG line chart features:
// - Line path with gradient area fill
// - Clickable data points with enlarged hit areas
// - scrollToEntry() function with 2-second highlight
// - X-axis: dates, Y-axis: mood scale (-3 to +3)
// - Responsive sizing with minimum width
```

**TimelineEntry.tsx** (updated)
```typescript
// Enhanced with:
// - Timeline dot visualization (left of card)
// - Entire card clickable (not just header)
// - Anchor ID for scroll-to functionality
// - Fixed Přetížení parser for "0 - Žádné" format
```

### Page Layout (page.tsx)

```typescript
<div className="min-h-screen bg-gray-50">
  <Header /> {/* With logo */}
  <PeriodHeader /> {/* Conditional, when data loaded */}
  <Filters /> {/* Date range selector */}
  <KpiSummary entries={filteredEntries} />
  <MoodChart entries={filteredEntries} />
  <TimelineEntries /> {/* With vertical spine */}
  <Footer />
</div>
```

---

## File Structure (Updated)

```
noco-view/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts          # Authentication endpoint
│   │   │   ├── mood/route.ts          # NocoDB API integration
│   │   │   └── health/route.ts        # Health check endpoint
│   │   ├── auth/
│   │   │   └── page.tsx               # Login page (passcode)
│   │   ├── layout.tsx                 # Root layout (Czech lang)
│   │   ├── page.tsx                   # Main page with all sections
│   │   └── globals.css                # Global styles
│   ├── components/
│   │   ├── KpiSummary.tsx             # 5 statistical cards
│   │   ├── MoodChart.tsx              # SVG line chart
│   │   ├── TimelineEntry.tsx          # Timeline row with dot
│   │   └── MoodCard.tsx               # (unused - old version)
│   ├── types/
│   │   └── mood.ts                    # TypeScript interfaces
│   └── middleware.ts                  # Auth middleware
├── public/
│   ├── logo.png                       # Brain icon
│   ├── favicon.ico                    # Site icon
│   └── robots.txt                     # Crawler blocking
├── _docs/
│   ├── NocoDB Viewer+.md              # Original requirements
│   └── claude.md                      # This context file
├── _files/
│   ├── gpt_template.html              # GPT UI mockup
│   ├── claude_template.html           # Claude UI mockup
│   └── gemini_template.html           # Gemini UI mockup
├── .env.example                       # Environment template
├── .env                               # Local environment (not in git)
├── backup.sh                          # Backup script (30-day retention)
├── deploy.sh                          # Deployment script (with backup)
├── docker-compose.yml                 # Docker config (port 3448)
├── Dockerfile                         # Multi-stage production build
├── healthcheck.js                     # Health check script
├── start.sh                           # Container startup script
├── next.config.js                     # Next.js config with security headers
├── tailwind.config.ts                 # Teal theme configuration
└── README.md                          # Project documentation
```

---

## Security Implementation

### Authentication Flow

1. **Unauthenticated User**
   - Middleware intercepts all routes
   - Redirects to `/auth`
   - Shows passcode input page

2. **Authentication**
   - User enters passcode (120290)
   - POST to `/api/auth`
   - Server validates passcode
   - Sets httpOnly cookie (90 days)
   - Redirects to main page

3. **Authenticated User**
   - Cookie checked by middleware
   - Access granted to all pages
   - No re-authentication for 90 days

### Middleware Exclusions

Routes accessible without auth:
- `/auth` - Login page
- `/api/auth` - Auth endpoint
- `/api/health` - Health checks
- `/_next/*` - Next.js assets
- `/favicon.ico`, `/logo.png` - Static assets

### Security Headers (Production)

All responses include comprehensive security headers via `next.config.js`:
- Prevents clickjacking (X-Frame-Options)
- Prevents MIME sniffing (X-Content-Type-Options)
- XSS protection
- HTTPS enforcement (HSTS)
- Content Security Policy
- Blocks camera/microphone/geolocation

---

## Data Processing

### KPI Calculations

**Average Mood**:
```typescript
// Parse mood values (-3 to +3)
// Calculate mean
// Color-code: red (negative), green (0), blue (positive)
```

**Average State** (7 levels):
```typescript
// Based on average mood:
if (mood <= -2) return 'Těžká deprese' (red-900)
if (mood <= -1) return 'Deprese' (red-800)
if (mood < 0) return 'Lehká deprese' (orange-800)
if (mood === 0) return 'Stabilní' (green-700)
if (mood < 1) return 'Lehká hypománie' (blue-700)
if (mood < 2) return 'Hypománie' (blue-800)
return 'Jasná hypománie' (blue-900)
```

**Overload Days**:
```typescript
// Count entries where Přetížení starts with "1", "2", or "3"
// Excludes "0 - Žádné"
```

### Chart Data Processing

```typescript
// Sort entries by date (oldest first)
// Parse mood values (-3 to +3)
// Scale to SVG coordinates
// Create line path with L commands
// Create area path with gradient fill
// Add clickable circles at each data point
```

---

## Deployment

### Development (Windows)
```bash
npm install
npm run dev
# Runs on http://localhost:3001 (or next available port)
# With .env file for AUTH_PASSCODE
```

### Production (Linux Server)

**Initial Setup**:
```bash
cd ~/Docker
git clone https://github.com/themartz90/noco-view.git
cd noco-view
chmod +x deploy.sh backup.sh
```

**Deploy**:
```bash
./deploy.sh
# 1. Pulls latest from git (main branch)
# 2. Runs backup.sh (if data exists)
# 3. Stops containers
# 4. Builds new image
# 5. Starts containers
# 6. Waits 45s
# 7. Checks health endpoint
# 8. Shows logs and status
```

**Backup**:
```bash
./backup.sh
# Manual backup (also runs automatically on deploy)
# Creates: backups/YYYY-MM-DD_HH-MM-SS_mood_volume.tar.gz
# Cleans: Removes backups older than 30 days
```

### Docker Configuration

**Port**: 3448:3000 (host:container)
**Environment**:
- `NODE_ENV=production`
- `AUTH_PASSCODE=120290`

**Health Check**:
- Endpoint: `http://localhost:3000/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds

**Restart Policy**: `unless-stopped`

---

## Design Iteration History

### Session 1: Initial Development
1. ❌ **Large cards (2 columns)** - Too cluttered
2. ❌ **All metrics visible** - Visual overload
3. ✅ **Option C: Dominant mood + minimal metrics** - Clean hierarchy

### Session 2: Feature Enhancement (v1.0.0)
1. ✅ **KPI Summary Cards** - Statistical overview
2. ✅ **SVG Mood Chart** - Visual trend analysis
3. ✅ **Timeline Spine** - Vertical line with colored dots
4. ✅ **Clickable Chart** - Jump to entries from chart
5. ✅ **Color Theme Change** - Purple → Teal for medical context
6. ✅ **Passcode Auth** - Security implementation
7. ✅ **Backup System** - Automated data protection

### Design Philosophy
> "Show the story of the data at a glance, details on demand"

Three-tier information architecture:
1. **Overview** - KPI cards + chart (patterns and trends)
2. **Timeline** - Quick scan of all days
3. **Details** - Full symptoms and notes on expansion

---

## Known Issues & Considerations

### Docker Network Conflict with Tailscale VPN (Fixed v1.0.1)
- **Issue**: Docker auto-assigned `192.168.0.x` subnet conflicting with Tailscale VPN
- **Symptoms**: "Connection reset by peer", application starts but refuses all HTTP connections
- **Root cause**: Docker's default network overlapped with Tailscale's `192.168.0.1` gateway
- **Fix**: Custom bridge network on `172.35.0.0/16` subnet
- **Prevention**: Docker daemon configured with default address pools (requires manual server setup)
- **Location**: `docker-compose.yml`, `/etc/docker/daemon.json` on server

### NocoDB Container Connectivity (Fixed v1.0.1)
- **Issue**: Container couldn't reach NocoDB at LAN IP `192.168.50.191:33860`
- **Symptoms**: "Connect Timeout Error" on `/api/mood` and `/api/ai-analysis` endpoints
- **Root cause**: Docker bridge network isolation from host LAN
- **Fix**: Connected to `overseerr-net` shared network, use container hostname in production
- **Location**: `docker-compose.yml`, `src/app/api/mood/route.ts`, `src/app/api/ai-analysis/route.ts`

### Environment Variables Not Loading (Fixed v1.0.1)
- **Issue**: OPENAI_API_KEY not available in container despite being in docker-compose environment
- **Symptoms**: AI analysis feature failed with missing API key
- **Root cause**: Shell variable substitution didn't work as expected
- **Fix**: Use `env_file` directive instead of inline environment variables
- **Location**: `docker-compose.yml`

### Přetížení Parser Bug (Fixed v1.0.0)
- **Issue**: "0 - Žádné" displayed as "0" twice
- **Root cause**: Regex only matched format with parentheses
- **Fix**: Added fallback regex for simple format
- **Location**: `src/components/TimelineEntry.tsx`

### Average State Calculation (Fixed v1.0.0)
- **Issue**: Showed "Stabilní" when no stable days existed
- **Root cause**: Gap in thresholds (e.g., -0.7 fell through)
- **Fix**: Changed to `mood < 0` for any depression, `mood === 0` for stable
- **Result**: Accurate 7-level classification

### Port Management (Resolved)
- **Issue**: Multiple dev servers running on different ports
- **Solution**: Kill old processes, use single server
- **Production**: Fixed to 3448

---

## Future Enhancements

### Planned Features
1. **PDF Export** - Print-optimized summary for consultations
   - Reference: `C:\Users\martz\Desktop\apps\tracker-app`
2. **Week/Month Grouping** - Sticky headers while scrolling
3. **Advanced Filters** - By symptoms, triggers, stress level
4. **Trend Indicators** - Arrows showing if mood is improving/worsening
5. **Custom Date Range** - Date picker for arbitrary ranges
6. **Data Export** - CSV/JSON for external analysis

### Potential Improvements
1. **Mobile Optimization** - Better responsive design for phones
2. **Keyboard Shortcuts** - Navigate entries, toggle filters
3. **Print Stylesheet** - Browser print without PDF export
4. **Offline Mode** - Service worker for viewing cached data
5. **Comparison Mode** - Side-by-side periods

---

## API Integration

### NocoDB Endpoint

**Request**:
```http
GET http://192.168.50.191:33860/api/v2/tables/mvj3iz12lui2i2h/records?limit=1000&sort=-Datum
Headers:
  xc-token: LehBM_s0bzNbhywtVYr_egxfe4AM3h75yLulZif3
```

**Response**:
```typescript
{
  list: MoodEntry[],
  pageInfo: {
    totalRows?: number
    page?: number
    pageSize?: number
    isFirstPage?: boolean
    isLastPage?: boolean
  }
}
```

### Error Handling
- Returns 500 on API errors
- Shows user-friendly Czech error messages
- Retry button available
- Console logging for debugging

---

## Commands Reference

### Development
```bash
npm run dev          # Start dev server (port 3001)
npm run build        # Production build test
npm run start        # Start production server locally
npm run lint         # Run ESLint
```

### Deployment (Linux)
```bash
./deploy.sh          # Full deployment (with backup)
./backup.sh          # Manual backup only
chmod +x *.sh        # Make scripts executable
```

### Git
```bash
git add .
git commit -m "message"
git push origin master
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

### Docker (Manual)
```bash
docker compose up --build -d    # Build and start
docker compose down             # Stop and remove
docker compose logs -f          # Follow logs
docker compose ps               # List containers
```

---

## Version History

### v1.0.1 (2025-10-25)
**Critical Fix** - Docker networking and NocoDB connectivity

**Issues Fixed**:
1. **Docker Network Conflict**: Resolved Tailscale VPN subnet collision
   - Docker was auto-assigning `192.168.0.x` conflicting with Tailscale on `192.168.0.1`
   - Application would start but refuse all connections ("Connection reset by peer")
   - Solution: Custom bridge network on `172.35.0.0/16` subnet

2. **NocoDB Connectivity**: Container couldn't reach NocoDB server
   - Problem: Docker bridge network isolated from host LAN
   - Solution: Connected container to `overseerr-net` shared with NocoDB
   - API routes now use container hostname (`nocodb:8080`) in production

3. **Environment Variables**: OPENAI_API_KEY not loading
   - Changed from shell variable substitution to `env_file` directive
   - AI analysis feature now functional

**Files Changed**:
- `docker-compose.yml`: Network configuration, env_file directive
- `src/app/api/mood/route.ts`: Dynamic NOCODB_URL
- `src/app/api/ai-analysis/route.ts`: Dynamic NOCODB_URL

**Server Configuration**:
- Added Docker daemon default address pools to prevent future conflicts
- Script created: `/tmp/update-docker-daemon.sh` (requires sudo to run)

**Commits**:
- `c3fd9ef` - Use 172.35.0.0/16 subnet (avoid all conflicts)
- `b905b12` - Add host network access for NocoDB connectivity
- `31dc497` - Connect to NocoDB via Docker network
- `94eeb0d` - Load environment variables from .env file
- `b0b96ad` - Update ai-analysis endpoint to use Docker network

### v1.0.0 (2025-10-23)
**Initial Release** - Feature-complete mood diary viewer

**Features**:
- Timeline view with vertical spine
- Interactive SVG mood chart
- 5 KPI summary cards
- Date range filtering
- Passcode authentication
- Security headers and robots.txt
- Automated backup system
- Docker deployment
- Teal medical theme

**Technical**:
- Next.js 14.2.33
- TypeScript
- Tailwind CSS
- NocoDB API integration
- 40 files, 15,185+ lines of code

**Repository**: https://github.com/themartz90/noco-view
**Commit**: `43d04b5`

---

## Context for Future Development

### Project Location
- **Development**: `C:\Users\martz\Desktop\apps\noco-view`
- **Production**: `~/Docker/noco-view` (Linux Mint Server)
- **Repository**: https://github.com/themartz90/noco-view

### Related Projects
- **tracker-app** - Reference for PDF export implementation
  - Location: `C:\Users\martz\Desktop\apps\tracker-app`
  - Used as reference for backup script and deployment

### Development Environment
- **OS**: Windows 11 (dev), Linux Mint (production)
- **Node**: 18.x
- **Package Manager**: npm
- **IDE**: VS Code (implied)

### Access Information
- **Dev Server**: http://localhost:3001
- **Prod Port**: 3448
- **Auth**: Passcode 120290 (90-day cookie)
- **Cloudflare**: Geo-restricted to Czech Republic

---

## UI Template Origins

Three AI models contributed UI mockups that were analyzed and combined:

1. **GPT Template** (`_files/gpt_template.html`)
   - KPI summary cards
   - Advanced filtering options
   - Compact row layout

2. **Claude Template** (`_files/claude_template.html`)
   - Clean medical aesthetic
   - Professional color scheme
   - Summary statistics

3. **Gemini Template** (`_files/gemini_template.html`)
   - Vertical timeline spine
   - Colored dots for mood states
   - Progressive disclosure

**Final Design**: Synthesis of all three, optimized for psychiatrist workflow

---

*Last updated: 2025-10-25*
*Version 1.0.1 - Critical Docker networking fixes*
*Development session with Claude Code*
