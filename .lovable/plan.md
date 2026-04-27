

## Plan: Overhaul Arch Geometry + Shape-Specific Controls

### File: `src/components/PlateConfigurator.tsx`

### 1. Gothic Arch — True Sharp Apex with Cubic Beziers

**Current problem:** Lines 59-63 use quadratic bezier (`Q`) curves that meet at the top center with a rounded transition — no sharp point.

**Fix:** Replace with two cubic bezier (`C`) curves that converge to a single sharp apex point at `(x + aw/2, y)`. The control points determine steepness:

```text
  Sharp apex ──► (cx, y)
     /    \
    /      \    ← Two cubic bezier curves
   /        \      meeting at the exact same point
  /          \
(x, bottom)  (x+aw, bottom)
```

- New `gothicPointiness` state (0–100, default 70)
- Path formula: `M x,bottom L x,y+ah*transitionFrac C x,y+cpY  cx,y  cx,y C cx,y  x+aw,y+cpY  x+aw,y+ah*transitionFrac L x+aw,bottom`
- `transitionFrac` derived from pointiness: lower pointiness = wider curves, higher = steeper
- The apex is always the single point `(x+aw/2, y)` — guaranteed sharp regardless of slider value

### 2. Double Shoulder Arch — Configurable Large Radius

**Current problem:** `shoulderRadius` uses `aw * 0.2` = 16cm for 80cm width — too small/subtle.

**Fix:**
- Add `shoulderRadiusValue` state (range: 5 to `aw/2`, default 20cm)
- Remove `SHOULDER_R_RATIO` constant and `shoulderRadius()` function
- Use `Math.min(shoulderRadiusValue, aw/2, ah*0.4)` directly in all path calculations
- Update `archPaths`, `ceilingPath`, `leftWallTopY`, and `getShelfWidthAtY` to use the new value

### 3. `getShelfWidthAtY` — Accurate for Cubic Bezier Gothic

**Current problem:** Line 111-118 uses a rough linear/sqrt approximation that doesn't match cubic beziers.

**Fix for Gothic:** Numerically solve the cubic bezier x-coordinate at each Y level. Use a simple iterative approach:
- For a given `relY`, compute the parametric `t` where the bezier reaches that Y
- Evaluate the bezier x at that `t` for left curve, mirror for right
- Shelf width = right_x - left_x
- This ensures shelves never bleed through the curved walls

**Shoulder:** Already correct (circle-based inset calculation), just swap `shoulderRadius()` calls for the state value.

### 4. Conditional UI Controls

After the "Vorm Niche" selector (line 540), add:

- **Gothic selected:** `Slider` labeled "Scherpte Punt" (0–100, default 70) + `NumberInput`
- **Shoulder selected:** `Slider` + `NumberInput` labeled "Hoek Radius (cm)" (5 to aw/2, default 20)

Import `Slider` from `@/components/ui/slider`.

### 5. Default Values

Already correct (120x250x40 cabinet, 80x200 niche, position 20/50). Add:
- `gothicPointiness: 70`
- `shoulderRadiusValue: 20`

### 6. Consistency Preserved

- All shapes: open bottom path (no `Z`, no bottom segment)
- Shelves: `#FFFFFF`, `fillOpacity={1}`, `#666666` front stroke
- Dimension lines: `#000000`, `fontWeight={900}`
- Height arrows: `orient="0"` / `orient="180"` (vertical)
- `ceilingPath` and `leftWallTopY` updated for new geometry

### Summary of Changes

- ~15 lines: new state + imports (`Slider`)
- ~30 lines: rewritten `archPaths` gothic/shoulder branches
- ~20 lines: rewritten `getShelfWidthAtY` gothic branch (bezier solver)
- ~5 lines: updated `ceilingPath`, `leftWallTopY`, rod position helpers
- ~20 lines: conditional UI controls in the Boog Afmetingen card
- Remove `SHOULDER_R_RATIO` and `shoulderRadius()` function

