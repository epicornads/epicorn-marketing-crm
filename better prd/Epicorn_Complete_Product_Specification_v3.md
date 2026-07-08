# Epicorn MVP – Complete Product Specification

## Product Vision

**Epicorn** is an AI-powered marketing web app that converts a brand's website into on-brand static advertisements.

**Tagline:** Turn your website into ads in under a minute.

**Core Flow:**

```text
Paste URL → Analyze Brand → Generate Ads → Edit → Export
```

---

# 1. Product Overview

Epicorn combines the best parts of Google Labs' Pomilie and Canva:

- Extract brand identity from a website URL.
- Generate AI-powered static ads.
- Provide a lightweight Canva-like editor.
- Export ready-to-run marketing creatives.

---

# 2. Target Users

- Local businesses
- Marketing agencies
- Freelancers
- D2C brands
- Solo marketers

---

# 3. Core Value Proposition

Paste your website URL and receive ready-to-run, editable ads in under a minute.

---

# 4. Key Features

## Brand Analysis
- Logo extraction
- Color extraction
- Font extraction
- Website image extraction
- Offers and deals extraction
- Testimonials extraction
- Brand tone detection
- Product and service extraction

## AI Ad Generation
- Generate 3 ad variations:
  - Offer-focused
  - Benefit-focused
  - Testimonial-focused

## Canva-like Editor
- Edit text
- Change font
- Change colors
- Replace images
- Move elements
- Resize elements
- Delete elements
- Add text boxes
- Upload images
- Upload custom elements

## Text Regeneration
- Regenerate headline
- Regenerate CTA
- Regenerate offers

## Platform Support
- Instagram Post
- Instagram Story
- Instagram Square
- Facebook Feed
- LinkedIn Post

## Export
- PNG
- JPG
- PDF

---

# 5. User Flow

```text
Google Login
      ↓
Paste Website URL
      ↓
Website Analysis
      ↓
Brand Extraction
      ↓
Review Brand Kit
      ↓
Generate 3 Ads
      ↓
Edit in Canva-like Editor
      ↓
Resize
      ↓
Export
```

---

# 6. Inputs

## Required
- Website URL

## Optional
- Prompt

Examples:
- Make it premium
- Create Diwali sale ads
- Use black and gold theme

## Optional Uploads
- Logo
- Product images
- Brand guidelines
- Additional assets

---

# 7. Technical Architecture

```text
Frontend (Next.js)
        ↓
API Gateway (FastAPI)
        ↓
----------------------------------
Authentication Service
Brand Analysis Service
AI Generation Service
Editor Service
Project Service
Export Service
----------------------------------
        ↓
PostgreSQL
Redis
AWS S3
```

---

# Service Responsibilities

## Authentication Service
- Google Login
- Session Management
- User Profile

## Brand Analysis Service
- Website scraping
- Screenshot generation
- Brand extraction

## AI Generation Service
- AI copy generation
- AI image generation
- Layout generation

## Editor Service
- Layer management
- Canvas editing
- Resize engine

## Export Service
- PNG export
- JPG export
- PDF export

---

# System Flow

```text
Website URL
      ↓
Website Screenshot
      ↓
Website Scraping
      ↓
Brand Extraction
      ↓
AI Copy Generation
      ↓
AI Image Generation
      ↓
Template Engine
      ↓
Editable Canvas
      ↓
Export
```

---

# 8. Recommended Tech Stack

## Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Fabric.js
- Zustand

## Backend
- supabase

## Database
-  Supabase Edge Functions OR Railway

## Storage
- Supabase Free

## Authentication
- Google OAuth

## AI Models

### Text
- Text AI: Gemini Free

### Images
- FLUX.1 Dev
- Stable Diffusion XL (optional)

### Scraping
- Playwright
- Beautiful Soup

---

# 9. Database Schema

## users

```sql
id
email
name
avatar
created_at
```

## brands

```sql
id
user_id
website_url
name
logo_url
tone
created_at
```

## brand_colors

```sql
id
brand_id
hex_code
is_primary
```

## brand_fonts

```sql
id
brand_id
font_name
```

## assets

```sql
id
brand_id
type
url
created_at
```

Asset Types:
- logo
- image
- ai_image
- upload

## projects

```sql
id
user_id
brand_id
name
platform
status
created_at
updated_at
```

## ads

```sql
id
project_id
type
angle
headline
cta
canvas_json
image_url
created_at
```

Angles:
- offer
- benefit
- testimonial

## generations

```sql
id
user_id
project_id
credits_used
created_at
```

## exports

```sql
id
project_id
format
url
created_at
```

---

# 10. API Specifications

## Authentication

```http
POST /auth/google
GET /auth/me
POST /auth/logout
```

## Brands

```http
POST /brands/analyze
GET /brands
GET /brands/{id}
PUT /brands/{id}
```

## Assets

```http
POST /assets/upload
DELETE /assets/{id}
```

## Projects

```http
POST /projects
GET /projects
GET /projects/{id}
DELETE /projects/{id}
```

## Generate Ads

```http
POST /generate
```

Request:

```json
{
  "brandId": 1,
  "platforms": ["instagram","facebook"],
  "prompt": "Make it premium"
}
```

## Regenerate Text

```http
POST /ads/{id}/headline
POST /ads/{id}/cta
POST /ads/{id}/offer
```

## Canvas

```http
GET /ads/{id}/canvas
PUT /ads/{id}/canvas
```

