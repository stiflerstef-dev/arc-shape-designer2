De plint oogt nu raar omdat hij als een aparte 3D-vorm vóór de kast getekend wordt (met eigen top- en zijvlak in perspectief), terwijl de onderkast zelf doorloopt tot de buitenrand. Daardoor ziet hij eruit als een platform/uitstulping in plaats van een echte terugliggende sokkel.

Specificatie (bevestigd):
- Hoogte: 100mm
- Terugliggend: 50mm aan voorzijde én aan beide zijkanten
- Zelfde matwit MDF kleur als de kast

Aanpak (alleen in `src/components/PlateConfigurator.tsx`, halmeubel 3D-preview):

1. Verwijder de huidige plint-rendering (top-polygon, zijvlak-polygon, schaduwlijn, perspectief-front-offset).
2. Teken in plaats daarvan:
   - Een donker "schaduw"-vlak over de volledige plintzone (xL→xR, yBot→yPlinth) dat de terugliggende holte suggereert.
   - Een terugliggend perspectief-bovenvlak: het stukje kastbodem dat zichtbaar wordt doordat de plint 50mm naar achteren staat (smal horizontaal vlak direct onder de kastbodem, in `COL.top` met lichte schaduw).
   - De plint zelf als eenvoudige rechthoek, gecentreerd: `x = xL + 50mm*scale`, `width = cabinet.width - 100mm`, `y = yBot`, `height = 100mm*scale`, kleur `COL.front` met `COL.frontStroke`.
   - Een subtiele schaduw aan de bovenkant van de plint (onder de kastbodem) zodat duidelijk is dat de kast over de plint hangt.
3. Geen perspectief-zijvlak meer aan de rechterkant van de plint — die suggereerde een uitstekend blok. Het bestaande 3D-zijpaneel van de kast loopt al door tot de grond (`sideBottomCm`), dus visueel klopt dat als de plint smaller is.
4. Pas eventueel `sideBottomCm` aan zodat het 3D-zijpaneel stopt op `yBot` (onderkant kast) in plaats van door te lopen achter de plint — dat versterkt de indruk dat de plint terugligt.

Deur-, divider-, prijs-, maatlijn- en bovenaanzichtlogica blijven ongemoeid.