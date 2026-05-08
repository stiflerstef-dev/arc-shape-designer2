import { useState } from "react";
import PlateConfigurator from "@/components/PlateConfigurator";
import ProductSelection, { ProductId } from "@/components/ProductSelection";

const PRESETS = {
  small: {
    cabinet: { width: 80, height: 190, depth: 25 },
    // A = 5 cm, B = 5 cm, C = 5 cm, D = 20 cm
    arch: { width: 70, height: 165, position: { x: 5, y: 5 } },
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
