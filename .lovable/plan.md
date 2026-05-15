## Doel

Het rechterpaneel van de configurator toont nu zes losse blokken onder elkaar (Kast, Boog, Kleur, Plaatsing, Achterwand, Opties). Dat oogt druk. We groeperen ze in uitvouwbare velden (accordion) zodat de gebruiker per categorie inklapt en focus krijgt op wat hij configureert.

## Voorgestelde indeling

Twee altijd-zichtbare basisblokken bovenaan (geen accordion — dit zijn de kernkeuzes), daaronder drie inklapbare secties:

```
┌─ AFMETINGEN (altijd open, niet inklapbaar)
│   ├─ Kast Afmetingen
│   └─ Boog Afmetingen + boogvorm
│
├─ ▸ Plaatsing in de ruimte         (collapsed by default)
├─ ▾ Interieur kleur                 (collapsed by default)
├─ ▾ Extra opties                    (open by default)
│   ├─ Legplanken
│   ├─ Achterwand (matwit MDF)
│   ├─ Roede (ovaal)
│   └─ Verlichting
```

### Waarom deze indeling

- **Afmetingen** zijn de eerste keuze die elke klant maakt — die moeten meteen zichtbaar zijn, geen extra klik.
- **Plaatsing** wordt vaak één keer ingesteld en dan vergeten — prima om in te klappen.
- **Interieur kleur** is "pure inspiratie" (disclaimer-feature). Hoort bij de beleving, mag dichtgeklapt starten zodat het de focus niet steelt.
- **Extra opties** worden samengevoegd: legplanken + achterwand + roede + verlichting horen logisch bij elkaar als "wat zit er in de kast". Open by default omdat dit de upsell-zone is en de prijs zichtbaar laat bewegen.

## Gedrag

- Eén sectie per keer open mag, of meerdere tegelijk — voorstel: **meerdere tegelijk** (`type="multiple"`), zodat een gebruiker bv. plaatsing en kleur tegelijk kan zien.
- Header toont sectienaam + chevron; klik op de hele balk vouwt uit.
- Smooth open/close animatie (zit al in de shadcn Accordion).
- Styling matched bestaande artisan look: Playfair Display headers, dunne border, copper hover.

## Technische details

- Bestand: `src/components/PlateConfigurator.tsx` (rond regels 1140–1620)
- Vervang de zes losse `<section>`/`<Card>` blokken door een `<Accordion type="multiple" defaultValue={["opties"]}>` met `AccordionItem` per sectie.
- Component `accordion.tsx` is al aanwezig — geen nieuwe dependency.
- "Achterwand" als losse sectie verdwijnt en wordt een rij binnen "Extra opties" (zelfde switch + thumbnail).
- Geen prijsberekening of validatielogica raken — puur layout.

## Open vraag

Vóór ik begin: wil je deze indeling, of liever een andere groepering (bijv. ook Boog inklapbaar, of Plaatsing samen met Achterwand)?