## Export

```http
POST /export/png
POST /export/jpg
POST /export/pdf
```

---

# 11. User Stories & Acceptance Criteria

## Story 1
As a marketer, I want to paste a website URL so I can generate ads quickly.

### Acceptance Criteria
- URL accepted.
- Website analyzed.
- Ads generated.

---

## Story 2
As a user, I want to edit generated ads.

### Acceptance Criteria
- Text editable.
- Images replaceable.
- Colors editable.
- Fonts editable.

---

## Story 3
As a user, I want to export my ads.

### Acceptance Criteria
- PNG export works.
- JPG export works.
- PDF export works.

---

## Story 4
As a user, I want my brand remembered.

### Acceptance Criteria
- Brand kit saved.
- Projects saved.
- Assets saved.

---

# 12. Detailed UI Wireframes

## Dashboard

```text
------------------------------------------------
Logo
Recent Projects
Brands
Assets
New Project
------------------------------------------------
```

## New Project

```text
------------------------------------------------
Website URL
Optional Prompt
Generate Button
------------------------------------------------
```

## Brand Review

```text
------------------------------------------------
Logo
Colors
Fonts
Images
Offers
Tone
Edit
Continue
------------------------------------------------
```

## Generated Ads

```text
------------------------------------------------
Ad 1
Ad 2
Ad 3
------------------------------------------------
```

## Editor

```text
------------------------------------------------
Toolbar
------------------------------------------------
Layers
Canvas
Properties
------------------------------------------------
Text
Images
Elements
Uploads
Brand Kit
------------------------------------------------
```

## Export

```text
PNG
JPG
PDF
```

---

# 13. AI Workflow

## Step 1
Take website screenshot.

## Step 2
Extract:
- Logo
- Colors
- Fonts
- Products
- Offers
- Testimonials
- Images
- Tone

## Step 3
Generate:
- Headlines
- CTA
- Captions
- Offers

## Step 4
Generate AI images:
- Product hero image
- Lifestyle image
- Promotional image

## Step 5
Build:
- Offer ad
- Benefit ad
- Testimonial ad

---

# 14. Dashboard Structure

```text
Brand Kit
Generated Ads
Saved Projects
Asset Library
Previous Campaigns
```

---

# 15. Performance Goals

- First ad generated in under 60 seconds.
- High-resolution exports.
- Platform-specific creatives.
- Persistent brand memory.

---

# 16. Non-Goals (MVP)

- Video ads
- Carousel ads
- Team collaboration
- Social scheduling
- Advanced analytics
- Full Canva replacement

---

# 17. Build Roadmap for AI Coding Tools

## Phase 1
Authentication.

## Phase 2
Database.

## Phase 3
Website scraping.

## Phase 4
Brand extraction.

## Phase 5
AI copy generation.

## Phase 6
AI image generation.

## Phase 7
Template engine.

## Phase 8
Canva editor.

## Phase 9
Export system.

## Phase 10
Dashboard.

## Phase 11
Payments.

---

# Suggested Timeline

## Week 1
- Auth
- Database
- Dashboard

## Week 2
- Website scraper
- Brand extraction

## Week 3
- AI copy generation

## Week 4
- AI image generation

## Week 5
- Ad template engine

## Week 6
- Canva editor

## Week 7
- Export system

## Week 8
- Testing and deployment

---

# Final Product Statement

**Epicorn**

Turn your website into ads in under a minute.

Paste your URL → AI understands your brand → Generate platform-specific static ads → Edit → Export.


---

# 18. Infrastructure & Cost Strategy (MVP)

## Frontend
- Platform: Vercel
- Plan: Free Tier

## Database
- Platform: Supabase PostgreSQL
- Plan: Free Tier

## Authentication
- Platform: Supabase Auth + Google OAuth
- Plan: Free Tier

## File Storage
- Platform: Supabase Storage
- Plan: Free Tier

## Backend API
- Platform: Railway (initially) or Supabase Edge Functions
- Plan: Free Tier

## Caching & Queue
- Platform: Upstash Redis
- Plan: Free Tier

## Text AI
- Platform: Google Gemini API
- Plan: Free Tier

## Image Generation

### Development Phase
- FLUX API free credits (if available).

### Production Phase
- Self-host FLUX.1 Dev or Stable Diffusion XL on a GPU server.

## Monitoring
- Sentry Free Tier
- PostHog Free Tier

## Estimated Monthly Costs

### Validation Stage (0–100 users)
- Approximate cost: ₹0–₹2,000/month

### Early Traction (100–1,000 users)
- Approximate cost: ₹5,000–₹20,000/month

### Scale
- Main cost driver: AI image generation volume.

---

# 19. Cost Risks & Optimization Strategy

The largest operating expense for Epicorn is AI image generation.

## Cost Control Rules
1. Generate only 3 ad variations per request.
2. Cache generated assets whenever possible.
3. Reuse extracted brand assets.
4. Limit free users to 10 generations.
5. Introduce paid plans before high-scale usage.

## Recommended MVP Infrastructure

```text
Frontend: Vercel Free
Database: Supabase Free
Authentication: Supabase Free
Storage: Supabase Free
Backend: Railway Free or Supabase Edge Functions
Redis: Upstash Free
Text AI: Gemini Free Tier
Images: FLUX API credits initially
```

This stack allows Epicorn to launch and validate the idea at extremely low cost before upgrading infrastructure.
