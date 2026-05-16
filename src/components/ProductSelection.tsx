import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import SiteFooter from "@/components/SiteFooter";

export type ProductId = "small" | "large" | "halmeubel" | "combi";

type Preview = "small" | "large" | "halmeubel" | "combi";

const CabinetIllustration = ({ variant }: { variant: Preview }) => {
  // Common viewBox
  const stroke = "hsl(var(--foreground))";
  const fill = "hsl(var(--card))";
  const niche = "hsl(var(--secondary))";
  const accent = "hsl(var(--accent))";

  if (variant === "small") {
    // small freestanding — 80×190×25 cabinet, arch 60×150, plateau 15 cm onder
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <rect x="38" y="8" width="44" height="104" fill={fill} stroke={stroke} strokeWidth="1.2" />
        <path d="M44 95 V38 A16 16 0 0 1 76 38 V95 Z" fill={niche} stroke={stroke} strokeWidth="0.8" />
        <line x1="38" y1="95" x2="82" y2="95" stroke={stroke} strokeWidth="0.8" opacity="0.7" />
        <line x1="38" y1="112" x2="82" y2="112" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  if (variant === "large") {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <rect x="22" y="8" width="76" height="104" fill={fill} stroke={stroke} strokeWidth="1.2" />
        <path d="M32 112 V32 Q32 18 60 18 Q88 18 88 32 V112 Z" fill={niche} stroke={stroke} strokeWidth="0.8" />
        <line x1="32" y1="55" x2="88" y2="55" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
        <line x1="32" y1="80" x2="88" y2="80" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      </svg>
    );
  }
  if (variant === "halmeubel") {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <rect x="22" y="10" width="76" height="100" fill={fill} stroke={stroke} strokeWidth="1.2" />
        <path d="M32 70 V30 Q32 18 60 18 Q88 18 88 30 V70 Z" fill={niche} stroke={stroke} strokeWidth="0.8" />
        <line x1="38" y1="45" x2="82" y2="45" stroke={accent} strokeWidth="1.2" />
        <line x1="32" y1="72" x2="88" y2="72" stroke={stroke} strokeWidth="1" />
        <line x1="60" y1="72" x2="60" y2="110" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }
  // combi
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <rect x="8" y="14" width="48" height="96" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M16 110 V36 Q16 24 32 24 Q48 24 48 36 V110 Z" fill={niche} stroke={stroke} strokeWidth="0.8" />
      <rect x="64" y="14" width="48" height="96" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M72 110 V36 Q72 24 88 24 Q104 24 104 36 V110 Z" fill={niche} stroke={stroke} strokeWidth="0.8" />
    </svg>
  );
};

type CardData = {
  id: ProductId;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  preview: Preview;
};

const CARDS: CardData[] = [
  { id: "small", title: "Kleine Boogkast", subtitle: "Los in de ruimte", description: "Een sierlijke vrijstaande kast met plateau, perfect als eyecatcher.", preview: "small" },
  { id: "large", title: "Grote Boogkast", subtitle: "Kamerhoog", description: "De klassieke vloer-tot-plafond boogkast, onze meest gekozen maat.", badge: "Best seller", preview: "large" },
  { id: "halmeubel", title: "Halmeubel", subtitle: "Boog boven · opbergruimte onder", description: "Boogkast met jassenroede gecombineerd met een schoenenkast met 2 deuren.", preview: "halmeubel" },
  { id: "combi", title: "Maatwerk Combinatie", subtitle: "Meerdere bogen naast elkaar", description: "Ontwerp een wand met twee of meer boogkasten op maat.", preview: "combi" },
];

type Props = {
  onSelect: (id: ProductId) => void;
  comingSoon?: ProductId | null;
  onDismissComingSoon?: () => void;
};

const ProductSelection = ({ onSelect }: Props) => {
  const [comingSoon, setComingSoon] = useState<ProductId | null>(null);

  const handle = (id: ProductId) => {
    if (id === "halmeubel" || id === "combi") {
      setComingSoon(id);
    } else {
      onSelect(id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 py-16 flex-1">
        <div className="text-center mb-12">
          <h1 className="font-serif-display text-4xl md:text-5xl text-foreground mb-3">Kies jouw kasttype</h1>
          <p className="text-muted-foreground font-light tracking-wide">
            Configureer jouw kast op maat en reserveer direct online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((c) => (
            <button
              key={c.id}
              onClick={() => handle(c.id)}
              className="group relative bg-card border border-border rounded-sm shadow-sm hover:shadow-md hover:border-copper transition-all duration-300 p-6 flex flex-col text-left cursor-pointer"
            >
              {c.badge && (
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground hover:bg-accent">
                  {c.badge}
                </Badge>
              )}
              <div className="aspect-[4/3] w-full bg-canvas rounded-sm mb-5 flex items-center justify-center p-6">
                <CabinetIllustration variant={c.preview} />
              </div>
              <h2 className="font-serif-display text-2xl text-foreground mb-1">{c.title}</h2>
              <p className="text-xs uppercase tracking-widest text-copper mb-3 font-light">{c.subtitle}</p>
              <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6 flex-1">{c.description}</p>
              <span
                className="inline-flex items-center justify-center w-full h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-light tracking-wide text-sm"
              >
                Stel jouw kast op maat samen
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground font-light text-sm mb-2">
            Niet zeker welke kast je nodig hebt?
          </p>
          <Link
            to="/faq"
            className="text-sm text-copper hover:underline font-light tracking-wide transition-colors"
          >
            Bekijk de veelgestelde vragen →
          </Link>
        </div>
      </div>

      <Dialog open={!!comingSoon} onOpenChange={(o) => !o && setComingSoon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif-display text-2xl">Binnenkort beschikbaar</DialogTitle>
            <DialogDescription className="font-light pt-2">
              Deze optie is nog in ontwikkeling. We laten het weten zodra hij online staat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setComingSoon(null)} className="rounded-sm">Sluiten</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
};

export default ProductSelection;
