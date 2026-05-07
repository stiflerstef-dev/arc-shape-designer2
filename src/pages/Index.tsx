import { useState } from "react";
import PlateConfigurator from "@/components/PlateConfigurator";
import ProductSelection, { ProductId } from "@/components/ProductSelection";

type Dims = { width: number; height: number; depth: number };

const PRESETS: Record<"small" | "large", Dims> = {
  small: { width: 80, height: 190, depth: 25 },
  large: { width: 120, height: 250, depth: 40 },
};

const Index = () => {
  const [selected, setSelected] = useState<ProductId | null>(null);

  if (selected === "small" || selected === "large") {
    return <PlateConfigurator initialCabinet={PRESETS[selected]} onBack={() => setSelected(null)} />;
  }

  return <ProductSelection onSelect={setSelected} comingSoon={selected === "halmeubel" || selected === "combi" ? selected : null} onDismissComingSoon={() => setSelected(null)} />;
};

export default Index;
