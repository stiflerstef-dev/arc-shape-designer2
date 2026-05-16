import { Link } from "react-router-dom";

const SiteFooter = () => (
  <footer className="border-t border-border bg-background mt-8">
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground font-light">
      <p>© {new Date().getFullYear()} Ronde Fronten</p>
      <div className="flex items-center gap-6">
        <Link to="/algemene-voorwaarden" className="hover:text-copper transition-colors">
          Algemene voorwaarden
        </Link>
        <Link to="/faq" className="hover:text-copper transition-colors">
          FAQ
        </Link>
        <a href="mailto:info@rondefronten.nl" className="hover:text-copper transition-colors">
          Contact
        </a>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 pb-6 text-center text-[10px] text-muted-foreground/70 italic leading-relaxed">
      Kasten worden geleverd in matwit MDF. Interieurkleur is ter inspiratie — je schildert de binnenzijde zelf in de gewenste kleur.
    </div>
  </footer>
);

export default SiteFooter;