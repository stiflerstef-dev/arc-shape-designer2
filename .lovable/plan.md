# Plan: Disclaimer footnote voor gratis levering asterisk

## Wat
De regel "Gratis verzending binnen Nederland*" in de prijs-sectie heeft een asterisk die nergens naartoe verwijst. Een korte voetnoot toevoegen die uitlegt dat dit niet geldt voor de Waddeneilanden en eventueel andere regio's met hogere transportkosten.

## Wijziging
- In `src/components/PlateConfigurator.tsx`, direct onder de prijs-bulletlijst een kleine footnote toevoegen (bijv. 10px, italic, grijs) met tekst als: "* Op de Waddeneilanden en enkele andere regio's kunnen aanvullende transportkosten gelden."

## Details
- Styling: past bij bestaande esthetiek — klein, subtiel, `text-muted-foreground/60 italic`
- Plaatsing: direct onder de `<ul>` met prijs-voordelen, boven de "Jouw prijs" label
