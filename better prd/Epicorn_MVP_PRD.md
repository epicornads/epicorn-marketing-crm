# Epicorn PRD (MVP)

## Product Name
**Epicorn**

## Tagline
**Turn your website into ads in under a minute.**

---

# 1. Product Vision

Epicorn is an AI-powered marketing web app that turns any brand website into on-brand, editable static ads.

Users simply paste their website URL. Epicorn analyzes the brand, extracts its identity, and generates ready-to-use static ad creatives that can be edited inside a lightweight Canva-like editor.

---

# 2. Problem Statement

Small businesses and marketers struggle to create high-quality ad creatives because:

- Hiring designers is expensive.
- Canva still requires design skills.
- Creating ads from scratch takes time.
- Maintaining brand consistency is difficult.

Epicorn solves this by automatically understanding a brand and generating ads instantly.

---

# 3. Core Value Proposition

**Paste your website → Get on-brand ads in under a minute.**

---

# 4. Target Users

## Primary Users
- Local businesses
- Marketing agencies
- Freelancers
- D2C brands
- Small businesses

---

# 5. Success Metric

Primary KPI:

- User exports first ad within 1 minute.

Secondary KPIs:

- Number of ads generated
- Export rate
- Project save rate
- Returning users

---

# 6. MVP Scope

## Input
- Website URL only
- Optional prompt field
- Optional asset uploads

Examples:

- "Make it premium."
- "Create a Diwali campaign."
- "Focus on our new collection."

---

# 7. Website Analysis

Epicorn scans the homepage and extracts:

## Brand Assets
- Logo
- Brand colors
- Fonts
- Images
- Product photos
- Icons

## Brand Communication
- Headlines
- Offers
- Discounts
- Product information
- Testimonials
- Tone of voice
- CTAs
- Key messages
- Benefits

---

# 8. Missing Assets Flow

If scraping fails:

1. Notify user.
2. Ask user to upload:
   - Logo
   - Product photos
   - Brand guidelines
   - Images
3. Continue generation.

---

# 9. Brand Review Step

After extraction, user reviews:

- Logo
- Colors
- Fonts
- Images
- Offers
- Brand tone

User can edit these before generation.

---

# 10. AI Generation

Generate:

- 3 ad variations.

### Variation 1
Offer-focused

### Variation 2
Benefit-focused

### Variation 3
Testimonial-focused

---

# 11. AI Models

Hybrid approach:

## APIs
- LLM for copywriting and reasoning.

## Open Source Models
- Text-to-image generation.
- Image recreation.
- Style transfer.

---

# 12. Image Generation Rules

Priority:

1. Generate AI images inspired by website assets.
2. Recreate website visual style.
3. Create entirely new marketing visuals if needed.

---

# 13. Platform-Specific Ad Sizes

## Supported Platforms

### Instagram Post
1080 × 1350

### Instagram Story
1080 × 1920

### Instagram Square
1080 × 1080

### Facebook Feed
1200 × 628

### LinkedIn Post
1200 × 627

---

# 14. Generated Copy

Generate:

- Headlines
- Offers
- CTA text
- Captions

---

# 15. Editor (Lightweight Canva)

## User can:

- Edit text
- Change fonts
- Change colors
- Replace images
- Move elements
- Resize elements
- Delete elements
- Add text boxes
- Upload images
- Upload assets
- Add shapes

---

# 16. Regeneration Features

User can regenerate:

- Headlines
- CTA
- Offers

No image regeneration inside editor for MVP.

---

# 17. Resize Feature

One-click resize into:

- Instagram Post
- Story
- Square
- Facebook Feed
- LinkedIn Post

---

# 18. Export

Formats:

- PNG
- JPG
- PDF

High-resolution exports supported.

---

# 19. Authentication

- Google Sign-In only.

---

# 20. Pricing

## Free Plan
- 10 generations
- 1 brand kit
- Basic exports

## Paid Plan (Future)
- Unlimited generations
- Multiple brands
- Premium templates
- Higher limits

---

# 21. Dashboard

## Sections

- Brand Kit
- Generated Ads
- Saved Projects
- Assets Library
- Previous Campaigns

---

# 22. User Flow

1. Sign in with Google
2. Paste website URL
3. Epicorn analyzes homepage
4. Extract brand DNA
5. User reviews extracted data
6. Generate 3 ads
7. Edit inside editor
8. Resize if needed
9. Download assets

---

# 23. Performance Goal

Target:

**Generate first ads in under 60 seconds.**

---

# 24. Non-Goals (MVP)

Not included:

- Video ads
- Carousel ads
- Advanced Canva replacement
- Team collaboration
- Social scheduling
- Publishing tools
- Advanced analytics

---

# 25. Future Roadmap

Phase 2:

- Video ads
- Carousel generation
- Team workspaces
- Campaign management
- AI brand strategist
- Direct publishing
- Analytics dashboard

---

# Product Summary

**Epicorn is an AI-powered static ad generator that transforms a website into editable, platform-specific, on-brand ad creatives in under a minute.**
