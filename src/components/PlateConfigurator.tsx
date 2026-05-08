import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { RotateCcw, Plus, Minus, Check, Info, ArrowLeftRight } from "lucide-react";
import { Delete } from "lucide-react";
import { toast } from "sonner";
import verlichtingThumb from "@/assets/verlichting-thumb.jpg";
import roedeZwartThumb from "@/assets/roede-zwart-thumb.jpg";
import roedeWitThumb from "@/assets/roede-wit-thumb.webp";

type ArchType = "classic" | "gothic" | "shoulder";

/* ─── Types ─── */
interface Dims { width: number; height: number; depth: number; }
interface Position { x: number; y: number; }
interface ArchShape { width: number; height: number; position: Position; }

/* ─── Defaults (all in cm) ─── */
const DEFAULT_CABINET: Dims = { width: 120, height: 250, depth: 40 };
const DEFAULT_ARCH: ArchShape = { width: 80, height: 200, position: { x: 20, y: 50 } };
const SHELF_THICKNESS = 7;
const ROD_DIAMETER = 3.2;
const ROD_PRICE = 15;
const LIGHT_PRICE = 50;
const LIGHT_DIAMETER = 4.2;

/* ─── Finished MDF panels (zichtbare zij- en achterwanden) ─── */
/* Prijs per m² voor afgewerkte matwit MDF panelen, incl. afwerking */
const MDF_PRICE_PER_M2 = 65;

type Placement = "between" | "oneWall" | "standalone";
function placementFromSides(left: boolean, right: boolean): Placement {
  if (left && right) return "standalone";
  if (left || right) return "oneWall";
  return "between";
}

/* ─── Niche wall colors (vtwonen earthy tones) ─── */
const NICHE_COLORS = [
  { name: "Zandduinen", hex: "#D4C5A9" },
  { name: "Ochtendmist", hex: "#C8CFC4" },
  { name: "Leisteen", hex: "#7A8A8C" },
  { name: "Terra", hex: "#C17A5A" },
  { name: "Grafiet", hex: "#3D3D3D" },
];

/* ─── Colors: matte white MDF on warm canvas ─── */
const COL = {
  front: "#F0EDE6",
  frontStroke: "#C9C3B6",
  side: "#E8E4DC",
  top: "#EDEAE3",
  nicheBack: "#E8E4DC",
  nicheWall: "#E2DED5",
  nicheCeiling: "#DED9D0",
  nicheFloor: "#E4E0D7",
  shelf: "#ECEAE3",
  shelfSide: "#DED9D0",
  shelfTop: "#ECEAE3",
  shelfFrontStroke: "#B8B2A4",
  shelfStroke: "#D4C9B8",
  rod: "#B08D5B",
  dim: "#1C1C1A",
};

/* ─── Gothic ogive: strict R=W formula (radius equals niche width) ─── */
/* Cap height from R=W: H = W * √3/2 ≈ 0.866 * W */
function gothicCapHeight(archWidth: number, archHeight: number): number {
  return Math.min(archWidth * Math.sqrt(3) / 2, archHeight * 0.95);
}
function gothicShelfWidth(relY: number, archWidth: number, capH: number): number {
  // Below springline → full width
  if (relY >= capH) return archWidth;
  const R = archWidth;
  const rise = capH - relY;
  if (rise >= capH) return 0;
  // Two circle arcs: centers at (0, capH) and (W, capH), both radius W
  // width = 2*sqrt(R² - rise²) - W
  const disc = R * R - rise * rise;
  if (disc <= 0) return 0;
  return Math.max(0, 2 * Math.sqrt(disc) - archWidth);
}

/* ─── Path generators ─── */
function archPaths(type: ArchType, ax: number, ay: number, aw: number, ah: number, offX = 0, offY = 0, gothicPointiness = 70, shoulderR = 20) {
  const x = ax + offX, y = ay + offY;
  const bottom = y + ah;
  let closed: string, open: string;

  if (type === "gothic") {
    const R = aw;
    const capH = gothicCapHeight(aw, ah);
    const springY = y + capH;
    const cx = x + aw / 2;
    closed = `M ${x} ${bottom} L ${x} ${springY} A ${R} ${R} 0 0 1 ${cx} ${y} A ${R} ${R} 0 0 1 ${x + aw} ${springY} L ${x + aw} ${bottom} Z`;
    open = `M ${x} ${bottom} L ${x} ${springY} A ${R} ${R} 0 0 1 ${cx} ${y} A ${R} ${R} 0 0 1 ${x + aw} ${springY} L ${x + aw} ${bottom}`;
  } else if (type === "shoulder") {
    const sr = Math.min(shoulderR, aw / 2, ah * 0.4);
    closed = `M ${x} ${bottom} L ${x} ${y + sr} A ${sr} ${sr} 0 0 1 ${x + sr} ${y} L ${x + aw - sr} ${y} A ${sr} ${sr} 0 0 1 ${x + aw} ${y + sr} L ${x + aw} ${bottom} Z`;
    open = `M ${x} ${bottom} L ${x} ${y + sr} A ${sr} ${sr} 0 0 1 ${x + sr} ${y} L ${x + aw - sr} ${y} A ${sr} ${sr} 0 0 1 ${x + aw} ${y + sr} L ${x + aw} ${bottom}`;
  } else {
    const r = aw / 2;
    closed = `M ${x} ${bottom} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + aw} ${y + r} L ${x + aw} ${bottom} Z`;
    open = `M ${x} ${bottom} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + aw} ${y + r} L ${x + aw} ${bottom}`;
  }
  return { closed, open };
}

function ceilingPath(type: ArchType, ax: number, ay: number, aw: number, ah: number, dx: number, dy: number, gothicPointiness = 70, shoulderR = 20): string {
  if (type === "shoulder") {
    const sr = Math.min(shoulderR, aw / 2, ah * 0.4);
    return `M ${ax},${ay + sr} A ${sr} ${sr} 0 0 1 ${ax + sr},${ay} L ${ax + aw - sr},${ay} A ${sr} ${sr} 0 0 1 ${ax + aw},${ay + sr} L ${ax + aw + dx},${ay + sr + dy} A ${sr} ${sr} 0 0 0 ${ax + aw - sr + dx},${ay + dy} L ${ax + sr + dx},${ay + dy} A ${sr} ${sr} 0 0 0 ${ax + dx},${ay + sr + dy} Z`;
  } else if (type === "gothic") {
    const R = aw;
    const capH = gothicCapHeight(aw, ah);
    const springY = ay + capH;
    const cx = ax + aw / 2;
    return `M ${ax},${springY} A ${R} ${R} 0 0 1 ${cx},${ay} A ${R} ${R} 0 0 1 ${ax + aw},${springY} L ${ax + aw + dx},${springY + dy} A ${R} ${R} 0 0 0 ${cx + dx},${ay + dy} A ${R} ${R} 0 0 0 ${ax + dx},${springY + dy} Z`;
  } else {
    const r = aw / 2;
    return `M ${ax},${ay + r} A ${r} ${r} 0 0 1 ${ax + aw},${ay + r} L ${ax + aw + dx},${ay + r + dy} A ${r} ${r} 0 0 0 ${ax + dx},${ay + r + dy} Z`;
  }
}

function leftWallTopY(type: ArchType, ax: number, ay: number, aw: number, ah: number, gothicPointiness = 70, shoulderR = 20): number {
  if (type === "shoulder") return ay + Math.min(shoulderR, aw / 2, ah * 0.4);
  if (type === "gothic") {
    return ay + gothicCapHeight(aw, ah);
  }
  return ay + aw / 2;
}

/* ─── Helpers ─── */
function getShelfWidthAtY(relY: number, archWidth: number, archType: ArchType = "classic", archHeight: number = 0, gothicPointiness = 70, shoulderR = 20): number {
  if (archType === "shoulder") {
    const sr = Math.min(shoulderR, archWidth / 2, archHeight * 0.4);
    if (relY >= sr) return archWidth;
    const d = sr - relY;
    if (d >= sr) return 0;
    const inset = sr - Math.sqrt(sr * sr - d * d);
    return Math.max(0, archWidth - 2 * inset);
  }
  if (archType === "gothic") {
    const capH = gothicCapHeight(archWidth, archHeight);
    return gothicShelfWidth(relY, archWidth, capH);
  }
  const r = archWidth / 2;
  if (relY >= r) return archWidth;
  const d = r - relY;
  if (d >= r) return 0;
  return 2 * Math.sqrt(r * r - d * d);
}

/* Cap height = vertical distance from arch top to where straight walls begin (springline).
   Shelves are only placed below this line so they keep the full arch width. */
function archCapHeight(archType: ArchType, archWidth: number, archHeight: number, shoulderR = 20): number {
  if (archType === "shoulder") return Math.min(shoulderR, archWidth / 2, archHeight * 0.4);
  if (archType === "gothic") return gothicCapHeight(archWidth, archHeight);
  return archWidth / 2;
}

