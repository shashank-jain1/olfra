# OLFRA — Master PRD & Build Prompt
> **Brand Name:** OLFRA™  
> **Tagline:** *"The intelligence of scent."*  
> Unique, not found on the web, short, memorable, derived from "olfactory" — the science of smell.

---

## 📋 Table of Contents
1. [Platform Overview](#1-platform-overview)
2. [Database Strategy — The Fragrance Intelligence Layer](#2-database-strategy--the-fragrance-intelligence-layer)
3. [Core Modules — Full Specs](#3-core-modules--full-specs)
4. [Design System](#4-design-system)
5. [21st.dev Motion Design Prompts](#5-21stdev-motion-design-prompts)
6. [Project Scaffold](#6-project-scaffold)
7. [Global Components](#7-global-components)
8. [AI System Prompts](#8-ai-system-prompts)
9. [Routing & State](#9-routing--state)
10. [Final Build Instructions](#10-final-build-instructions)

---

## 1. Platform Overview

| Field | Detail |
|---|---|
| **Brand** | OLFRA™ |
| **Domain target** | olfra.app |
| **Tagline** | "The intelligence of scent." |
| **Stack** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| **AI Engine** | Claude Sonnet 4.6 — `claude-sonnet-4-20250514` |
| **Fragrance DB** | Fragella API (primary) + pgvector similarity search (secondary) |
| **Auth** | Clerk or NextAuth |
| **Database** | Supabase (PostgreSQL + pgvector extension) |
| **Storage** | Cloudinary |
| **Payments** | Stripe |
| **Deployment** | Vercel |

### The Four Core Pillars

| # | Module | What It Does |
|---|---|---|
| 1 | 🛡️ **DupeShield** | AI-powered dupe detection & brand protection intelligence |
| 2 | 🌍 **ScentCulture** | Real-time global fragrance trend intelligence dashboard |
| 3 | 🛍️ **ScentMoment** | Occasion & mood-based fragrance recommendation engine |
| 4 | 🧬 **ScentDNA** | Skin chemistry profiler — predicts how scent evolves on YOU |

### Complementary Modules (build alongside)

| Module | Role |
|---|---|
| 🔄 **ScentCircle** | P2P swap & sample marketplace |
| 📸 **ScentSnap** | AI bottle identifier via photo |
| 🎭 **ScentSocial** | Fragrance social feed & creator hub |
| 🎵 **ScentLayer** | Layering compatibility engine |

---

## 2. Database Strategy — The Fragrance Intelligence Layer

> This is the backbone that powers DupeShield, ScentLayer, ScentMoment, and ScentDNA. Without a proper fragrance database, none of the AI features work accurately.

### 🥇 Primary: Fragella API
Fragella provides structured JSON data for over 74,000 fragrances including notes, accords, sillage, longevity, image assets, OilType (EDP/EDT/etc), user ratings, launch year, and country. It includes a Trait Match & Similarity Search feature to find fragrances by accord, notes, or similar fragrances.

**Use Fragella for:**
- ScentSnap identification lookups
- ScentLayer note pyramid data
- ScentMoment recommendation pool
- DupeShield accord similarity comparison
- All fragrance search/autocomplete across the platform

```bash
# Fragella API base URL
https://api.fragella.com/

# Key endpoints to use:
GET /fragrances/search?q={name}         # fuzzy search
GET /fragrances/{id}                    # full fragrance detail
GET /fragrances/{id}/similar            # similarity search
GET /fragrances/filter?accord={accord}  # filter by accord
```

### 🥈 Secondary: pgvector Similarity Search (Supabase)
For DupeShield's dupe detection, Fragella's similarity search alone isn't enough — we need our own vector embeddings for richer cosine similarity scoring.

**How it works:**
1. On first load, seed your Supabase DB with Fragella data (notes, accords, olfactory family)
2. For each fragrance, generate a **vector embedding** from its note profile using Claude's embedding or a simple TF-IDF vector on accord percentages
3. Store in Supabase `pgvector` column
4. DupeShield runs cosine similarity queries: `SELECT * FROM fragrances ORDER BY embedding <=> $query_embedding LIMIT 10`

```sql
-- Supabase schema for fragrance vectors
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE fragrances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fragella_id TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  concentration TEXT,
  family TEXT,
  top_notes TEXT[],
  heart_notes TEXT[],
  base_notes TEXT[],
  accords JSONB,           -- { "woody": 45, "amber": 30, "spicy": 25 }
  longevity INTEGER,       -- 1-10
  sillage INTEGER,         -- 1-10
  launch_year INTEGER,
  image_url TEXT,
  embedding VECTOR(384),   -- accord-based similarity vector
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine similarity index for fast dupe search
CREATE INDEX ON fragrances USING ivfflat (embedding vector_cosine_ops);
```

### 🥉 Optional: FragDB (Hugging Face)
FragDB is the most comprehensive structured fragrance database available, containing 122,367 fragrances, 7,344 brands, 2,825 perfumers, and 2,459 notes across 5 relational files with 67 data fields. Use this as a data enrichment layer if Fragella misses a fragrance.

### Similarity Algorithm for DupeShield

```typescript
// How DupeShield calculates dupe score
// Input: two fragrances with accord objects
// Output: similarity score 0-100

function calculateDupeScore(fragA: Fragrance, fragB: Fragrance): number {
  const accordKeys = getAllAccordKeys([fragA, fragB]);
  
  // Build vectors from accord percentages
  const vecA = accordKeys.map(k => fragA.accords[k] || 0);
  const vecB = accordKeys.map(k => fragB.accords[k] || 0);
  
  // Cosine similarity
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  const cosineSim = dotProduct / (magA * magB);
  
  // Also factor in shared notes (Jaccard similarity)
  const notesA = new Set([...fragA.topNotes, ...fragA.heartNotes, ...fragA.baseNotes]);
  const notesB = new Set([...fragB.topNotes, ...fragB.heartNotes, ...fragB.baseNotes]);
  const intersection = [...notesA].filter(n => notesB.has(n)).length;
  const union = new Set([...notesA, ...notesB]).size;
  const jaccardSim = intersection / union;
  
  // Weighted blend: 70% accord cosine + 30% note Jaccard
  return Math.round((cosineSim * 0.7 + jaccardSim * 0.3) * 100);
}
```

---

## 3. Core Modules — Full Specs

---

### 🛡️ MODULE 1: DupeShield

**Route:** `/dupeshield`  
**Purpose:** The world's first AI-powered fragrance dupe detection platform — serving both consumers (find dupes of expensive bottles) and brands (protect against copycats)

**Two Modes:**

#### Consumer Mode — "Find Dupes of Any Fragrance"
- Search bar: type any fragrance name → Fragella API returns the fragrance data
- AI + pgvector similarity search returns top 10 dupes ranked by similarity score
- Each dupe card shows:
  - Similarity score (large, circular gauge 0–100%)
  - Note overlap visualization (which notes are shared)
  - Accord comparison (side-by-side bar chart)
  - Price comparison (original vs dupe)
  - "Why it smells similar" — 2-line AI explanation
  - Buy links for the dupe
- "Original vs Dupe" deep comparison modal:
  - Full notes pyramid for both
  - Performance comparison (longevity, sillage)
  - Verdict: "Near Clone / Strong Dupe / Inspired By / Similar Vibe"
  - Community reviews on the dupe

#### Brand Mode — "Protect Your Fragrance" (B2B)
- Brand submits their fragrance for monitoring
- Platform runs weekly similarity scans across 74,000+ fragrances
- Dashboard shows: new dupes detected this week, similarity score trends, market penetration of dupes
- PDF threat report generation (for legal teams)
- "Verified Original" badge system

**AI System Prompt:**
```
You are a fragrance similarity analyst. Given two fragrances with their 
note pyramids and accord percentages, return ONLY a JSON:
{
  "similarityScore": 78,
  "verdict": "Strong Dupe | Near Clone | Inspired By | Similar Vibe | Distant Relative",
  "sharedNotes": ["oud", "bergamot", "amber"],
  "uniqueToOriginal": ["iris", "vetiver"],
  "uniqueToDupe": ["sandalwood", "vanilla"],
  "explanation": "2 sentence explanation of why they smell similar",
  "keyDifference": "1 sentence on the main olfactory difference",
  "longevityAdvantage": "Original | Dupe | Similar",
  "valueVerdict": "2 sentence value assessment"
}
Return ONLY the JSON.
```

---

### 🌍 MODULE 2: ScentCulture

**Route:** `/culture`  
**Purpose:** Real-time global fragrance trend intelligence — what the entire world is smelling right now, broken down by region, demographic, and channel

**Sections:**

#### Hero: Interactive World Map
- Full-width dark SVG world map (react-simple-maps)
- Glowing city dots with pulse animation — intensity = trend velocity
- Cities tracked: Mumbai, Delhi, Dubai, Riyadh, Paris, London, NYC, LA, Seoul, Tokyo, São Paulo, Lagos
- Click any city → right panel slides in with local trend data
- Hover tooltip: city + top trending note this week

#### Trending Notes Carousel
- Horizontal scroll strip of olfactory ingredient cards
- Each card: note name, olfactory family icon, weekly trend % change (↑↓)
- Clicking a note shows: which fragrances contain it, which regions love it, trend graph

#### "Rising Fast" Section
- 3 featured fragrances with explosive growth this week
- Spark-line chart (7-day trend), growth %, region of origin

#### Demographic Intelligence
- Toggle: Men / Women / Unisex / Gen Z / Millennial / Gen X
- Stacked bar chart showing top 5 olfactory families per demographic
- Data refreshes with smooth chart transition animation

#### AI Weekly Editorial
- Every Monday: AI generates a 3-paragraph trend report
- Rendered in large editorial pull-quote typography
- Typewriter animation on first reveal
- Share as image button (generates a beautiful card)

**AI System Prompt:**
```
You are a luxury fragrance industry trend analyst. Write a weekly intelligence 
report in exactly 3 paragraphs:
1. The dominant global macro trend this week — which olfactory families and 
   specific notes are surging and the cultural/seasonal reason why
2. Regional spotlight — one specific market showing surprising taste shifts 
   with concrete fragrance examples
3. Forward prediction — what you expect to dominate the next 2 weeks based 
   on leading indicators

Style: Authoritative, intelligent, slightly editorial. The tone of a senior 
editor at a prestigious fragrance trade publication. Flowing prose, no bullet 
points. Max 220 words total. No filler phrases.
```

---

### 🛍️ MODULE 3: ScentMoment

**Route:** `/moment`  
**Purpose:** The occasion-first fragrance intelligence engine — AI recommends the perfect fragrance for any moment in your life

**The Core Flow:**

#### Step 1: Set Your Moment
A beautiful card-based input flow (one question per screen, cinematic transitions):
- **Occasion picker:** Date Night / Job Interview / Wedding Guest / First Day / Funeral / Gym / Beach / Night Out / Work / Travel / Lazy Sunday / Creative Work
- **Mood selector:** Confident / Romantic / Calm / Energetic / Mysterious / Playful / Professional / Grieving
- **Time of day:** Morning / Afternoon / Evening / Late Night
- **Weather/Season:** Hot & Humid / Cold & Dry / Mild Spring / Rainy
- **Duration:** "How long do I need this to last?" (slider: 2h / 4h / 6h / 8h / All day)

#### Step 2: AI Recommendation Engine
- First checks user's wardrobe — recommends from what they OWN with specific instructions on how to wear it for this occasion
- Then recommends 3 fragrances to BUY if wardrobe doesn't match
- Each recommendation shows:
  - Why it fits this exact occasion (AI explanation)
  - Application tips for the occasion (pulse points, amount)
  - "Scent Story Card" — a beautiful shareable card with the occasion + fragrance + poetic description

#### Step 3: Scent Story Card
- Beautifully designed shareable card (generated as image)
- Shows: occasion, fragrance name, one-line poetic description, user's name
- Share to ScentSocial or download
- "Gift This Recommendation" — sends the card to a friend

**AI System Prompt:**
```
You are a world-class fragrance consultant with expertise in matching 
scents to life moments. Given an occasion, mood, time, weather, and 
desired longevity, return ONLY a JSON:
{
  "primaryRecommendation": {
    "name": "fragrance name",
    "brand": "brand",
    "whyItFits": "2 sentence explanation perfectly matched to the occasion",
    "applicationTip": "specific tip for this occasion — where to spray, how much",
    "scentStory": "one evocative sentence that captures this fragrance at this moment",
    "longevityFit": "excellent / good / borderline"
  },
  "alternatives": [
    {
      "name": "fragrance name",
      "brand": "brand", 
      "angle": "one sentence on why this is a different but valid choice"
    },
    {
      "name": "fragrance name",
      "brand": "brand",
      "angle": "one sentence on why this is a different but valid choice"
    }
  ],
  "occasionInsight": "one sentence of wisdom about fragrance choice for this specific occasion",
  "whatToAvoid": "one sentence on what olfactory families to avoid for this occasion"
}
Return ONLY the JSON.
```

---

### 🧬 MODULE 4: ScentDNA

**Route:** `/dna`  
**Purpose:** The most personal feature on OLFRA — a skin chemistry profiler that predicts exactly how any fragrance will smell and perform on YOUR specific body

**The Science Behind It:**
Skin pH, body heat, diet, and microbiome all chemically alter how fragrance molecules interact with skin. A high-acid pH (oily skin, meat-heavy diet) accelerates the top note evaporation. Warm body heat amplifies projection. Humid climates extend longevity. This module makes that science accessible.

**Quiz Flow (6 steps, full-screen each):**

| Step | Question | Options |
|---|---|---|
| 1 | Skin type | Dry / Oily / Normal / Combination |
| 2 | Body heat | I run cool / I run warm / I sweat easily / Very hot |
| 3 | Diet | Plant-based / Mediterranean / Meat-heavy / Spicy & rich |
| 4 | Climate you live in | Cold & dry / Temperate / Warm & humid / Hot desert |
| 5 | Skin tone | Very fair / Fair-medium / Medium-olive / Deep |
| 6 | How long fragrances last on you usually | < 2 hours / 2-4 hours / 4-6 hours / 6+ hours |

**Result Profile Page:**
- Animated SVG DNA helix (continuously rotating, built from user's data attributes)
- Personalized header: e.g. "Warm & Humid · Spice-forward · Long Projector"
- Four stat cards:
  - **Skin Chemistry Score** (ScoreGauge component, /100)
  - **Longevity Modifier** (e.g. "+20% longer than avg" or "-10%")
  - **Projection Profile** (Low / Medium / High / Beast — visual scale)
  - **Best Note Families** (top 3 olfactory families that perform best on your skin)
- **Signature Accords** — 5 floating bubble pills that suit your chemistry (breathing animation)
- **Worst Families** — 3 accords that underperform on your profile (grayed out)
- **"Test a Fragrance"** CTA — any fragrance they search gets instantly evaluated against their DNA with a "ScentDNA Match %" badge

**ScentDNA Badge System:**
Any fragrance on the platform shows a badge when a user has completed their DNA:
- 🟢 90-100%: "Perfect Match"
- 🟡 70-89%: "Good Match"  
- 🟠 50-69%: "Try Before Buy"
- 🔴 <50%: "May Not Suit Your Chemistry"

**AI System Prompt:**
```
You are an expert in fragrance chemistry and human skin biology. 
Given a user's complete skin profile, return ONLY a JSON:
{
  "skinChemistryScore": 82,
  "longevityModifier": "+18%",
  "longevityExplanation": "one sentence why",
  "projectionProfile": "Medium-High",
  "projectionExplanation": "one sentence why",
  "bestFamilies": [
    { "family": "Warm Spice", "reason": "one sentence" },
    { "family": "Woody Oriental", "reason": "one sentence" },
    { "family": "Amber Musk", "reason": "one sentence" }
  ],
  "worstFamilies": ["Aquatic", "Light Floral", "Green Fougère"],
  "signatureAccords": ["Warm Spice", "Resinous", "Balsamic", "Smoky Wood", "Vanilla"],
  "skinInsight": "2 sentence science-backed explanation of this profile",
  "topRecommendedFamilies": ["Orientals", "Ambers", "Ouds"],
  "applicationTip": "personalized tip on where/how to apply based on their profile"
}
Return ONLY the JSON.
```

---

## 4. Design System

### Brand Identity

```
Name:         OLFRA™
Voice:        Clinical precision with poetic warmth
Visual DNA:   High-fashion laboratory. Think Aesop meets CERN.
NOT:          Purple gradients. Generic sans fonts. Cookie-cutter SaaS blue.
```

### Color Palette

```css
:root {
  /* Core */
  --obsidian:     #080B0F;   /* deepest background */
  --void:         #0D1117;   /* card backgrounds */
  --surface:      #13181F;   /* elevated surfaces */
  --border:       rgba(255,255,255,0.06);

  /* Amber — the soul of OLFRA */
  --amber-deep:   #8B5E1A;
  --amber:        #C8922A;
  --amber-warm:   #E8A83C;
  --amber-light:  #F5D78E;
  --amber-glow:   rgba(200,146,42,0.12);

  /* Module accents */
  --dupe-red:     #C0392B;   /* DupeShield — danger/alert */
  --culture-lime: #A8CC2C;   /* ScentCulture — growth/trend */
  --moment-rose:  #C2627A;   /* ScentMoment — warmth/occasion */
  --dna-mint:     #2FFFA8;   /* ScentDNA — science/biology */

  /* Typography */
  --text-primary: #F0EDE8;
  --text-secondary: rgba(240,237,232,0.6);
  --text-muted:   rgba(240,237,232,0.35);
}
```

### Typography

```
Display:   "Cormorant Garamond" — serif, fashion editorial
           Weights: 300 (light), 400 (regular), 600 (semibold)
           Used for: All page headlines, module titles, hero text

UI:        "DM Mono" — monospace, technical precision  
           Used for: Scores, percentages, data labels, badges

Body:      "Inter" — clean, readable
           Used for: Body copy, descriptions, UI labels
```

### Component Tokens

```css
/* Glass card */
.glass-card {
  background: rgba(13,17,23,0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  box-shadow: 0 0 0 0 transparent,
              inset 0 1px 0 rgba(255,255,255,0.04);
}

/* Amber glow shadow — used on hover states */
.glow-amber {
  box-shadow: 0 0 30px rgba(200,146,42,0.15),
              0 0 60px rgba(200,146,42,0.06);
}

/* Module-specific card glows */
.glow-dupe    { box-shadow: 0 0 30px rgba(192,57,43,0.15); }
.glow-culture { box-shadow: 0 0 30px rgba(168,204,44,0.12); }
.glow-moment  { box-shadow: 0 0 30px rgba(194,98,122,0.15); }
.glow-dna     { box-shadow: 0 0 30px rgba(47,255,168,0.12); }
```

---

## 5. 21st.dev Motion Design Prompts

> These are specific motion design component prompts inspired by 21st.dev shader, scroll animation, hero, and card categories. Use these with your Stitch MCP or when building components manually.

---

### 🌊 PROMPT 1 — Hero Shader Background (Homepage)
*Inspired by: 21st.dev Shaders category*

```
Build a full-screen WebGL shader background component for OLFRA's homepage hero.

The shader simulates liquid amber dissolving into dark void — like perfume oil 
dropped into dark water. Behavior:
- Base: near-black (#080B0F) void
- Two slow-moving fluid blobs of amber (#C8922A) and deep gold (#8B5E1A)
- Blobs move on sin/cos wave paths — very slow (30-40 second cycles)
- Where blobs overlap: bright amber flare (#F5D78E) appears briefly
- Mouse movement causes subtle ripple distortion in the fluid
- On mobile: replace WebGL with CSS radial gradient animation

Implementation: use react-three-fiber or raw WebGL fragment shader in a canvas element.
Fragment shader should use:
- Simplex noise for organic fluid movement
- Smooth step blending for soft blob edges  
- Low-intensity grain overlay (3% opacity) for texture

The overall feel: like watching amber perfume oil float in slow motion through 
dark water. Hypnotic, premium, alive.
```

---

### 📜 PROMPT 2 — Parallax Scroll Feature Section
*Inspired by: 21st.dev Hero Gallery Scroll Animation*

```
Build a horizontal parallax scroll section for OLFRA's homepage that reveals 
the 4 core modules as the user scrolls vertically.

Behavior:
- Section is 400vh tall (creates long scroll space)
- Content is sticky — stays in viewport while user scrolls through the 400vh
- As user scrolls through each 100vh:
  - Module card ZOOMS from small (0.6 scale) to full (1.0 scale)
  - Background color SHIFTS subtly (obsidian → module accent tint)
  - Title FADES and SLIDES UP with spring easing
  - A vertical PROGRESS LINE on the right side fills as user scrolls

Module sequence & their accent color shift:
1. DupeShield — crimson tint (#C0392B at 4% opacity)
2. ScentCulture — lime tint (#A8CC2C at 4% opacity)
3. ScentMoment — rose tint (#C2627A at 4% opacity)
4. ScentDNA — mint tint (#2FFFA8 at 4% opacity)

Each module card (centered, 600px wide):
- GlassCard with module-specific glow
- Large module icon (SVG, 80px)
- Module name in Cormorant Garamond 64px
- One-line description
- "Explore →" link that fades in last

Use Framer Motion useScroll + useTransform for all scroll-driven animations.
```

---

### 🃏 PROMPT 3 — Display Cards Stack (DupeShield Results)
*Inspired by: 21st.dev Display Cards component (as provided in the task)*

```
Build the DupeShield results display using a stacked card reveal system.

When a user searches for a fragrance and dupes are found, show results as 
a stacked card deck that fans out on hover/interaction:

Stack behavior:
- 3-5 dupe cards stacked on top of each other (like playing cards)
- Bottom cards are grayscale + dimmed (30% opacity overlay)
- Cards are skewed -8deg on Y axis (like the DisplayCards component)
- Hovering the stack causes cards to FAN OUT — each card slides to its 
  offset position with spring animation (staggered 80ms)
- Hovering an individual card: it lifts up, grayscale removed, full color revealed

Individual dupe card contains:
- Fragrance name + brand in serif font
- Large similarity score badge (circular, color-coded)
- Note overlap mini visualization (5 colored pills)
- Price comparison (original vs dupe)
- "Why it smells similar" — one line italic text

The reveal of the fan feels like shuffling through a deck of perfume dupes.
Use the same -skew-y-[8deg] and grid-area:stack technique from the 
DisplayCards component, but with custom content and OLFRA's color system.
```

---

### ✨ PROMPT 4 — Scroll-Triggered Text Reveal (ScentCulture)
*Inspired by: 21st.dev Text Components + Scroll Areas*

```
Build a cinematic scroll-triggered text reveal for ScentCulture's 
AI Weekly Trend Report section.

Behavior:
- The editorial text is hidden initially
- As user scrolls the section into view:
  - Each word of the report FADES IN sequentially (30ms stagger per word)
  - Words start slightly below position (translateY: 8px) and rise into place
  - The effect makes it look like the text is being typed or revealed by 
    an invisible hand — like a luxury magazine being printed live
- A thin amber (#C8922A) vertical line on the left pulses as each paragraph 
  completes its reveal
- Pull quote (key sentence from the report) is:
  - Larger font (28px Cormorant Garamond italic)
  - Appears with a horizontal SWIPE-IN animation from left
  - Has a left border accent in the module's lime color (#A8CC2C)

Use Framer Motion whileInView with staggerChildren on word-level spans.
Split text into individual <motion.span> per word.
Intersection Observer triggers the animation once (no repeat).
```

---

### 🔬 PROMPT 5 — DNA Helix Animation (ScentDNA)
*Inspired by: 21st.dev Shaders + Custom SVG animations*

```
Build an animated SVG DNA double-helix component for ScentDNA's result page.

The helix is constructed from the user's quiz data — each data point 
becomes a colored rung on the helix ladder.

Specifications:
- SVG viewBox: 200 x 400
- Two sinusoidal backbone curves (left strand and right strand)
  - Left: sin(t) wave, color: mint (#2FFFA8)
  - Right: sin(t + π) wave (offset half-cycle), color: amber (#C8922A)
- Rungs connecting the two strands every 30px of height
  - Each rung is colored based on user's quiz answers:
    - Skin type rung: blue/green family
    - Diet rung: warm/spice family  
    - Climate rung: cool/aquatic or hot/amber family
  - 6 rungs total (one per quiz question)
- Animation:
  - The entire helix ROTATES in 3D perspective (CSS perspective + rotateY)
  - Continuous slow rotation: 20 second cycle, ease: linear, infinite
  - On mount: helix DRAWS ITSELF from top to bottom (SVG stroke-dashoffset animation, 1.5s)
  - Rung labels appear on hover: fade-in tooltip showing the data attribute

The visual metaphor: user's biology made visible as a fragrance fingerprint.
Implement using raw SVG path calculations or react-spring for the draw animation.
```

---

### 🌐 PROMPT 6 — Live Globe Pulse (ScentCulture Map)
*Inspired by: 21st.dev Maps + Shader categories*

```
Build the ScentCulture world map with animated trend pulse indicators.

Map implementation:
- Use react-simple-maps with a Robinson projection
- Map fill: #0D1117 (void dark)
- Country borders: rgba(255,255,255,0.04) — barely visible
- Ocean/background: #080B0F

City pulse dots (12 cities):
- Each city has a pulsing indicator: two circles
  - Inner circle: solid, 6px radius, color = module lime (#A8CC2C)
  - Outer circle: same color, starts at 6px, expands to 20px, fades to 0
  - Expansion animation: 2-second cycle, ease-out, infinite
  - Cities with higher trend velocity: faster pulse cycle (1s instead of 2s)
  - Cities with lower trend velocity: slower pulse (3s)

Interaction:
- Hover over any city dot: tooltip appears (city name + top trending note)
  - Tooltip is a GlassCard, 200px wide, positioned above the dot
  - Appears with a fast scale-up spring animation (0.15s)
- Click city dot: right panel slides in from edge (400px, spring animation)
  - Panel contains: region trend breakdown, top 5 fragrances, demographic split
  - Clicking outside or X closes it (spring slide-out)

Ambient effect:
- Very faint grid lines overlay the map (10% opacity, like a tech HUD)
- Subtle scan-line animation moving from top to bottom of map (very slow, 20s)
  — gives it a surveillance/intelligence feed aesthetic
```

---

### 💫 PROMPT 7 — Magnetic Card Grid (ScentMoment Occasions)
*Inspired by: 21st.dev Cards + Hover effects*

```
Build the ScentMoment occasion picker as a magnetic card grid.

12 occasion cards arranged in a 4x3 grid (3x4 on tablet, 2-col on mobile).

Each card (160px x 160px):
- GlassCard base
- Large emoji or custom SVG icon (56px, centered top area)
- Occasion name in DM Mono (14px, uppercase, letter-spacing: 0.1em)
- Subtle gradient overlay specific to the occasion mood:
  - Date Night: rose-to-burgundy gradient
  - Job Interview: steel-blue gradient
  - Wedding: champagne-to-cream gradient
  - Night Out: violet-to-black gradient
  - Gym: electric-green gradient
  - Beach: cyan-to-teal gradient
  (each occasion has its own mini color identity)

Interaction:
- MAGNETIC hover: card tilts toward the cursor position (CSS perspective transform)
  - Card rotates max ±8 degrees on X and Y based on mouse position within card
  - Implementation: onMouseMove calculates cursor offset from card center,
    maps to rotation values, applies via CSS transform
  - Smooth spring easing on mouse leave (card returns to flat)
- On hover: card's gradient overlay brightens, border becomes visible
- On selection: card PULSES (brief scale 1.0 → 1.06 → 1.0) and gets a 
  mint checkmark badge in top-right corner
- Selected cards maintain a glow border in the module rose color (#C2627A)

The grid should feel like interactive perfume testers you can reach out and touch.
```

---

### 🔄 PROMPT 8 — Morphing Score Gauge (Shared Component)
*Inspired by: 21st.dev Numbers + SVG animations*

```
Build a reusable animated circular score gauge component used across all modules.

Props: score (0-100), label (string), size ('sm'|'md'|'lg'), variant ('amber'|'red'|'lime'|'mint'|'rose')

Visual specs:
- Circular SVG, strokeLinecap: round
- Track (background arc): rgba(255,255,255,0.06), full 270-degree arc (starts 135deg, ends 45deg)
- Fill arc: color = variant prop, same 270-degree range
- Fill is animated via stroke-dashoffset from 0 to final value (1.2s cubic-bezier easing)

Center display:
- Large number in DM Mono (score value), animates from 0 to final score as gauge fills
- Small label text below in DM Mono (uppercase)

Variants color map:
- amber: #C8922A (DupeShield similarity scores)
- red: #C0392B (DupeShield threat level)
- lime: #A8CC2C (ScentCulture trend strength)
- mint: #2FFFA8 (ScentDNA match score)
- rose: #C2627A (ScentMoment fit score)

Additional behavior:
- Score < 40: fill color shifts to #C0392B (warning red) regardless of variant
- Score 40-70: fill = amber variant  
- Score > 70: fill = variant color at full brightness
- On hover: gauge glows (box-shadow using variant color at 20% opacity)

Sizes: sm=80px, md=120px, lg=160px
```

---

### 🎭 PROMPT 9 — Page Transition Cinema (Global)
*Inspired by: 21st.dev Hero transitions + Framer Motion*

```
Build a cinematic page transition system for OLFRA using Framer Motion AnimatePresence.

Each module has its OWN transition that reflects its personality:

HOMEPAGE → any module:
- A vertical WIPE from center — like a curtain parting
- The amber blob shader briefly intensifies before wiping
- Duration: 0.6s

→ DUPESHIELD:
- Screen FLASHES briefly to deep crimson (#C0392B at 20%) then fades to new page
- Like a scanner alert firing
- Duration: 0.5s

→ SCENTCULTURE:
- Map-zoom effect: previous page scales down and fades, new page zooms in from center
- Subtle globe rotation sound (optional)
- Duration: 0.7s

→ SCENTMOMENT:
- Soft horizontal slide with rose-tinted overlay dissolve
- Gentle, warm — matches the occasion-driven nature of the module
- Duration: 0.55s

→ SCENTDNA:
- Previous page DISSOLVES with a DNA-spiral particle effect
  (small dots scatter outward from center point as old page fades)
- New page assembles from center outward
- Duration: 0.8s

UNIVERSAL EXIT: all pages exit with opacity 0 + y: -10px (subtle lift-and-fade)
UNIVERSAL ENTER: all pages enter with opacity 0 + y: 20px → opacity 1 + y: 0

Implement using layoutId for shared element transitions where elements 
appear on both pages (e.g. the navbar logo should not re-animate on transition).
```

---

### 🌀 PROMPT 10 — Accordion Notes Pyramid (Shared Component)
*Inspired by: 21st.dev Accordions + SVG data visualization*

```
Build a visually rich fragrance notes pyramid component that combines 
SVG visualization with accordion-style expand behavior.

Default view (collapsed):
- An equilateral triangle SVG divided into 3 sections:
  - Top section (smallest): Top Notes — amber color (#E8A83C)
  - Middle section: Heart Notes — warm rose (#C2627A)
  - Bottom section (largest): Base Notes — deep amber (#8B5E1A)
- Each section is filled with a gradient and subtle grain texture
- Section labels float inside with note names (truncated if >3 notes: "Bergamot, Lemon +2")
- The triangle has a thin white border (0.5px, 5% opacity) between sections
- On mount: sections FILL IN from bottom to top with a 200ms stagger

Hover/expanded view:
- Hovering a section:
  - That section HIGHLIGHTS (brightens 20%, border glows)
  - A tooltip card appears BESIDE the triangle (not over it) listing ALL notes 
    in that section with small colored dot indicators
  - Notes fade in with 50ms stagger within the tooltip
  
Clicked/expanded mode (optional prop: expandable=true):
- Triangle scales down to 50% on left
- Note details expand on right side: each note listed with:
  - Note name
  - Olfactory family tag
  - Brief 1-line description (from Fragella API)
- Collapse animation on second click

Size variants: sm (120px wide), md (200px), lg (300px)
Used in: ScentSnap results, ScentLayer inputs, DupeShield comparison, fragrance detail pages.
```

---

## 6. Project Scaffold

### Tech Dependencies

```bash
# Core
npx create-next-app@latest olfra --typescript --tailwind --app
cd olfra

# UI & Components
npx shadcn@latest init
npx shadcn@latest add card button badge tabs dialog sheet

# Animation
npm install framer-motion

# 3D & Shaders  
npm install @react-three/fiber @react-three/drei three

# Maps
npm install react-simple-maps

# Data & API
npm install axios @tanstack/react-query

# State
npm install zustand

# Charts
npm install recharts

# Icons
npm install lucide-react

# Utilities
npm install clsx tailwind-merge class-variance-authority
```

### Folder Structure

```
olfra/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx              # Homepage
│   ├── dupeshield/
│   │   └── page.tsx
│   ├── culture/
│   │   └── page.tsx
│   ├── moment/
│   │   └── page.tsx
│   ├── dna/
│   │   └── page.tsx
│   ├── circle/
│   │   └── page.tsx
│   ├── snap/
│   │   └── page.tsx
│   ├── social/
│   │   └── page.tsx
│   ├── layer/
│   │   └── page.tsx
│   ├── wardrobe/
│   │   └── page.tsx
│   ├── profile/[username]/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   │   ├── display-cards.tsx     # from 21st.dev (provided)
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── WardrobeDrawer.tsx
│   │   └── PageTransition.tsx
│   ├── shared/
│   │   ├── ScoreGauge.tsx        # Prompt 8
│   │   ├── NotesPyramid.tsx      # Prompt 10
│   │   ├── GlassCard.tsx
│   │   └── FragranceCard.tsx
│   ├── home/
│   │   ├── ShaderBackground.tsx  # Prompt 1
│   │   ├── ScrollFeatures.tsx    # Prompt 2
│   │   └── HeroSection.tsx
│   ├── dupeshield/
│   │   ├── DupeSearchBar.tsx
│   │   ├── DupeCardStack.tsx     # Prompt 3
│   │   ├── ComparisonModal.tsx
│   │   └── BrandDashboard.tsx
│   ├── culture/
│   │   ├── WorldMap.tsx          # Prompt 6
│   │   ├── RegionPanel.tsx
│   │   ├── TrendingNotes.tsx
│   │   └── EditorialReport.tsx   # Prompt 4
│   ├── moment/
│   │   ├── OccasionGrid.tsx      # Prompt 7
│   │   ├── MomentFlow.tsx
│   │   └── ScentStoryCard.tsx
│   └── dna/
│       ├── DNAQuiz.tsx
│       ├── DNAHelix.tsx          # Prompt 5
│       └── DNAProfile.tsx
├── lib/
│   ├── claude.ts                 # Claude API service
│   ├── fragella.ts               # Fragella API service
│   ├── supabase.ts               # Supabase client
│   └── similarity.ts             # Dupe score algorithm
├── store/
│   ├── useWardrobeStore.ts
│   ├── useUserStore.ts
│   └── useDNAStore.ts
├── types/
│   ├── fragrance.ts
│   ├── user.ts
│   └── dupe.ts
└── hooks/
    ├── useFragrance.ts
    ├── useDupeSearch.ts
    └── useScrollProgress.ts
```

---

## 7. Global Components

### Navbar

```
Fixed top, full-width, frosted glass (backdrop-blur-xl)
Height: 64px (shrinks to 56px on scroll via Framer Motion)
Left: OLFRA™ logo in Cormorant Garamond 22px, amber color
Center: Module navigation links — DupeShield / ScentCulture / ScentMoment / ScentDNA
        Active link: thin amber underline that slides between links (layoutId animation)
Right: ScentSnap icon button / Wardrobe icon + count / Notifications bell / User avatar
Border-bottom: 1px rgba(255,255,255,0.05)
On scroll past 80px: border-bottom becomes rgba(255,255,255,0.08), background darkens slightly
```

### GlassCard Component

```tsx
// Base glass card — use everywhere
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dupe' | 'culture' | 'moment' | 'dna';
  hoverable?: boolean;
}
// variant changes the glow color on hover
// hoverable adds scale(1.02) + glow on hover via Framer Motion whileHover
```

### PageTransition Wrapper

```tsx
// Wrap every page with this
// Reads the current route and applies the correct transition (Prompt 9)
<PageTransition>
  {children}
</PageTransition>
```

---

## 8. AI System Prompts

### Central Claude API Service

```typescript
// lib/claude.ts
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  imageBase64?: string
): Promise<Record<string, unknown>> {
  const content = imageBase64
    ? [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
        { type: "text", text: userMessage }
      ]
    : userMessage;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;
  
  try {
    return JSON.parse(text);
  } catch {
    // Strip any markdown if Claude added it
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  }
}
```

### All AI System Prompts (collected)

All four system prompts are defined in their module sections above (§3). They are:
- `DUPESHIELD_PROMPT` — in DupeShield module spec
- `CULTURE_PROMPT` — in ScentCulture module spec  
- `MOMENT_PROMPT` — in ScentMoment module spec
- `DNA_PROMPT` — in ScentDNA module spec

Additional prompts for complementary modules:

```
// ScentSnap — bottle identifier
System: "You are a world-class fragrance identifier. Given a perfume bottle image,
return structured JSON with: name, brand, year, concentration, family, topNotes,
heartNotes, baseNotes, longevity(1-10), sillage(1-10), description(2 sentences).
Return ONLY JSON."

// ScentLayer — layering compatibility
System: "You are a master perfumer expert in layering. Given two fragrances with 
their notes, return JSON: compatibilityScore(0-100), layeredNotes(top/heart/base),
applicationOrder(first/second/waitTime), poeticDescription(2-3 sentences),
verdict(Sublime Match/Good Pairing/Interesting Contrast/Avoid). Return ONLY JSON."

// ScentSocial caption assist
System: "Write a 2-3 sentence evocative social caption for a luxury perfume 
platform. Given a fragrance name and mood, use atmospheric sensory language.
No hashtags, no emojis. Max 55 words. Return ONLY the caption text."
```

---

## 9. Routing & State

### App Router Routes

```
/                     → Homepage (marketing, shader hero, scroll features)
/dupeshield           → DupeShield (consumer mode default)
/dupeshield/brand     → DupeShield brand protection mode
/culture              → ScentCulture dashboard
/moment               → ScentMoment (occasion picker flow)
/dna                  → ScentDNA (quiz or profile if completed)
/circle               → ScentCircle marketplace
/snap                 → ScentSnap identifier
/social               → ScentSocial feed
/layer                → ScentLayer engine
/wardrobe             → My Wardrobe
/profile/[username]   → User profile
/notifications        → Notifications
```

### Zustand Stores

```typescript
// store/useUserStore.ts
interface UserStore {
  user: User | null;
  dnaProfile: DNAProfile | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setDNA: (profile: DNAProfile) => void;
  getDNAMatchScore: (fragrance: Fragrance) => number;
}

// store/useWardrobeStore.ts
interface WardrobeStore {
  bottles: WardrobeBottle[];
  addBottle: (bottle: WardrobeBottle) => void;
  removeBottle: (id: string) => void;
  getTotalEstimatedValue: () => number;
  getByFamily: (family: string) => WardrobeBottle[];
}

// store/useDNAStore.ts  
interface DNAStore {
  quizAnswers: Record<string, string>;
  profile: DNAProfile | null;
  quizStep: number;
  setAnswer: (step: string, answer: string) => void;
  nextStep: () => void;
  submitQuiz: () => Promise<void>;
}
```

---

## 10. Final Build Instructions

### Build Order (Follow Exactly)

```
Phase 1 — Foundation (Day 1)
  □ Project setup (Next.js + TS + Tailwind + shadcn)
  □ Design tokens in globals.css (all CSS variables)
  □ Install all dependencies
  □ Navbar + PageTransition + GlassCard components
  □ Claude API service (lib/claude.ts)
  □ Fragella API service (lib/fragella.ts)
  □ Zustand stores

Phase 2 — Shared Components (Day 1-2)
  □ ScoreGauge component (Prompt 8)
  □ NotesPyramid component (Prompt 10)
  □ Display Cards from 21st.dev (already provided)
  □ ShaderBackground (Prompt 1) — even a CSS fallback is fine to start

Phase 3 — Core Modules (Day 2-4)
  □ ScentDNA — quiz flow + result profile + DNA helix (Prompt 5)
  □ DupeShield — search + card stack results (Prompt 3) + comparison modal
  □ ScentMoment — occasion grid (Prompt 7) + AI flow + story card
  □ ScentCulture — world map (Prompt 6) + editorial report (Prompt 4)

Phase 4 — Homepage (Day 4-5)
  □ Shader hero (Prompt 1)
  □ Scroll feature section (Prompt 2)
  □ Stats ticker
  □ Module preview cards

Phase 5 — Complementary Modules (Day 5-7)
  □ ScentSnap
  □ ScentLayer
  □ ScentCircle
  □ ScentSocial

Phase 6 — Polish (Day 7-8)
  □ Page transitions (Prompt 9)
  □ Magnetic cards (Prompt 7)
  □ All empty states with illustrations
  □ Mobile responsiveness (375px minimum)
  □ Seed mock data for all community features
```

### Critical Rules

1. **Use Stitch MCP first** — generate all designs via Stitch before writing component code
2. **All 4 core modules** (DupeShield, ScentCulture, ScentMoment, ScentDNA) must be fully functional before any complementary module
3. **Fragella API** is the single source of truth for all fragrance data — never hardcode fragrance info
4. **pgvector in Supabase** powers DupeShield similarity — set this up in Phase 1 or DupeShield won't work
5. **Every page** must be wrapped in `<PageTransition>` 
6. **Mobile first** — design and build for 375px, scale up
7. **No blank states** — every loading, empty, and error state has a beautiful visual
8. **Console.log** all Claude API responses during development
9. **Run with:** `npm run dev` — must work out of the box after `npm install`

---

## Monetization

| Revenue Stream | Price | Module |
|---|---|---|
| OLFRA Premium | $9.99/mo | Full ScentDNA, unlimited DupeShield, ScentCulture data |
| DupeShield Brand Pro | $299/mo | B2B brand monitoring + threat reports |
| ScentCulture Enterprise | $999/mo | Full API access to trend data |
| ScentCircle Transaction Fee | 5% per trade | ScentCircle |
| Creator Brand Deals | 15% facilitation | ScentSocial |

---

*OLFRA™ — Built with Claude Sonnet 4.6 + Fragella API + Stitch MCP*  
*Brand name: OLFRA — derived from "olfactory", not currently registered or used on the web*