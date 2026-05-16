# Finetune ronde: 6 verbeteringen

Doel: configurator strakker, duidelijker en mobielvriendelijker maken zonder de bestaande prijslogica of het bestelproces te wijzigen.

## 1. Dubbele tekst opschonen
Verwijder de zin *"Binnen 1 werkdag ontvang je een bevestiging en betaallink"* uit het prijsblok. Houd alleen één variant (in de succes-modal). Prijsblok wordt rustiger.

## 2. Configuratie delen & bewaren
Knop **"Deel ontwerp"** (Link2-icoon) onder de preview:
- Maakt URL met query-params (`?w=…&h=…&d=…&aw=…&ah=…&ax=…&ay=…&shape=…&shelves=…&color=…` etc.).
- Bij laden van zo'n URL wordt configurator vooringevuld.
- Klik → kopieert link naar clipboard + toast "Link gekopieerd. Bewaar of deel hem.".

## 3. Mobiele ervaring
- Sticky bottom-bar op `<md`: toont actuele prijs + "Bestel" CTA, altijd zichtbaar tijdens scrollen door opties.
- Subtiele "↓ Opties" hint onder preview bij eerste load (verdwijnt na eerste scroll).
- Compactere padding op opties-secties zodat meer keuzes per scherm passen.

## 4. Footer uitbreiden
Footer (nu alleen in configurator) ook tonen op `ProductSelection`, `FAQ`, `AlgemeneVoorwaarden`. Eén shared `<SiteFooter />` component met:
- Logo / merk
- Links: FAQ, Algemene Voorwaarden, Contact (mailto)
- Disclaimer "Interieurkleur ter inspiratie — kasten in matwit MDF"
- Copyright + jaar

## 5. Reset-knop prominenter en sticky
- Verplaats reset naar boven, naast titel "Configurator".
- Op desktop: sticky in de opties-kolom-header.
- Op mobile: meelopend in bovenste sticky balk.
- Variant: outline + RotateCcw-icoon + label "Reset".
- Bevestigings-dialog blijft (voorkomt per ongeluk wissen).

## 6. Disclaimer kleurkeuze duidelijker
Bij kleurkeuze-sectie: bestaande disclaimer ("ter inspiratie") in koperen badge bovenaan de kleurkiezer, niet alleen kleine grijze tekst.

## Technische notities
- Alles client-side, geen backend-wijziging.
- Nieuwe component: `src/components/SiteFooter.tsx`.
- URL-state via `URLSearchParams` + `useEffect` bij mount in `PlateConfigurator`.
- Sticky mobile bar: `fixed bottom-0 inset-x-0 md:hidden` met `safe-area-inset-bottom` padding.

## Buiten scope
- Mailflow met PDF/DXF (wacht op domeinsetup `mail.rondefronten.nl`).
- Live prijs-impact per optie (te onrustig in beeld).