function shelfPositions(count: number, archHeight: number, archWidth: number, archType: ArchType = "classic", gothicPointiness = 70, shoulderR = 20) {
  if (count <= 0) return [];
  const capH = archCapHeight(archType, archWidth, archHeight, shoulderR);
  // Shelves must stay below the arch springline → usable region is from capH to archHeight
  const usable = archHeight - capH;
  const available = usable - count * SHELF_THICKNESS;
  if (available <= 0) return [];
  const gap = available / (count + 1);
  const result: { relY: number; width: number }[] = [];
  for (let i = 1; i <= count; i++) {
    // relY measured from arch top; first shelf sits below the springline
    const topEdge = capH + gap * i + SHELF_THICKNESS * (i - 1);
    result.push({ relY: topEdge, width: archWidth });
  }
  return result;
}

function shelfUnitPrice(archWidthCm: number): number {
  if (archWidthCm < 60) return 50;
  if (archWidthCm <= 80) return 70;
  if (archWidthCm <= 110) return 90;
  return 120;
}

function archArea(w: number, h: number): number {
  const r = w / 2;
  return w * Math.max(0, h - r) + (Math.PI * r * r) / 2;
}

function sidePanelPrice(cab: Dims, visibleSides: number): number {
  const areaM2 = (cab.height * cab.depth) / 10000; // cm² → m²
  return visibleSides * areaM2 * MDF_PRICE_PER_M2;
}
function backPanelPrice(arch: ArchShape): number {
  const areaM2 = (arch.width * arch.height) / 10000;
  return areaM2 * MDF_PRICE_PER_M2;
}

function calcPrice(cab: Dims, arch: ArchShape, shelfCount: number, hasRod: boolean, hasLight: boolean, visibleSides: number, hasBack: boolean): number {
  const totalMDF = 2 * cab.height * cab.depth + cab.width * cab.depth + cab.width * cab.height + Math.max(0, cab.width * cab.height - archArea(arch.width, arch.height));
  const material = Math.ceil(totalMDF / 28000) * 75;
  const labor = totalMDF * 0.00907;
  const sides = sidePanelPrice(cab, visibleSides);
  const back = hasBack ? backPanelPrice(arch) : 0;
  return Math.round(material + labor + shelfCount * shelfUnitPrice(arch.width) + (hasRod ? ROD_PRICE : 0) + (hasLight ? LIGHT_PRICE : 0) + sides + back);
}

/* ─── Animated price counter hook ─── */
function useAnimatedPrice(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = prevRef.current;
    const diff = target - from;
    if (diff === 0) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + diff * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else prevRef.current = target;
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

/* ─── NumberInput (artisan minimal, with optional slider) ─── */
/* Values are stored in cm; UI displays mm (×10) for user-friendly precision. */
function NumberInput({ value, onChange, min, max, label, id, unit = "mm", disabled = false }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string; id: string; unit?: string; disabled?: boolean }) {
  // Display value in mm (cm * 10)
  const valueMm = value * 10;
  const minMm = min * 10;
  const maxMm = max * 10;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(valueMm));
  const [freshEntry, setFreshEntry] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openPad = () => {
    if (disabled) return;
    setDraft(String(valueMm));
    setFreshEntry(true);
    setOpen(true);
  };

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n) || raw.trim() === "") { setOpen(false); return; }
    const clampedMm = Math.max(minMm, Math.min(maxMm, Math.round(n)));
    if (Math.round(n) !== clampedMm) {
      setErrorMsg(`${Math.round(n)} mm valt buiten ons standaard bereik (${minMm}–${maxMm} mm). Deze maat is alleen op aanvraag mogelijk.`);
    } else {
      setErrorMsg(null);
    }
    const cm = Math.round(clampedMm / 10);
    onChange(Math.max(min, Math.min(max, cm)));
    setOpen(false);
  };

  const pressDigit = (d: string) => {
    setDraft((prev) => {
      if (freshEntry) {
        setFreshEntry(false);
        return d;
      }
      const next = (prev === "0" ? "" : prev) + d;
      return next.slice(0, 5);
    });
  };
  const pressBackspace = () => {
    setFreshEntry(false);
    setDraft((prev) => prev.slice(0, -1));
  };

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <Label htmlFor={id} className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          readOnly
          inputMode="none"
          value={valueMm}
          onFocus={(e) => e.currentTarget.blur()}
          onMouseDown={(e) => { e.preventDefault(); openPad(); }}
          onClick={openPad}
          disabled={disabled}
          className="input-artisan h-10 pr-10 text-sm font-light text-foreground tabular-nums cursor-pointer caret-transparent"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-muted-foreground/70 uppercase">{unit}</span>
      </div>
      {errorMsg && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setErrorMsg(null)}
        >
          <div
            role="alert"
            onClick={(e) => { e.stopPropagation(); setErrorMsg(null); }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[90vw] sm:max-w-sm cursor-pointer rounded-md border border-copper/40 bg-card text-foreground shadow-lg px-4 py-3 text-[11px] leading-relaxed tracking-wide animate-in fade-in-0 zoom-in-95"
          >
            <div className="text-[10px] font-medium tracking-[0.18em] uppercase text-copper mb-1">{label}</div>
            {errorMsg}
            <div className="mt-2 text-[10px] text-muted-foreground/70 italic">Klik om te sluiten</div>
          </div>
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in-0"
          onClick={() => commit(draft)}
        >
          <div
            className="w-full sm:max-w-sm bg-background border border-border rounded-t-lg sm:rounded-lg shadow-lg p-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">{label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`font-serif-display text-3xl tabular-nums transition-colors ${freshEntry ? "text-muted-foreground/40" : "text-foreground"}`}>
                  {draft === "" ? "0" : draft}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-muted-foreground/70">{unit}</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground/70 tracking-wider uppercase">
                {minMm} – {maxMm} {unit}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => pressDigit(d)}
                  className="h-14 rounded-md border border-border bg-card text-foreground font-serif-display text-2xl active:bg-secondary hover:border-copper transition-colors tabular-nums"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={pressBackspace}
                className="h-14 rounded-md border border-border bg-secondary text-foreground flex items-center justify-center active:bg-muted hover:border-copper transition-colors"
                aria-label="Backspace"
              >
                <Delete className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => pressDigit("0")}
                className="h-14 rounded-md border border-border bg-card text-foreground font-serif-display text-2xl active:bg-secondary hover:border-copper transition-colors tabular-nums"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => commit(draft)}
                className="h-14 rounded-md bg-primary text-primary-foreground flex items-center justify-center active:opacity-90 hover:bg-primary/90 transition-colors"
                aria-label="OK"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
