# Design System Specification: The Dignified Interface



## 1. Overview & Creative North Star

**Creative North Star: "The Editorial Companion"**



This design system rejects the "infantilization" often found in elderly-focused software. Instead of oversized primary colors and toy-like widgets, we embrace a high-end editorial aesthetic. We treat the interface like a premium broadsheet newspaper or a luxury concierge book—calm, authoritative, and spacious.



The system breaks the "template" look by utilizing **intentional asymmetry** and **tonal layering**. We avoid rigid grids in favor of organic groupings. By using large-scale typography and a sophisticated, muted palette, we provide a "serene clarity" that empowers the user without overwhelming their cognitive load.



---



## 2. Colors & Surface Philosophy

The palette is rooted in organic, earthy tones—warm beiges (`#fbf9f4`) and deep charcoals (`#191919`)—interrupted by a sophisticated "Intellectual Purple" (`#6b5870`).



### The "No-Line" Rule

**Traditional 1px borders are strictly prohibited.** To separate sections, designers must use background color shifts.

- Use `surface` for the main canvas.

- Use `surface_container_low` for secondary information blocks.

- Use `surface_container_highest` for the most prominent interactive cards.

*This creates a layout that feels carved from a single piece of stone rather than a collection of boxes.*



### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers.

- **Base Layer:** `surface` (#fbf9f4).

- **Secondary Layer:** `surface_container` (#f0eee9) for sidebars or secondary navigation.

- **Top Layer:** `surface_container_lowest` (#ffffff) for the active chat bubble or primary input area.



### Glass & Gradient Rule

For the AI's response bubbles, use a "Frosted Glass" effect:

- **Background:** `secondary_container` (#f1d8f4) at 80% opacity.

- **Effect:** `backdrop-blur: 12px`.

- **Polish:** A subtle linear gradient from `primary` to `primary_container` should be reserved exclusively for the "Send" button or "Start Call" actions to give them a tactile, premium weight.



---



## 3. Typography

We use two sans-serif faces to balance modern utility with approachable warmth. **Manrope** provides a geometric, sturdy foundation for headings, while **Public Sans** ensures maximum legibility for long-form AI responses.



* **Display (Manrope):** Used for welcome screens and key milestones. `display-lg` (3.5rem) ensures the user is never lost.

* **Headline (Manrope):** `headline-lg` (2rem) for section titles. Use high contrast (`on_surface`) to command attention.

* **Body (Public Sans):** Our minimum body size is `body-lg` (1rem / 16px-18px equivalent). **Never go below 18px for functional text.**

* **Leading:** All body text must use a generous line height (1.6x) to assist users with visual tracking difficulties.



---



## 4. Elevation & Depth

Depth is a functional tool for accessibility, not just a decoration.



### The Layering Principle

Instead of shadows, stack your tokens:

- **Level 0:** `surface`

- **Level 1:** `surface_container_low`

- **Level 2:** `surface_container_high` (Creates a "lifted" effect for cards)



### Ambient Shadows

When a component must float (e.g., a voice-activation FAB), use an **Ambient Shadow**:

- `box-shadow: 0 20px 40px rgba(27, 28, 25, 0.06);` (using the `on_surface` color at 6% opacity). Large blur, very low density.



### The "Ghost Border" Fallback

If contrast testing fails on a specific edge, use a **Ghost Border**:

- `1px solid rgba(122, 117, 124, 0.15)` (using the `outline` token at 15% opacity).



---



## 5. Components



### Large Descriptive Buttons

Buttons are the primary way our users express intent.

- **Primary:** `primary` background with `on_primary` text. Use `xl` (0.75rem) roundedness.

- **Padding:** Minimum `vertical: 5` (1.7rem) and `horizontal: 8` (2.75rem).

- **Requirement:** Every button must have a `label-md` sub-text if the action is complex (e.g., "Delete" should have a sub-label "This cannot be undone").



### Chat Bubbles (The Signature Component)

- **User Bubbles:** `surface_container_highest` with `on_surface` text. Aligned right.

- **AI Bubbles:** `secondary_container` with a subtle 4px left-border of `secondary`. This provides a visual anchor for the "Guide" or "Assistant" voice.



### Input Fields

- **State:** `surface_container_lowest` background.

- **Focus State:** Instead of a thin line, the entire background shifts to `secondary_fixed_dim`. This creates a massive, undeniable visual cue that the field is active.

- **Font:** Always use `title-lg` for active input to ensure the user can see what they are typing.



### Cards & Lists

**Strictly no dividers.**

- Separate list items using `spacing: 4` (1.4rem) of vertical white space.

- Use `surface_variant` backgrounds for alternating list items if the list exceeds 5 items.



---



## 6. Do's and Don'ts



### Do:

- **DO** use white space as a structural element. If in doubt, increase spacing by one tier on the scale.

- **DO** use the `secondary` purple for "Humanizing" elements (AI suggestions, help icons, tooltips).

- **DO** ensure all touch targets are at least 60px x 60px.



### Don't:

- **DON'T** use icons without text labels. An icon alone is a cognitive "riddle" for many elderly users.

- **DON'T** use pure black (#000). Use `primary` (#191919) to avoid harsh optical vibration.

- **DON'T** use standard "toast" notifications that disappear. Use persistent "Message Bars" that require an explicit "Understood" tap.



### Accessibility Note

This system is designed to exceed **WCAG 2.1 AAA** requirements. The contrast ratio between `on_surface` and `surface` is curated for maximum legibility under low-light or high-glare conditions typical of mobile use by seniors.