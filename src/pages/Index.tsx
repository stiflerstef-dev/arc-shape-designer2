import { useState } from "react";
import PlateConfigurator from "@/components/PlateConfigurator";
import ProductSelection, { ProductId } from "@/components/ProductSelection";

const PRESETS = {
  small: { width: 80, height: 190, depth: 25 },
  large: { width: 120, height: 250, depth: 40 },
} as const;

const Index = () => {
  const [selected, setSelected] = useState<"small" | "large" | null>(null);

  if (selected) {
    return <PlateConfigurator initialCabinet={PRESETS[selected]} onBack={() => setSelected(null)} />;
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
