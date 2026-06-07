
## Goal
Build the home page of your website from your Figma designs (desktop + mobile), and connect it to a new Shopify development store so products/cart/checkout are real.

## Steps

1. **You upload screenshots** — desktop view and mobile view of the home page as PNG exports from Figma. (You can also export any logo, hero images, or icons as separate PNG/SVG files so I use the real assets.)

2. **Set up the design system**
   - Extract colors, typography, spacing, and radii from the screenshots
   - Define them as semantic tokens in `src/styles.css` (oklch) so the whole site stays consistent

3. **Build the home page** at `src/routes/index.tsx`
   - Match the desktop layout exactly
   - Responsive breakpoints to match the mobile design
   - Real images for hero/sections (generated or from your uploads)
   - Proper SEO head tags (title, description, og:image)

4. **Enable Shopify** (new development store)
   - Free while you build; 30-day trial starts only when you "claim" it; paid plan required to actually sell
   - After it's enabled, I'll wire the home page to pull real products (e.g. featured collection) from your Shopify store

5. **Verify** — preview on desktop and mobile viewports, fix any layout/visual issues against your screenshots

## Out of scope for this first pass
Product listing page, product detail, cart, checkout, About, Contact — we'll add those in follow-up turns once the home page looks right.

## Next action
Upload the desktop + mobile home page screenshots and approve this plan.
