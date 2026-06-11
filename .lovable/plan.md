Twee dingen tegelijk fixen:

1. **Plint door kast heen**: de perspectief-bovenvlak en perspectief-rechterzijvlak van de plint steken boven `yBot` uit en overlappen daardoor het kastdeel en het 3D-zijpaneel.
2. **Kleurmatch**: deuren en plint moeten exact dezelfde kleur als de boogkast krijgen (`cabFrontCol`, dat ook door het kastfront en zij/top wordt gebruikt) ipv hardgecodeerde `COL.front`.

Aanpak in `PlateConfigurator.tsx`, halmeubel-blok (rond regels 1253–1362):

- Verwijder de perspectief-bovenvlak polygon van de plint (die ligt volledig boven `yBot` en is in werkelijkheid afgedekt door de overhangende kastbodem).
- Vervang het perspectief-rechterzijvlak door een trapezium met een **vlakke bovenrand op `yBot`** ipv slanting omhoog naar `yBot - pdy`. Zo blijft alles op of onder de kastbodem en steekt niets meer door de kast.
- Zet `lowerFrontCol = cabFrontCol`, `doorCol = cabFrontCol`, en de plint-front `fill = cabFrontCol`. Doorstroke en stroke blijven `COL.frontStroke`.

Geen andere code raken.