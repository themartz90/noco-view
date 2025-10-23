# NocoDB Viewer - Development Context

## Project Overview

A Next.js application for viewing bipolar disorder mood diary data from NocoDB, designed specifically for psychiatric consultations. The app emphasizes clarity, scannability, and professional presentation of medical data.

**Purpose**: Replace NocoDB's native view with a custom interface optimized for:
- Medical professionals (psychiatrists) viewing data for the first time
- Quick pattern recognition across multiple days
- Detailed information access without overwhelming the viewer
- 16:9 widescreen display optimization

---

## Technical Stack

- **Framework**: Next.js 14.2.0 (TypeScript)
- **Styling**: Tailwind CSS 3.3.0
- **Icons**: Lucide React 0.263.1
- **Date Handling**: date-fns 2.30.0
- **PDF Generation**: jspdf 3.0.2 (for future PDF export feature)
- **Data Source**: NocoDB API
  - Server: `http://192.168.50.191:33860`
  - Table ID: `mvj3iz12lui2i2h`
  - API Key: `LehBM_s0bzNbhywtVYr_egxfe4AM3h75yLulZif3`

---

## Key Features Implemented

### ✅ Core Functionality
1. **Timeline View** - Compact, scannable rows showing mood entries
2. **Date Range Filtering** - 1, 2, 3, 6 months, 1 year, all time
3. **Expandable Details** - Click any entry to see full symptoms and notes
4. **Czech Language** - All labels and interface in Czech
5. **Color-Coded Mood Indicators** - Red for depression, blue for hypomania
6. **Severity Indicators** - Visual badges for energy, fatigue, stress levels

### 🎨 Design Principles Applied

**Visual Hierarchy (Option C Implementation)**:
- **Dominant**: Large mood score pill (e.g., `-2`, `+1`) with color coding
- **Primary**: Mood description text
- **Secondary**: Small, muted metrics (Energy, Fatigue, Stress)
- **Tertiary**: Expand arrow

**Color Coding**:
- **Depression** (red shades):
  - `-3` = Dark red (`bg-red-700`) - severe
  - `-2` = Medium red (`bg-red-500`)
  - `-1` = Light red (`bg-red-300`) - mild
- **Hypomania** (blue shades):
  - `+3` = Dark blue (`bg-blue-700`) - severe
  - `+2` = Medium blue (`bg-blue-500`)
  - `+1` = Light blue (`bg-blue-300`) - mild

**Severity Indicators** (green → yellow → red):
- **Energie**: Vysoká (green), Střední (yellow), Nízká (red)
- **Únava**: Nízká (green), Střední (yellow), Silná (red)
- **Stres**: 1-2 (green), 3 (yellow), 4-5 (red)
- **Přetížení**: 0 (green), 1 (yellow), 2 (orange), 3 (red)

---

## UI/UX Decisions

### Layout Evolution
1. **Started with**: Large card-based layout (2 columns)
   - **Issue**: Hard to see patterns, too much scrolling
2. **Moved to**: Timeline view (compact horizontal rows)
   - **Benefit**: See 10-15 days at once, better pattern recognition
3. **Refined to**: Option C - Simplified with strong hierarchy
   - **Result**: Scannable at a glance, detailed on demand

### Key Info Section Structure
Always visible (no expansion needed):
- **Přetížení**: Icon + severity circle + description (purple left border)
- **Spouštěč**: Icon + label + text (orange left border)
- **Poznámka**: Icon + label + text (blue left border)

**Design features**:
- Colored left borders for quick visual parsing
- UPPERCASE bold labels (text-xs, font-bold, slate-600)
- Content on new lines for better readability
- Icons color-matched to borders

### Card Separation
- `space-y-6` between entries
- Zebra striping: Every other entry has subtle slate background
- Rounded corners (`rounded-xl`)
- Subtle ring border (`ring-1 ring-gray-200`)
- Hover effect: Enhanced shadow + darker ring

### Spacing Refinement
- Header padding: `py-4` → `py-3` for more compact feel
- Key info section: `space-y-2.5` → `space-y-3` for better breathing room
- Main container: `space-y-4` → `space-y-6` for clearer separation

---

## File Structure

```
noco-view/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── mood/route.ts         # NocoDB API integration
│   │   │   └── health/route.ts       # Health check endpoint
│   │   ├── layout.tsx                # Root layout (Czech lang)
│   │   ├── page.tsx                  # Main page with filters
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── TimelineEntry.tsx         # Compact timeline row component
│   │   └── MoodCard.tsx              # (unused - old card layout)
│   └── types/
│       └── mood.ts                   # TypeScript types for API
├── _docs/
│   ├── NocoDB Viewer+.md            # Original requirements
│   └── claude.md                    # This file
├── docker-compose.yml               # Docker config (port 3443)
├── Dockerfile                       # Production build
├── deploy.sh                        # Deployment script
├── start.sh                         # Startup script
├── healthcheck.js                   # Health check
└── README.md                        # Project documentation
```

---

## Data Structure

### MoodEntry Interface
```typescript
{
  Datum: string                      // Date
  'Dominatní nálada': string        // Dominant mood (-3 to +3)
  Energie: string                    // Energy level
  Únava: string                      // Fatigue
  'Spánek (délka)': number | string // Sleep duration
  Spánek: string                     // Sleep quality
  'Stres (1–5)': number | string    // Stress level
  'Hypomanické příznaky': string | null
  'Depresivní příznaky': string | null
  'Výrazný spouštěč dne': string | null
  'Co pomohlo?': string | null
  Poznámka: string | null
  Přetížení: string                  // Overload level
}
```

### API Response
```typescript
{
  list: MoodEntry[]
  pageInfo: {
    totalRows?: number
    page?: number
    pageSize?: number
    isFirstPage?: boolean
    isLastPage?: boolean
  }
}
```

