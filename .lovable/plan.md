Twee artefacten te fixen in de halmeubel 3D-preview (`PlateConfigurator.tsx`, plintblok):

1. Zwarte randen aan de zijkant: komt door het volledig-breed donkere "schaduw"-rechthoek (xL→xR) dat ik over de hele plintzone leg. Aan de linkerkant is daar geen kast vóór, dus je ziet pure zwarte strookjes.
2. Plint loopt niet door aan de rechterkant: het 3D-zijpaneel van de kast stopt op `yBot`, en de plint heeft zelf geen perspectief-zijvlak. Daardoor lijkt de plint abrupt op te houden ipv subtiel door te lopen in de diepte.

Aanpak:
- Vervang het volle-breedte zwart vlak door alleen donkere strookjes in de recessed zones:
  - links: `xL` → `xPL`, hoogte `plinthH`, donker maar warm (`shade(COL.side, -40)`)
  - rechts: `xPR` → `xR`, idem
  - top onder kastbodem: alleen over plintbreedte (`xPL` → `xPR`), dun strookje
- Voeg een perspectief-rechterzijvlak van de plint toe, ingezet vanaf `xR - psx` met diepte `(lowerCab.depth - 2*PLINTH_SETBACK)/lowerCab.depth * dxS`, kleur `shade(COL.side, -15)`. Daardoor zie je de plint subtiel in de diepte doorlopen, set back vanaf de kastzijde.
- Voeg ook een klein perspectief-bovenvlak van de plint toe (smal trapezium), kleur `COL.top`, zodat de bovenrand van de plint achter de kastbodem doorloopt en niet plat oogt.
- Behoud de gecentreerde matwit front-rechthoek en de subtiele topschaduw onder de kast.

Geen andere code raken.