type PlateConfiguratorProps = {
  initialCabinet?: Dims;
  initialArch?: ArchShape;
  onBack?: () => void;
};
const PlateConfigurator = ({ initialCabinet, initialArch, onBack }: PlateConfiguratorProps = {}) => {
  const startCabinet = initialCabinet ?? DEFAULT_CABINET;
  const startArch: ArchShape = initialArch ?? {
    width: Math.max(20, startCabinet.width - 40),
    height: Math.max(20, startCabinet.height - 50),
    position: { x: Math.max(0, (startCabinet.width - Math.max(20, startCabinet.width - 40)) / 2), y: 50 },
  };
  const [cabinet, setCabinet] = useState<Dims>({ ...startCabinet });
  const [arch, setArch] = useState<ArchShape>({ ...startArch, position: { ...startArch.position } });
  const [archType, setArchType] = useState<ArchType>("classic");
  const [shoulderRadiusValue, setShoulderRadiusValue] = useState(25);
  // Boog wordt standaard horizontaal gecentreerd in de kast
  const [centerArch, setCenterArch] = useState(true);
  const [shelfCount, setShelfCount] = useState(0);
  const [hasRod, setHasRod] = useState(false);
  const [rodFinish, setRodFinish] = useState<"zwart" | "wit">("zwart");
  const [hasLight, setHasLight] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [nicheColorIdx, setNicheColorIdx] = useState<number>(0);
  const [finishLeft, setFinishLeft] = useState(false);
  const [finishRight, setFinishRight] = useState(false);
  const [hasBack, setHasBack] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const archDimsRef = useRef<HTMLElement>(null);

  // Reservation modal state
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveSubmitted, setReserveSubmitted] = useState(false);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [resName, setResName] = useState("");
  const [resEmail, setResEmail] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resStreet, setResStreet] = useState("");
  const [resPostcode, setResPostcode] = useState("");
  const [resCity, setResCity] = useState("");
  const [resTerms, setResTerms] = useState(false);
  const [resErrors, setResErrors] = useState<{ name?: string; email?: string; street?: string; postcode?: string; city?: string; terms?: string }>({});

  const handleReserveOpen = () => {
    setReserveSubmitted(false);
    setResErrors({});
    setReserveOpen(true);
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; street?: string; postcode?: string; city?: string; terms?: string } = {};
    const name = resName.trim();
    const email = resEmail.trim();
    const street = resStreet.trim();
    const postcode = resPostcode.trim();
    const city = resCity.trim();
    if (!name) errors.name = "Vul je naam in";
    else if (name.length > 100) errors.name = "Naam mag max. 100 tekens zijn";
    if (!email) errors.email = "Vul je e-mailadres in";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Ongeldig e-mailadres";
    else if (email.length > 255) errors.email = "E-mailadres te lang";
    if (!street) errors.street = "Vul je straat en huisnummer in";
    else if (street.length > 150) errors.street = "Te lang";
    if (!postcode) errors.postcode = "Vul je postcode in";
    else if (postcode.length > 20) errors.postcode = "Te lang";
    if (!city) errors.city = "Vul je plaats in";
    else if (city.length > 100) errors.city = "Te lang";
    if (!resTerms) errors.terms = "Accepteer de algemene voorwaarden";
    if (resPhone.trim().length > 30) {
      // optional, just length check
    }
    if (Object.keys(errors).length > 0) {
      setResErrors(errors);
      return;
    }
    setResErrors({});
    setReserveSubmitting(true);
    // Backend (e-mailverzending) volgt in een latere stap.
    const visibleSides = (finishLeft ? 1 : 0) + (finishRight ? 1 : 0);
    const placementLabel =
      visibleSides === 0 ? "Tussen twee muren (geen afgewerkte zijkanten)" :
      visibleSides === 1 ? `Tegen één muur (${finishLeft ? "linkerzijde" : "rechterzijde"} afgewerkt)` :
      "Losstaand (beide zijkanten afgewerkt)";
    const summary = {
      cabinet,
      arch,
      archType,
      shelfCount,
      hasRod, rodFinish,
      hasLight,
      nicheColor: nicheColorIdx !== null ? NICHE_COLORS[nicheColorIdx].name : null,
      placement: placementLabel,
      placementExtra: Math.round(sidePanelPrice(cabinet, visibleSides)),
      hasBack,
      backExtra: hasBack ? Math.round(backPanelPrice(arch)) : 0,
      totalPrice,
      contact: { name, email, phone: resPhone.trim(), street, postcode, city },
    };
    console.log("[Reservering] samenvatting voor e-mail:", summary);
    await new Promise((r) => setTimeout(r, 400));
    setReserveSubmitting(false);
    setReserveSubmitted(true);
  };


  const padding = 80;
  const depthOffset = Math.min(cabinet.depth * 0.6, 40);
  const maxPreviewW = 600;
  const maxPreviewH = 700;
  const scale = Math.min(maxPreviewW / (cabinet.width + depthOffset), maxPreviewH / (cabinet.height + depthOffset), 3);
  const isPriceOnRequest = cabinet.height > 350 || cabinet.width > 300;

  const dx = depthOffset;
  const dy = -depthOffset;
  const dxS = dx * scale;
  const dyS = Math.abs(dy) * scale;
  const svgWidth = (cabinet.width + depthOffset) * scale + padding * 2;
  const svgHeight = (cabinet.height + depthOffset) * scale + padding * 2;

  /* ─── Clamping ─── */
  const clampArch = useCallback((a: ArchShape): ArchShape => {
    // Min margins: A (links) ≥ 50mm, B (rechts) ≥ 50mm, C (boven) ≥ 50mm, D (onder) ≥ 0mm
    const maxW = Math.max(10, cabinet.width - 10); // A + B ≥ 10cm
    const maxH = Math.max(10, cabinet.height - 5); // C ≥ 5cm; D mag 0
    const w = Math.min(a.width, maxW);
    const h = Math.min(a.height, maxH);
    const minX = 5;
    const maxX = Math.max(minX, cabinet.width - w - 5);
    const minY = 5;
    const maxY = Math.max(minY, cabinet.height - h);
    const x = Math.max(minX, Math.min(a.position.x, maxX));
    const y = Math.max(minY, Math.min(a.position.y, maxY));
    return { width: w, height: h, position: { x, y } };
  }, [cabinet.width, cabinet.height]);

  // Verlichting is niet mogelijk bij een gotische boog → automatisch uitschakelen
  useEffect(() => {
    if (archType === "gothic" && hasLight) setHasLight(false);
  }, [archType, hasLight]);

  useEffect(() => {
    setArch((prev) => {
      const c = clampArch(prev);
      const targetX = centerArch ? Math.max(0, (cabinet.width - c.width) / 2) : c.position.x;
      const next = { ...c, position: { ...c.position, x: targetX } };
      if (next.width !== prev.width || next.height !== prev.height || next.position.x !== prev.position.x || next.position.y !== prev.position.y) return next;
      return prev;
    });
  }, [clampArch, centerArch, cabinet.width, arch.width]);

  /* ─── Drag (pointer events for mouse + touch) ─── */
  const clientToCab = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    // Convert client px → viewBox units, then to cabinet cm coordinates
    const vbToPxX = rect.width / svgWidth;
    const vbToPxY = rect.height / svgHeight;
    const vbX = (clientX - rect.left) / vbToPxX;
    const vbY = (clientY - rect.top) / vbToPxY;
    return {
      x: (vbX - padding) / scale,
      y: (vbY - padding - dyS) / scale,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGPathElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGPathElement).setPointerCapture(e.pointerId);
    const { x: mx, y: my } = clientToCab(e.clientX, e.clientY);
    setDragOffset({ x: mx - arch.position.x, y: my - arch.position.y });
    setIsDragging(true);
    if (centerArch) setCenterArch(false);
    archDimsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    const { x: mx, y: my } = clientToCab(e.clientX, e.clientY);
    const cx = Math.max(5, Math.min(mx - dragOffset.x, Math.max(5, cabinet.width - arch.width - 5)));
    const cy = Math.max(5, Math.min(my - dragOffset.y, Math.max(5, cabinet.height - arch.height)));
    const cxR = Math.round(cx * 10) / 10;
    const cyR = Math.round(cy * 10) / 10;
    setArch((prev) => ({ ...prev, position: { x: cxR, y: cyR } }));
  }, [isDragging, dragOffset, arch.width, arch.height, cabinet.width, cabinet.height, scale, dyS, padding, svgWidth, svgHeight]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setArch((prev) => ({
      ...prev,
      position: {
        x: Math.round(prev.position.x * 10) / 10,
        y: Math.round(prev.position.y * 10) / 10,
      },
    }));
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleReset = () => {
    setCabinet({ ...startCabinet });
    setArch({ ...startArch, position: { ...startArch.position } });
    setArchType("classic"); setShelfCount(0); setHasRod(false); setRodFinish("zwart"); setHasLight(false);
    setShoulderRadiusValue(25); setNicheColorIdx(null);
    setFinishLeft(false); setFinishRight(false); setHasBack(false);
  };

  const updateCabinet = (key: keyof Dims, v: number) => {
    setCabinet((prev) => {
      const nextCab = { ...prev, [key]: v };
      if (key === "width") {
        const marginL = arch.position.x;
        const marginR = Math.max(0, prev.width - arch.width - arch.position.x);
        const newArchW = Math.max(10, v - marginL - marginR);
        setArch((pa) => clampArch({ ...pa, width: newArchW, position: { ...pa.position, x: Math.min(marginL, Math.max(0, v - newArchW)) } }));
      } else if (key === "height") {
        const marginT = arch.position.y;
        const marginB = Math.max(0, prev.height - arch.height - arch.position.y);
        const newArchH = Math.max(10, v - marginT - marginB);
        setArch((pa) => clampArch({ ...pa, height: newArchH, position: { ...pa.position, y: Math.min(marginT, Math.max(0, v - newArchH)) } }));
      }
      return nextCab;
    });
  };
  const updateArchDim = (key: "width" | "height", v: number) => setArch((prev) => clampArch({ ...prev, [key]: v }));
  const updateArchPos = (axis: "x" | "y", v: number) => {
    const min = axis === "x" ? 5 : 5; // A ≥ 5cm, C ≥ 5cm
    const max = axis === "x" ? cabinet.width - arch.width - 5 : cabinet.height - arch.height;
    setArch((prev) => ({ ...prev, position: { ...prev.position, [axis]: Math.max(min, Math.min(v, Math.max(min, max))) } }));
  };

  /* ─── SVG geometry ─── */
  const ax = arch.position.x, ay = arch.position.y, aw = arch.width, ah = arch.height;
  const gothicCapH = Math.max(1, Math.min(Math.round(aw * 0.375), ah - 1)); // Fixed 37.5% of width — classic ogive ratio
  const clampedShoulderR = Math.min(shoulderRadiusValue, aw / 2, ah * 0.4);

  const frontArch = archPaths(archType, ax, ay, aw, ah, 0, 0, gothicCapH, clampedShoulderR);
  const archPathClosed = frontArch.closed;
  const archPathOpen = frontArch.open;
  const frontFramePath = `M 0 0 H ${cabinet.width} V ${cabinet.height} H 0 Z ${archPathClosed}`;

  const backArch = archPaths(archType, ax, ay, aw, ah, dx, dy, gothicCapH, clampedShoulderR);
  const backArchPathClosed = backArch.closed;
  const backArchPathOpen = backArch.open;

  const ceilPath = ceilingPath(archType, ax, ay, aw, ah, dx, dy, gothicCapH, clampedShoulderR);
  const lwTopY = leftWallTopY(archType, ax, ay, aw, ah, gothicCapH, clampedShoulderR);

  const rodRelY = (archType === "shoulder" ? clampedShoulderR + 10 : archType === "gothic" ? Math.max(ah * 0.25, 15) : aw / 2 + 10);
  const rodWidth = getShelfWidthAtY(rodRelY, aw, archType, ah, gothicCapH, clampedShoulderR);
  const shelves = shelfPositions(shelfCount, ah, aw, archType, gothicCapH, clampedShoulderR);
  const visibleSides = (finishLeft ? 1 : 0) + (finishRight ? 1 : 0);
  const placement: Placement = placementFromSides(finishLeft, finishRight);
  const totalPrice = calcPrice(cabinet, arch, shelfCount, hasRod, hasLight, visibleSides, hasBack);
  const displayPrice = useAnimatedPrice(totalPrice);

  // Niche interior color
  const nicheBackColor = nicheColorIdx !== null ? NICHE_COLORS[nicheColorIdx].hex : COL.nicheBack;

  // Darken/lighten helpers for shading
  const shade = (hex: string, amount: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.max(0, Math.min(255, r + amount))},${Math.max(0, Math.min(255, g + amount))},${Math.max(0, Math.min(255, b + amount))})`;
  };

  const wallCol = nicheColorIdx !== null ? shade(NICHE_COLORS[nicheColorIdx].hex, -30) : COL.nicheWall;
  const ceilCol = nicheColorIdx !== null ? shade(NICHE_COLORS[nicheColorIdx].hex, -40) : COL.nicheCeiling;

  // Cabinet (front + 3D side/top) color follows interior selection — full meubel kleur
  const cabFrontCol = nicheColorIdx !== null ? NICHE_COLORS[nicheColorIdx].hex : COL.front;
  const cabSideCol  = nicheColorIdx !== null ? shade(NICHE_COLORS[nicheColorIdx].hex, -25) : COL.side;
  const cabTopCol   = nicheColorIdx !== null ? shade(NICHE_COLORS[nicheColorIdx].hex,  10) : COL.top;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-10 md:py-14">
        <header className="mb-12 md:mb-16 border-b border-border pb-8">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-copper mb-3">Handgemaakt Maatwerk</p>
          <h1 className="font-serif-display text-4xl md:text-5xl text-foreground leading-[1.05]">Boogkast Configurator</h1>
          
        </header>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* ─── Preview (right column on desktop, sticky top on mobile) ─── */}
          <div className="sticky top-0 z-30 -mx-6 md:-mx-12 lg:mx-0 lg:order-2 lg:sticky lg:top-4 lg:self-start bg-background lg:bg-transparent pt-2 pb-3 lg:p-0 border-b border-border lg:border-b-0">
            <div className="relative bg-canvas overflow-hidden border-y border-border lg:border lg:rounded-sm">
              <div className="px-1 py-1 lg:p-8 flex items-center justify-center lg:min-h-[600px] lg:max-h-[calc(100vh-2rem)] relative">
              <svg ref={svgRef} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto max-h-[55vh] lg:max-h-none" style={{ filter: "drop-shadow(0 28px 22px rgba(28,28,26,0.22)) drop-shadow(0 10px 14px rgba(28,28,26,0.14)) drop-shadow(0 2px 3px rgba(28,28,26,0.08))", cursor: isDragging ? "grabbing" : "default" }}>
                <defs>
                  <marker id="arrowL" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto"><path d="M8 0 L0 4 L8 8 Z" fill={COL.dim} /></marker>
                  <marker id="arrowR" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={COL.dim} /></marker>
                  <marker id="arrowUpFixed" markerWidth="8" markerHeight="8" refX="4" refY="0" orient="0"><path d="M0 8 L4 0 L8 8 Z" fill={COL.dim} /></marker>
                  <marker id="arrowDownFixed" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="180"><path d="M0 8 L4 0 L8 8 Z" fill={COL.dim} /></marker>
                  <clipPath id="archClip"><path d={archPathClosed} /></clipPath>
                  {/* MDF fibre texture — fine, irregular grain like real medium-density fibreboard */}
                  <filter id="mdfFibreNoise" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="2.4 0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
                    <feColorMatrix values="0 0 0 0 0.78
                                            0 0 0 0 0.74
                                            0 0 0 0 0.66
                                            0 0 0 0.18 0" />
                  </filter>
                  <pattern id="mdfFibre" width="220" height="220" patternUnits="userSpaceOnUse">
                    <rect width="220" height="220" fill="#F0EDE6" />
                    <rect width="220" height="220" filter="url(#mdfFibreNoise)" opacity="0.6" />
                  </pattern>
                  {/* Tiny speckle for surface micro-grain */}
                  <filter id="mdfSpeckle" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="3.2" numOctaves="1" seed="3" stitchTiles="stitch" />
                    <feColorMatrix values="0 0 0 0 0.55
                                            0 0 0 0 0.52
                                            0 0 0 0 0.46
                                            0 0 0 0.06 0" />
                  </filter>
                  <pattern id="mdfSpecklePat" width="160" height="160" patternUnits="userSpaceOnUse">
                    <rect width="160" height="160" fill="transparent" filter="url(#mdfSpeckle)" />
                  </pattern>
                  {/* Soft front gradient for matte sheen */}
                  {/* Soft directional sheen — light comes from upper-left */}
                  <linearGradient id="frontSheen" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                    <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#1C1C1A" stopOpacity="0.10" />
                  </linearGradient>
                  {/* Subtle shadow gradient inside niche — stronger near top/back */}
                  <linearGradient id="nicheShadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
                    <stop offset="45%" stopColor="#000" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.02" />
                  </linearGradient>
                  {/* Ambient occlusion vignette inside niche — darkens corners/edges */}
                  <radialGradient id="nicheAO" cx="50%" cy="55%" r="70%">
                    <stop offset="50%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.30" />
                  </radialGradient>
                  {/* Side-light gradient on the niche back — brighter at upper-left, darker bottom-right */}
                  <linearGradient id="nicheSideLight" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
                    <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
                  </linearGradient>
                  {/* Top face — bright (light from above) */}
                  <linearGradient id="mdfEdge" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D8D2C5" />
                    <stop offset="50%" stopColor="#CFC9BB" />
                    <stop offset="100%" stopColor="#B8B1A1" />
                  </linearGradient>
                  <linearGradient id="mdfEdgeTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FAF8F2" />
                    <stop offset="100%" stopColor="#E8E4DA" />
                  </linearGradient>
                  {/* Shelf 3D gradients */}
                  <linearGradient id="shelfFront" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F0EEE8" />
                    <stop offset="55%" stopColor="#ECEAE3" />
                    <stop offset="100%" stopColor="#DED9D0" />
                  </linearGradient>
                  <linearGradient id="shelfTop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F0EEE8" />
                    <stop offset="100%" stopColor="#E2DED5" />
                  </linearGradient>
                  <linearGradient id="shelfSide" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E2DED5" />
                    <stop offset="100%" stopColor="#CFC9BD" />
                  </linearGradient>
                  <linearGradient id="shelfUnderShadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                  </linearGradient>
                  {/* === Realistic paint texture === */}
                  {/* Fine orange-peel / roller stipple — typical of matte painted MDF */}
                  <filter id="paintStippleNoise" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="11" stitchTiles="stitch" />
                    <feColorMatrix values="0 0 0 0 1
                                            0 0 0 0 1
                                            0 0 0 0 1
                                            0 0 0 0.10 0" />
                  </filter>
                  <pattern id="paintStipple" width="260" height="260" patternUnits="userSpaceOnUse">
                    <rect width="260" height="260" fill="transparent" filter="url(#paintStippleNoise)" />
                  </pattern>
                  {/* Soft horizontal brush/roller streaks for painted look */}
                  <filter id="brushStreakNoise" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.012 1.6" numOctaves="2" seed="5" stitchTiles="stitch" />
                    <feColorMatrix values="0 0 0 0 1
                                            0 0 0 0 1
                                            0 0 0 0 1
                                            0 0 0 0.05 0" />
                  </filter>
                  <pattern id="brushStreak" width="600" height="300" patternUnits="userSpaceOnUse">
                    <rect width="600" height="300" fill="transparent" filter="url(#brushStreakNoise)" />
                  </pattern>
                </defs>

                <g transform={`translate(${padding}, ${padding + dyS})`}>
                  <g transform={`scale(${scale})`}>

                    {/* === LAYER 1: Back wall of niche === */}
                    <path d={backArchPathClosed} fill={nicheBackColor} fillOpacity={1} />
                    {/* Painted sheen on back wall — light from upper-left */}
                    <g clipPath="url(#archClip)">
                      <path d={backArchPathClosed} fill="url(#nicheSideLight)" />
                    </g>
                    <path d={backArchPathOpen} fill="none" stroke={COL.frontStroke} strokeWidth={0.5 / scale} strokeLinejoin="miter" strokeMiterlimit={10} />

                    {/* === LAYER 2: Left inner wall === */}
                    {(() => {
                      const wallBottom = ay + ah;
                      return (
                        <polygon
                          points={`${ax},${lwTopY} ${ax + dx},${lwTopY + dy} ${ax + dx},${wallBottom + dy} ${ax},${wallBottom}`}
                          fill={wallCol}
                          stroke={COL.frontStroke}
                          strokeWidth={0.3 / scale}
                        />
                      );
                    })()}

                    {/* === LAYER 2b: Ceiling of niche === */}
                    <path d={ceilPath} fill={ceilCol} stroke={COL.frontStroke} strokeWidth={0.3 / scale} />

                    {/* === LAYER 2c: Floor of niche (only when bottom gap > 0 — closed bottom panel) === */}
                    {(cabinet.height - ay - ah) > 0 && (
                      <>
                        {/* 3D floor depth polygon going back into niche */}
                        <polygon
                          points={`${ax},${ay + ah} ${ax + aw},${ay + ah} ${ax + aw + dx},${ay + ah + dy} ${ax + dx},${ay + ah + dy}`}
                          fill={ceilCol}
                          stroke={COL.frontStroke}
                          strokeWidth={0.3 / scale}
                        />
                        {/* Front edge line of the closed bottom panel */}
                        <line
                          x1={ax} y1={ay + ah} x2={ax + aw} y2={ay + ah}
                          stroke={COL.frontStroke}
                          strokeWidth={1.5 / scale}
                          strokeLinecap="square"
                        />
                      </>
                    )}

                    {/* === LAYER 2d: Matte shadow overlay inside niche for depth === */}
                    <g clipPath="url(#archClip)">
                      <path d={archPathClosed} fill="url(#nicheShadow)" />
                      {/* Ambient occlusion — darker corners deep inside niche */}
                      <path d={archPathClosed} fill="url(#nicheAO)" />
                    </g>

                    {/* === LAYER 3: Shelves (3D solid) === */}
                    <g clipPath="url(#archClip)">
                      {shelves.map((shelf, i) => {
                        const sx = ax + (aw - shelf.width) / 2;
                        const sy = ay + shelf.relY;
                        const sw = shelf.width;
                        const th = SHELF_THICKNESS;
                        const sh = th * 0.55; // cast shadow height under shelf
                        return (
                          <g key={i}>
                            {/* Cast shadow under shelf onto back wall */}
                            <rect x={sx} y={sy + th} width={sw} height={sh} fill="url(#shelfUnderShadow)" />
                            {/* Extra soft ambient shadow further down the wall */}
                            <rect x={sx} y={sy + th} width={sw} height={sh * 2.4} fill="url(#shelfUnderShadow)" opacity={0.45} />
                            {/* Top surface (depth face going back) */}
                            <polygon
                              points={`${sx},${sy} ${sx + dx},${sy + dy} ${sx + sw + dx},${sy + dy} ${sx + sw},${sy}`}
                              fill={cabFrontCol} stroke={COL.shelfFrontStroke} strokeWidth={0.5 / scale} strokeOpacity={0.4}
                            />
                            {/* subtle highlight on top face */}
                            <polygon
                              points={`${sx},${sy} ${sx + dx},${sy + dy} ${sx + sw + dx},${sy + dy} ${sx + sw},${sy}`}
                              fill="#FFFFFF" opacity={0.10} stroke="none"
                            />
                            {/* Right side face (3D depth) */}
                            <polygon
                              points={`${sx + sw},${sy} ${sx + sw + dx},${sy + dy} ${sx + sw + dx},${sy + th + dy} ${sx + sw},${sy + th}`}
                              fill={cabFrontCol} stroke={COL.shelfFrontStroke} strokeWidth={0.5 / scale} strokeOpacity={0.5}
                            />
                            <polygon
                              points={`${sx + sw},${sy} ${sx + sw + dx},${sy + dy} ${sx + sw + dx},${sy + th + dy} ${sx + sw},${sy + th}`}
                              fill="#000000" opacity={0.12} stroke="none"
                            />
                            {/* Front face — solid panel with vertical light gradient */}
                            <rect x={sx} y={sy} width={sw} height={th}
                              fill={cabFrontCol} stroke={COL.shelfFrontStroke} strokeWidth={1.2 / scale}
                            />
                            {/* Bottom edge highlight line for crisp 3D edge */}
                            <line x1={sx} y1={sy + th} x2={sx + sw} y2={sy + th}
                              stroke="#B8B2A4" strokeWidth={1.2 / scale} strokeOpacity={0.7} />
                            {/* Top edge subtle highlight */}
                            <line x1={sx} y1={sy + 0.4 / scale} x2={sx + sw} y2={sy + 0.4 / scale}
                              stroke="#FFFFFF" strokeWidth={0.6 / scale} strokeOpacity={0.9} />
                          </g>
                        );
                      })}
                    </g>

                    {/* === LAYER 3b: Rod === */}
                    <g clipPath="url(#archClip)">
                      {hasRod && rodWidth > 0 && (() => {
                        const rodX1 = ax + (aw - rodWidth) / 2;
                        const rodX2 = ax + (aw + rodWidth) / 2;
                        const rodYPos = ay + rodRelY;
                        const hd = dx / 2;
                        const hdy = dy / 2;
                        const rodColor = rodFinish === "wit" ? "#F5F2EE" : "#1A1A1A";
                        const rodStroke = rodFinish === "wit" ? "#9A9388" : "#000000";
                        return (
                          <g>
                            <line x1={rodX1 + hd} y1={rodYPos + hdy} x2={rodX2 + hd} y2={rodYPos + hdy}
                              stroke={rodColor} strokeWidth={ROD_DIAMETER} strokeLinecap="round" />
                            <circle cx={rodX1 + hd} cy={rodYPos + hdy} r={ROD_DIAMETER / 2} fill={rodColor} stroke={rodStroke} strokeWidth={0.3} />
                            <circle cx={rodX2 + hd} cy={rodYPos + hdy} r={ROD_DIAMETER / 2} fill={rodColor} stroke={rodStroke} strokeWidth={0.3} />
                          </g>
                        );
                      })()}
                    </g>

                    {/* === LAYER 4: Front panel === */}
                    <path d={frontFramePath} fill={cabFrontCol} fillOpacity={1} fillRule="evenodd" clipRule="evenodd" />
                    {/* Realistic painted MDF texture — subtle stipple + brush streaks */}
                    <path d={frontFramePath} fill="url(#paintStipple)" fillRule="evenodd" clipRule="evenodd" opacity={0.55} />
                    <path d={frontFramePath} fill="url(#brushStreak)" fillRule="evenodd" clipRule="evenodd" opacity={0.45} />
                    {/* Painted sheen — directional light from upper-left */}
                    <path d={frontFramePath} fill="url(#frontSheen)" fillRule="evenodd" clipRule="evenodd" />
                    <rect x={0} y={0} width={cabinet.width} height={cabinet.height} fill="none" stroke={COL.frontStroke} strokeWidth={1.5 / scale} />
                    <path d={archPathOpen} fill="none" stroke={COL.frontStroke} strokeWidth={1.5 / scale} strokeLinejoin="miter" strokeMiterlimit={10} />
                    {/* Raw MDF edge on the inner arch cut — visible cross-section */}
                    <path d={archPathOpen} fill="none" stroke="#D8D3C7" strokeWidth={2.2 / scale} strokeOpacity={0.5} strokeLinejoin="miter" strokeMiterlimit={10} />

                    {/* Arch drag handle */}
                    <path d={archPathClosed} fill="transparent" stroke="transparent" strokeWidth={12 / scale} style={{ cursor: "grab", touchAction: "none" }} onPointerDown={handlePointerDown} />
                    <path d={archPathOpen} fill="none" stroke="hsl(var(--accent))" strokeWidth={2 / scale} strokeLinejoin="miter" strokeMiterlimit={10} style={{ cursor: "grab", pointerEvents: "none" }} />
                    {/* "Versleep mij" hint inside arch, on top of shelves */}
                    <text
                      x={ax + aw / 2}
                      y={ay + ah / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={Math.max(2.5, Math.min(5, aw / 12))}
                      fontStyle="italic"
                      fill={COL.dim}
                      fillOpacity={0.45}
                      style={{ pointerEvents: "none", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                    >
                      Versleep mij
                    </text>
                  </g>
                </g>

                {/* === Pseudo-3D: Side panel === */}
                <polygon
                  points={`${padding + cabinet.width * scale},${padding + dyS} ${padding + cabinet.width * scale + dxS},${padding} ${padding + cabinet.width * scale + dxS},${padding + cabinet.height * scale} ${padding + cabinet.width * scale},${padding + cabinet.height * scale + dyS}`}
                  fill={cabFrontCol} stroke={COL.frontStroke} strokeWidth={1.5}
                />
                {/* Painted texture on side panel */}
                <polygon
                  points={`${padding + cabinet.width * scale},${padding + dyS} ${padding + cabinet.width * scale + dxS},${padding} ${padding + cabinet.width * scale + dxS},${padding + cabinet.height * scale} ${padding + cabinet.width * scale},${padding + cabinet.height * scale + dyS}`}
                  fill="url(#paintStipple)" opacity={0.4} stroke="none"
                />
                {/* Right side darker (away from light source) */}
                <polygon
                  points={`${padding + cabinet.width * scale},${padding + dyS} ${padding + cabinet.width * scale + dxS},${padding} ${padding + cabinet.width * scale + dxS},${padding + cabinet.height * scale} ${padding + cabinet.width * scale},${padding + cabinet.height * scale + dyS}`}
                  fill="#000000" opacity={0.12} stroke="none"
                />

                {/* === Pseudo-3D: Top panel === */}
                <polygon
                  points={`${padding},${padding + dyS} ${padding + dxS},${padding} ${padding + cabinet.width * scale + dxS},${padding} ${padding + cabinet.width * scale},${padding + dyS}`}
                  fill={cabFrontCol} stroke={COL.frontStroke} strokeWidth={1.5}
                />
                {/* Painted texture on top panel */}
                <polygon
                  points={`${padding},${padding + dyS} ${padding + dxS},${padding} ${padding + cabinet.width * scale + dxS},${padding} ${padding + cabinet.width * scale},${padding + dyS}`}
                  fill="url(#paintStipple)" opacity={0.4} stroke="none"
                />
                {/* Top face highlight (light from above) */}
                <polygon
                  points={`${padding},${padding + dyS} ${padding + dxS},${padding} ${padding + cabinet.width * scale + dxS},${padding} ${padding + cabinet.width * scale},${padding + dyS}`}
                  fill="#FFFFFF" opacity={0.18} stroke="none"
                />

                {/* === Dimension lines === */}
                {showDimensions && (
                  <>
                    <line x1={padding - 25} y1={padding + dyS} x2={padding - 25} y2={padding + dyS + cabinet.height * scale}
                      stroke={COL.dim} strokeWidth={1.5} markerStart="url(#arrowUpFixed)" markerEnd="url(#arrowDownFixed)" />
                    <text x={padding - 40} y={padding + dyS + (cabinet.height * scale) / 2}
                      fill={COL.dim} textAnchor="middle" fontSize={13} fontWeight={900}
                      transform={`rotate(-90, ${padding - 40}, ${padding + dyS + (cabinet.height * scale) / 2})`}>
                      {cabinet.height * 10} mm
                    </text>

                    <line x1={padding} y1={padding + dyS + cabinet.height * scale + 35}
                      x2={padding + cabinet.width * scale} y2={padding + dyS + cabinet.height * scale + 35}
                      stroke={COL.dim} strokeWidth={1.5} markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
                    <text x={padding + (cabinet.width * scale) / 2} y={padding + dyS + cabinet.height * scale + 52}
                      fill={COL.dim} textAnchor="middle" fontSize={13} fontWeight={900}>
                      {cabinet.width * 10} mm
                    </text>

                    <line x1={padding + ax * scale} y1={padding + dyS + cabinet.height * scale + 12}
                      x2={padding + (ax + aw) * scale} y2={padding + dyS + cabinet.height * scale + 12}
                      stroke={COL.dim} strokeWidth={1.5} markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
                    <text x={padding + (ax + aw / 2) * scale} y={padding + dyS + cabinet.height * scale + 27}
                      fill={COL.dim} textAnchor="middle" fontSize={11} fontWeight={900}>
                      {aw * 10} mm
                    </text>

                    <line x1={padding + cabinet.width * scale} y1={padding + dyS}
                      x2={padding + cabinet.width * scale + dxS} y2={padding}
                      stroke={COL.dim} strokeWidth={1.5} strokeDasharray="4 2" />
                    <text x={padding + cabinet.width * scale + dxS / 2 + 10} y={padding + dyS / 2 - 6}
                      fill={COL.dim} textAnchor="middle" fontSize={11} fontWeight={900}>
                      {cabinet.depth * 10} mm
                    </text>
                  </>
                )}

                {/* ─── A/B/C/D position labels on the preview ─── */}
                {showDimensions && (() => {
                  const cabL = padding;
                  const cabT = padding + dyS;
                  const cabR = padding + cabinet.width * scale;
                  const cabB = padding + dyS + cabinet.height * scale;
                  const archL = padding + ax * scale;
                  const archR = padding + (ax + aw) * scale;
                  const archT = padding + dyS + ay * scale;
                  const archB = padding + dyS + (ay + ah) * scale;
                  const archCY = (archT + archB) / 2;
                  const archCX = (archL + archR) / 2;
                  const dMarginPx = cabB - archB;
                  const labels = [
                    { key: "A", x: (cabL + archL) / 2, y: archCY, show: ax > 0 },
                    { key: "B", x: (cabR + archR) / 2, y: archCY, show: cabinet.width - ax - aw > 0 },
                     { key: "C", x: archCX, y: (cabT + archT) / 2, show: ay > 0 },
                     { key: "D", x: archCX, y: dMarginPx >= 24 ? (cabB + archB) / 2 : cabB - 14, show: true },
                  ];
                  const r = 11;
                  return (
                    <g className="pointer-events-none">
                      {labels.filter(l => l.show).map(l => (
                        <g key={l.key}>
                          <circle cx={l.x} cy={l.y} r={r}
                            fill="hsl(var(--background))" stroke="hsl(var(--copper))" strokeWidth={1.25} opacity={0.95} />
                          <text x={l.x} y={l.y + 4}
                            fill="hsl(var(--foreground))" textAnchor="middle"
                            fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">
                            {l.key}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>

              </div>
            </div>
          </div>

          {/* ─── Controls (left column on desktop) ─── */}
          <div className="space-y-10 lg:order-1 min-w-0">

            {/* Kast Afmetingen */}
            <section>
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border gap-4">
                <h2 className="font-serif-display text-xl text-foreground">Kast Afmetingen</h2>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={handleReset} className="h-auto p-0 gap-1.5 text-copper hover:text-copper-dark hover:bg-transparent text-[10px] tracking-[0.25em] uppercase font-medium">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NumberInput id="cabW" label="Breedte" value={cabinet.width} onChange={(v) => updateCabinet("width", v)} min={50} max={400} />
                <NumberInput id="cabH" label="Hoogte" value={cabinet.height} onChange={(v) => updateCabinet("height", v)} min={50} max={500} />
                <NumberInput id="cabD" label="Diepte" value={cabinet.depth} onChange={(v) => updateCabinet("depth", v)} min={10} max={100} />
              </div>
            </section>

            {/* Boog Afmetingen */}
            <section ref={archDimsRef}>
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border">
                <h2 className="font-serif-display text-xl text-foreground">Boog Afmetingen</h2>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">Boogvorm</Label>
                  <Select value={archType} onValueChange={(v) => setArchType(v as ArchType)}>
                    <SelectTrigger className="input-artisan h-10 text-sm font-light text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Halfrond</SelectItem>
                      <SelectItem value="gothic">Gotisch</SelectItem>
                      <SelectItem value="shoulder">Schouder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {archType === "gothic" && (
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    Spitsboog ratio is vast: {gothicCapH * 10} mm puntkapje · 37,5% van de breedte (klassieke ogief).
                  </p>
                )}
                {archType === "shoulder" && (
                  <NumberInput
                    id="shoulderR"
                    label="Hoek Radius"
                    value={shoulderRadiusValue}
                    onChange={(v) => setShoulderRadiusValue(v)}
                    min={5}
                    max={Math.floor(arch.width / 2)}
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput id="archW" label="Breedte" value={arch.width} onChange={(v) => updateArchDim("width", v)} min={10} max={Math.max(10, cabinet.width - 10)} />
                  <NumberInput id="archH" label="Hoogte" value={arch.height} onChange={(v) => updateArchDim("height", v)} min={10} max={Math.max(10, cabinet.height - 5)} />
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 py-2 items-end">
                  <NumberInput
                    id="archX"
                    label="A — links"
                    value={arch.position.x}
                    onChange={(v) => {
                      if (centerArch) {
                        const newW = Math.max(10, cabinet.width - 2 * v);
                        setArch((prev) => clampArch({ ...prev, width: newW, position: { ...prev.position, x: v } }));
                      } else {
                        updateArchPos("x", v);
                      }
                    }}
                    min={5}
                    max={Math.max(5, cabinet.width - arch.width - 5)}
                  />
                  <button
                    type="button"
                    onClick={() => setCenterArch((s) => !s)}
                    aria-pressed={centerArch}
                    aria-label="Boog horizontaal centreren (A en B spiegelen)"
                    title="Spiegel A en B (centreer)"
                    className={`h-10 w-10 rounded-md border flex items-center justify-center transition-colors mb-0 ${
                      centerArch
                        ? "bg-copper/15 border-copper text-copper"
                        : "bg-card border-border text-muted-foreground hover:border-copper hover:text-copper"
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                  <NumberInput
                    id="archXR"
                    label="B — rechts"
                    value={Math.max(0, cabinet.width - arch.width - arch.position.x)}
                    onChange={(v) => {
                      if (centerArch) {
                        const newW = Math.max(10, cabinet.width - 2 * v);
                        setArch((prev) => clampArch({ ...prev, width: newW, position: { ...prev.position, x: v } }));
                      } else {
                        updateArchPos("x", cabinet.width - arch.width - v);
                      }
                    }}
                    min={5}
                    max={Math.max(5, cabinet.width - arch.width - 5)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <NumberInput id="archY" label="C — boven" value={arch.position.y} onChange={(v) => updateArchPos("y", v)} min={5} max={Math.max(5, cabinet.height - arch.height)} />
                  <NumberInput id="archYB" label="D — onder" value={Math.max(0, cabinet.height - arch.height - arch.position.y)} onChange={(v) => updateArchPos("y", cabinet.height - arch.height - v)} min={0} max={Math.max(0, cabinet.height - arch.height - 5)} />
                </div>
                <div className="border-t border-border pt-4 flex items-center gap-2">
                  <Checkbox id="showDims" checked={showDimensions} onCheckedChange={(checked) => setShowDimensions(checked === true)} />
                  <Label htmlFor="showDims" className="text-[11px] font-light cursor-pointer text-muted-foreground tracking-wide">Toon afmetingen in preview</Label>
                </div>
              </div>
            </section>

            {/* Interieur Kleur — tegels */}
            <section>
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border">
                <h2 className="font-serif-display text-xl text-foreground">Interieur Kleur</h2>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {NICHE_COLORS.map((c, i) => {
                  const active = nicheColorIdx === i;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      aria-pressed={active}
                      aria-label={`Kies kleur ${c.name}`}
                      onClick={() => setNicheColorIdx(i)}
                      className="group flex flex-col items-center gap-2 focus:outline-none"
                    >
                      <span
                        className={`block w-full rounded-sm transition-all duration-200 ease-out ring-offset-2 ring-offset-background ${
                          active
                            ? "ring-2 ring-foreground shadow-[0_6px_18px_rgba(28,28,26,0.18)] scale-[1.04]"
                            : "ring-1 ring-border group-hover:ring-foreground/50 group-hover:scale-[1.03] group-hover:shadow-[0_4px_12px_rgba(28,28,26,0.10)]"
                        }`}
                        style={{
                          height: 44,
                          backgroundColor: c.hex,
                        }}
                      />
                      <span
                        className={`text-[9px] tracking-[0.1em] uppercase text-center leading-tight transition-colors duration-200 ${
                          active ? "text-foreground font-semibold" : "text-muted-foreground font-light group-hover:text-foreground/80"
                        }`}
                      >
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed italic mt-4">
                Het meubel wordt altijd geleverd in matwit MDF. De interieurkleur is ter inspiratie — u schildert de binnenzijde zelf in de gewenste kleur.
              </p>
            </section>

            {/* Plaatsing */}
            <section>
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border">
                <h2 className="font-serif-display text-xl text-foreground">Plaatsing</h2>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                Selecteer welke zijkanten zichtbaar zijn en in matwit MDF afgewerkt moeten worden. Tegen een muur? Laat de zijkant uit.
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setFinishLeft((v) => !v)}
                  aria-pressed={finishLeft}
                  className={`flex-1 max-w-[110px] rounded-sm border px-2 py-3 text-[10px] tracking-[0.12em] uppercase font-medium transition-colors focus:outline-none ${
                    finishLeft
                      ? "border-copper bg-secondary text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {finishLeft ? "Links afgewerkt" : "Links niet afgewerkt"}
                </button>
                <svg viewBox="0 0 100 80" className="w-24 h-20 shrink-0" aria-hidden="true">
                  {/* Cabinet body */}
                  <rect
                    x="22" y="10" width="56" height="64"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={1}
                  />
                  {/* Arch hint */}
                  <path
                    d="M 32 74 L 32 36 A 18 18 0 0 1 68 36 L 68 74"
                    fill="hsl(var(--secondary))"
                    stroke="hsl(var(--foreground) / 0.5)"
                    strokeWidth={0.6}
                  />
                  {/* Left side accent */}
                  <rect
                    x="18" y="10" width="4" height="64"
                    fill={finishLeft ? "hsl(var(--copper))" : "hsl(var(--muted))"}
                    opacity={finishLeft ? 1 : 0.5}
                  />
                  {/* Right side accent */}
                  <rect
                    x="78" y="10" width="4" height="64"
                    fill={finishRight ? "hsl(var(--copper))" : "hsl(var(--muted))"}
                    opacity={finishRight ? 1 : 0.5}
                  />
                </svg>
                <button
                  type="button"
                  onClick={() => setFinishRight((v) => !v)}
                  aria-pressed={finishRight}
                  className={`flex-1 max-w-[110px] rounded-sm border px-2 py-3 text-[10px] tracking-[0.12em] uppercase font-medium transition-colors focus:outline-none ${
                    finishRight
                      ? "border-copper bg-secondary text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {finishRight ? "Rechts afgewerkt" : "Rechts niet afgewerkt"}
                </button>
              </div>
            </section>

            {/* Achterwand */}
            <section>
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border">
                <h2 className="font-serif-display text-xl text-foreground">Achterwand</h2>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <Label htmlFor="hasBack" className="text-xs font-light text-foreground tracking-wide">
                    Achterwand toevoegen
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Een afgewerkte achterwand in matwit MDF.
                  </p>
                </div>
                <Switch id="hasBack" checked={hasBack} onCheckedChange={setHasBack} />
              </div>
            </section>

            {/* Opties */}
            <section>
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border">
                <h2 className="font-serif-display text-xl text-foreground">Opties</h2>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">Legplanken</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" aria-label="Info legplanken" className="text-muted-foreground hover:text-copper transition-colors">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="w-72 text-[11px] leading-relaxed font-light">
                        Onze legplanken zijn standaard 70&nbsp;mm dik en worden blind gemonteerd — eerst worden stroken in de kast bevestigd, daarna schuift de plank er naadloos overheen. Andere diktes zijn op aanvraag mogelijk.
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-transparent text-foreground hover:bg-secondary hover:text-copper hover:border-copper transition-colors" onClick={() => setShelfCount((c) => Math.max(0, c - 1))} disabled={shelfCount <= 0}>
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-sm font-light w-24 text-center text-foreground tabular-nums">{shelfCount === 0 ? "Geen" : `${shelfCount} plank${shelfCount > 1 ? "en" : ""}`}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-transparent text-foreground hover:bg-secondary hover:text-copper hover:border-copper transition-colors" onClick={() => setShelfCount((c) => c + 1)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {shelfCount > 0 && <p className="text-[10px] text-muted-foreground">Dikte: {SHELF_THICKNESS * 10} mm · €{shelfUnitPrice(arch.width)}/stuk</p>}
                </div>
                <div className="py-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {hasRod && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="shrink-0 rounded-sm overflow-hidden border border-border hover:border-copper transition-colors focus:outline-none focus:ring-2 focus:ring-copper/50"
                              aria-label="Vergroot voorbeeld roede"
                            >
                              <img
                                src={rodFinish === "wit" ? roedeWitThumb : roedeZwartThumb}
                                alt={`Voorbeeld roede ${rodFinish}`}
                                className="w-10 h-10 object-cover block"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card">
                            <DialogHeader className="sr-only">
                              <DialogTitle>Voorbeeld roede {rodFinish}</DialogTitle>
                              <DialogDescription>Vergrote weergave van de roede</DialogDescription>
                            </DialogHeader>
                            <img
                              src={rodFinish === "wit" ? roedeWitThumb : roedeZwartThumb}
                              alt={`Voorbeeld roede ${rodFinish}`}
                              className="w-full h-auto block"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="rod" className="text-xs font-light text-foreground tracking-wide">Roede (ovaal)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                            Een ovale garderobe- of decoratieroede, gemonteerd met twee beugels aan beide zijwanden. Geschikt voor kleding, planten of decoratie.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Switch id="rod" checked={hasRod} onCheckedChange={setHasRod} />
                  </div>
                  {hasRod && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        type="button"
                        onClick={() => setRodFinish("zwart")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors text-[11px] font-light tracking-wide ${rodFinish === "zwart" ? "border-copper text-copper bg-secondary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ background: "#1A1A1A", border: "0.5px solid #000000" }} />
                        Zwart
                      </button>
                      <button
                        type="button"
                        onClick={() => setRodFinish("wit")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors text-[11px] font-light tracking-wide ${rodFinish === "wit" ? "border-copper text-copper bg-secondary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ background: "#F5F2EE", border: "0.5px solid #9A9388" }} />
                        Wit
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 py-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {hasLight && archType !== "gothic" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="shrink-0 rounded-sm overflow-hidden border border-border hover:border-copper transition-colors focus:outline-none focus:ring-2 focus:ring-copper/50"
                              aria-label="Vergroot voorbeeld verlichting"
                            >
                              <img
                                src={verlichtingThumb}
                                alt="Voorbeeld verlichting in nis"
                                className="w-10 h-10 object-cover block"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card">
                            <DialogHeader className="sr-only">
                              <DialogTitle>Voorbeeld verlichting in nis</DialogTitle>
                              <DialogDescription>Vergrote weergave van het verlichtingsvoorbeeld</DialogDescription>
                            </DialogHeader>
                            <img
                              src={verlichtingThumb}
                              alt="Voorbeeld verlichting in nis"
                              className="w-full h-auto block"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="light" className={`text-xs font-light tracking-wide ${archType === "gothic" ? "text-muted-foreground/60" : "text-foreground"}`}>
                          Verlichting (Ø42mm RGB · €50)
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className={`hover:text-foreground transition-colors shrink-0 ${archType === "gothic" ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                            Een ingebouwde RGB LED spot van 42mm diameter, gemonteerd in het plafond van de nis. De spot geeft instelbaar gekleurd licht en wordt geleverd inclusief afstandsbediening. Het gat wordt gefreesd en de bedrading voorbereid geleverd. Aansluiting door een elektricien aanbevolen.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Switch id="light" checked={hasLight && archType !== "gothic"} onCheckedChange={setHasLight} disabled={archType === "gothic"} />
                  </div>
                  {archType === "gothic" && (
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                      Verlichting bij deze boog is alleen op aanvraag mogelijk.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Prijs */}
            <section className="bg-secondary/40 border border-border rounded-sm p-6 space-y-4">
              <ul className="space-y-1.5 border-t border-border pt-4">
                {[
                  "Geproduceerd in matwit MDF",
                  "Geleverd als bouwpakket — eenvoudig zelf te monteren",
                  "Binnen 1 werkdag ontvang je een bevestiging",
                  "Geen betaling nu",
                  "Gratis verzending binnen Nederland*",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[12px] leading-snug text-foreground/75">
                    <span className="text-copper mt-px" aria-hidden="true">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">Jouw prijs inclusief btw</p>
              </div>
              {isPriceOnRequest ? (
                <div className="space-y-2">
                  <p className="font-serif-display text-2xl text-foreground">Prijs op aanvraag</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Voor projecten groter dan 3500×3000 mm maken wij graag een offerte op maat.</p>
                </div>
              ) : (
                <p className="font-serif-display text-4xl text-foreground tracking-tight tabular-nums">
                  €{displayPrice.toLocaleString("nl-NL")}
                </p>
              )}
              <Button
                onClick={handleReserveOpen}
                disabled={isPriceOnRequest}
                className="w-full bg-foreground text-background hover:bg-foreground/90 text-[11px] py-5 tracking-[0.2em] uppercase font-medium rounded-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
              >
                Reserveer jouw kast
              </Button>
            </section>
          </div>
        </div>
      </div>

      {/* ─── Reserveringsmodal ─── */}
      <Dialog open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          {!reserveSubmitted ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif-display text-2xl text-foreground tracking-tight">
                  Reserveer jouw kast
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground tracking-wide leading-relaxed">
                  {isPriceOnRequest
                    ? "We nemen contact op voor een offerte op maat."
                    : `Jouw prijs: €${displayPrice.toLocaleString("nl-NL")} incl. BTW`}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-sm border border-border bg-secondary/30 p-3 text-[11px] text-foreground/80 space-y-1 leading-relaxed">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Plaatsing</span>
                  <span className="text-right">
                    {visibleSides === 0
                      ? "Geen zijkant afgewerkt"
                      : visibleSides === 2
                        ? "Beide zijkanten afgewerkt"
                        : `${finishLeft ? "Linker" : "Rechter"}zijkant afgewerkt`}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Achterwand</span>
                  <span className="text-right">
                    {hasBack ? "Toegevoegd" : "Geen"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleReserveSubmit} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="resName" className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                    Naam
                  </Label>
                  <Input
                    id="resName"
                    type="text"
                    autoComplete="name"
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    maxLength={100}
                    className="input-artisan h-10 text-sm font-light text-foreground"
                    aria-invalid={!!resErrors.name}
                  />
                  {resErrors.name && <p className="text-[10px] text-destructive">{resErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resEmail" className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                    E-mailadres
                  </Label>
                  <Input
                    id="resEmail"
                    type="email"
                    autoComplete="email"
                    value={resEmail}
                    onChange={(e) => setResEmail(e.target.value)}
                    maxLength={255}
                    className="input-artisan h-10 text-sm font-light text-foreground"
                    aria-invalid={!!resErrors.email}
                  />
                  {resErrors.email && <p className="text-[10px] text-destructive">{resErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resPhone" className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                    Telefoonnummer <span className="lowercase tracking-normal text-muted-foreground/70 normal-case">(optioneel)</span>
                  </Label>
                  <Input
                    id="resPhone"
                    type="tel"
                    autoComplete="tel"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    maxLength={30}
                    className="input-artisan h-10 text-sm font-light text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resStreet" className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                    Straat en huisnummer
                  </Label>
                  <Input
                    id="resStreet"
                    type="text"
                    autoComplete="street-address"
                    value={resStreet}
                    onChange={(e) => setResStreet(e.target.value)}
                    maxLength={150}
                    className="input-artisan h-10 text-sm font-light text-foreground"
                    aria-invalid={!!resErrors.street}
                  />
                  {resErrors.street && <p className="text-[10px] text-destructive">{resErrors.street}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resPostcode" className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                    Postcode
                  </Label>
                  <Input
                    id="resPostcode"
                    type="text"
                    autoComplete="postal-code"
                    value={resPostcode}
                    onChange={(e) => setResPostcode(e.target.value)}
                    maxLength={20}
                    className="input-artisan h-10 text-sm font-light text-foreground"
                    aria-invalid={!!resErrors.postcode}
                  />
                  {resErrors.postcode && <p className="text-[10px] text-destructive">{resErrors.postcode}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resCity" className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                    Plaats
                  </Label>
                  <Input
                    id="resCity"
                    type="text"
                    autoComplete="address-level2"
                    value={resCity}
                    onChange={(e) => setResCity(e.target.value)}
                    maxLength={100}
                    className="input-artisan h-10 text-sm font-light text-foreground"
                    aria-invalid={!!resErrors.city}
                  />
                  {resErrors.city && <p className="text-[10px] text-destructive">{resErrors.city}</p>}
                </div>

                <div className="pt-2 space-y-3">
                  <div className="space-y-1.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <Checkbox
                        id="resTerms"
                        checked={resTerms}
                        onCheckedChange={(c) => setResTerms(c === true)}
                        aria-invalid={!!resErrors.terms}
                        className="mt-0.5"
                      />
                      <span className="text-[11px] text-muted-foreground leading-relaxed">
                        Ik ga akkoord met de{" "}
                        <a
                          href="/algemene-voorwaarden"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-foreground hover:text-copper transition-colors"
                        >
                          algemene voorwaarden
                        </a>
                      </span>
                    </label>
                    {resErrors.terms && <p className="text-[10px] text-destructive">{resErrors.terms}</p>}
                  </div>
                  <Button
                    type="submit"
                    disabled={reserveSubmitting || !resTerms}
                    className="w-full bg-foreground text-background hover:bg-foreground/90 text-[11px] py-5 tracking-[0.25em] uppercase font-medium rounded-sm transition-all duration-200 hover:shadow-md"
                  >
                    {reserveSubmitting ? "Versturen…" : "Verstuur reservering"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground/80 text-center leading-relaxed">
                    ✓ Geen betaling nu — je ontvangt eerst een bevestiging binnen 1 werkdag.
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="py-6 text-center space-y-5">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary border border-copper/40 flex items-center justify-center">
                <Check className="w-5 h-5 text-copper" />
              </div>
              <DialogHeader>
                <DialogTitle className="font-serif-display text-2xl text-foreground tracking-tight text-center">
                  Bedankt!
                </DialogTitle>
                <DialogDescription className="text-[12px] text-muted-foreground tracking-wide leading-relaxed text-center px-2">
                  We controleren jouw maatopgave en nemen binnen 1 werkdag contact op ter bevestiging. Pas daarna wordt de kast in productie genomen.
                </DialogDescription>
              </DialogHeader>
              <Button
                type="button"
                onClick={() => setReserveOpen(false)}
                className="bg-foreground text-background hover:bg-foreground/90 text-[11px] py-4 px-8 tracking-[0.25em] uppercase font-medium rounded-sm"
              >
                Sluiten
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlateConfigurator;
