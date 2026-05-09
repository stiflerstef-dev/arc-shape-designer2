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
    arch: undefined,
  },
} as const;

const Index = () => {
  const [selected, setSelected] = useState<"small" | "large" | null>(null);

  if (selected) {
    const preset = PRESETS[selected];
    return (
      <PlateConfigurator
        initialCabinet={preset.cabinet}
        initialArch={preset.arch ? { ...preset.arch, position: { ...preset.arch.position } } : undefined}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <ProductSelection
      onSelect={(id: ProductId) => {
        if (id === "small" || id === "large") setSelected(id);
      }}
    />
  );
};

export default Index;