---

## Component Hierarchy

### TimelineEntry Component

**Collapsed State**:
1. Date (day, date)
2. **Large mood pill** (dominant visual element)
3. Mood description
4. Small metrics (Energy, Fatigue, Stress) with labels
5. Expand arrow (if has expandable content)

**Always Visible Section** (if present):
- Přetížení (with colored border)
- Spouštěč (with colored border)
- Poznámka (with colored border)

**Expanded State** (on click):
- Full metrics grid with color-coded badges
- Hypomanic symptoms (indigo badges)
- Depressive symptoms (blue badges)
- What helped section

---

## Design Patterns Used

### 1. Visual Weight Differentiation
- **Labels**: `font-semibold` or `font-bold` + `uppercase` for headers
- **Values**: Regular weight
- **Critical info**: Larger, colored backgrounds
- **Supporting info**: Smaller, gray text

### 2. Progressive Disclosure
- Most critical info always visible
- Details available on click
- No scrolling past important data

### 3. Color as Meaning
- Red spectrum = Depression severity
- Blue spectrum = Hypomania severity
- Green/Yellow/Red = General severity scale
- Border colors = Section categorization

### 4. Scannable Layout
- Left-aligned for easy scanning
- Consistent structure across all entries
- Large mood indicators catch the eye first
- Subtle supporting data doesn't compete

---

## Known Issues & Limitations

### Czech Locale for Dates
- Currently using simple format: `d. M. yyyy` (e.g., "18. 10. 2025")
- Day abbreviations: Manual array (`['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']`)
- **Reason**: `date-fns/locale/cs` import issue
- **Impact**: Works fine, just not using full date-fns Czech locale features

### Mobile Responsiveness
- Metrics hidden on smaller screens (`hidden md:flex`)
- Mobile shows in expanded view instead
- Could be improved with better mobile-first design

---

## Future Enhancements (Not Yet Implemented)

### Phase 2 - PDF Export
- Landscape A4 format
- Print-optimized layout
- Already have `jspdf` installed
- Reference implementation in: `C:\Users\martz\Desktop\apps\tracker-app`

### Potential Improvements
1. **Timeline spine** - Vertical line with colored dots for each day
2. **Week/Month headers** - Sticky grouped headers while scrolling
3. **Custom date range picker** - Beyond preset filters
4. **Advanced filtering** - By mood type, symptom presence, etc.
5. **Trend graphs** - Visual representation of mood over time
6. **Export options** - CSV, JSON, or printable summary

---

## Deployment

### Development (Windows)
```bash
npm install
npm run dev
# Runs on http://localhost:3000 (or 3002 if 3000 is taken)
```

### Production (Linux Mint Server)
```bash
# On server at ~/Docker/noco-view
chmod +x deploy.sh
./deploy.sh
# Runs on port 3443
```

**Docker Configuration**:
- No database needed (data from NocoDB API)
- Stateless application
- Easy to redeploy
- Health check on `/api/health`

---

## Design Iteration Summary

### What We Tried
1. ❌ **Large cards (2 columns)** - Too cluttered, hard to scan
2. ❌ **All metrics visible with colored badges** - Visual overload
3. ❌ **Hint icons (⚠️📝)** - Redundant with always-visible section
4. ✅ **Option C: Dominant mood + minimal metrics** - Winner!

### What Works Well
- **Large mood pill** immediately catches attention
- **Colored borders** on key info sections create clear structure
- **Zebra striping** helps separate days while scrolling
- **Uppercase labels** distinguish headers from content
- **Progressive disclosure** keeps it clean but complete

### Design Philosophy
> "Everything has equal weight = nothing stands out"

Solution: Create clear hierarchy
- One dominant element (mood score)
- Few supporting elements (energy, fatigue, stress)
- Everything else accessible but not competing for attention

---

## Development Notes

### Performance
- All data fetched on load (no pagination yet)
- Default sort: newest first (`-Datum`)
- Client-side filtering (date ranges)
- No caching (fresh data on every load)

### Browser Compatibility
- Tested on modern browsers
- Tailwind CSS handles prefixing
- No complex animations or features
- Should work in all recent browsers

### Accessibility Considerations
- Semantic HTML structure
- Keyboard navigable (buttons, clickable rows)
- Color not sole indicator (text + icons too)
- Could improve: ARIA labels, focus states

---

## Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Deployment
./deploy.sh          # Full deployment on Linux
```

---

## API Integration Details

### Endpoint
`GET /api/mood?limit=1000&sort=-Datum`

### Headers
```
xc-token: LehBM_s0bzNbhywtVYr_egxfe4AM3h75yLulZif3
```

### Error Handling
- Returns 500 on API errors
- Shows error message to user
- Retry button available
- Logs errors to console

---

## Final State (as of 2025-10-20)

### What's Complete ✅
- Timeline view with dominant mood indicators
- Date range filtering (6 presets)
- Expandable details
- Color-coded severity indicators
- Structured key info section
- Zebra striping for card separation
- Compact header spacing
- Professional, medical-grade presentation

### What's Next 📋
- PDF export functionality
- Better mobile experience
- Timeline spine with dots
- Week/month grouping headers
- Advanced filters

---

## Contact & Context

**Project Location**: `C:\Users\martz\Desktop\apps\noco-view`
**Development**: Windows 11
**Deployment**: Linux Mint Server
**Port (dev)**: 3000-3002
**Port (prod)**: 3443

**Related Projects**:
- `tracker-app` - Reference for deployment scripts and PDF export
  - Location: `C:\Users\martz\Desktop\apps\tracker-app`

---

*Last updated: 2025-10-20*
*Development session with Claude Code*
