import { useState } from "react";
import PlateConfigurator from "@/components/PlateConfigurator";
import ProductSelection, { ProductId } from "@/components/ProductSelection";

const PRESETS = {
  small: {
    cabinet: { width: 80, height: 190, depth: 25 },
    // A = 10 cm, B = 10 cm, C = 25 cm, D = 15 cm (boog 60×150)
    arch: { width: 60, height: 150, position: { x: 10, y: 25 } },
  },
  large: {
    cabinet: { width: 120, height: 250, depth: 40 },
    // A = 20 cm, B = 20 cm, C = 50 cm, D = 0 cm (boog 80×200)
    arch: { width: 80, height: 200, position: { x: 20, y: 50 } },
  },
  halmeubel: {
    // Boogkast bovenop onderkastje. Boognis = 90 × 130 (A=15, B=15, C=20, D=0), onderkast = 120 × 80 × 50, plint = 10.
    cabinet: { width: 120, height: 150, depth: 40 },
    arch: { width: 90, height: 130, position: { x: 15, y: 20 } },
  },
} as const;

const Index = () => {
  const [selected, setSelected] = useState<"small" | "large" | "halmeubel" | null>(null);

  if (selected) {
    const preset = PRESETS[selected];
    return (
      <PlateConfigurator
        initialCabinet={preset.cabinet}
        initialArch={preset.arch ? { ...preset.arch, position: { ...preset.arch.position } } : undefined}
        mode={selected === "halmeubel" ? "halmeubel" : "boogkast"}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <ProductSelection
      onSelect={(id: ProductId) => {
        if (id === "small" || id === "large" || id === "halmeubel") setSelected(id);
      }}
    />
  );
};

export default Index;
