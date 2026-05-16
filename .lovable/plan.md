# Tekening (PDF + DXF) per mail bij elke bestelling

Bij elke reservering ontvang jij op **info@rondefronten.nl** een mail met **twee** downloadlinks:

1. **PDF** — technische tekening met alle maten, opent op telefoon/laptop/tablet zonder software. Perfect onderweg.
2. **DXF** — vectorbestand dat je thuis direct in SketchUp Free opent om naar 3D te trekken.

Plus een volledige samenvatting van de configuratie en klantgegevens.

## Wat de klant en jij krijgen

- **Klant**: bestaande bevestigingsmail (ongewijzigd qua look).
- **Jij** (`info@rondefronten.nl`): aparte interne mail met:
  - Klantgegevens (naam, mail, telefoon, adres)
  - Volledige configuratie (afmetingen, boogvorm, legplanken, achterwand, roede, verlichting, plaatsing, kleur)
  - Prijs
  - **Downloadlink PDF** (overal te openen)
  - **Downloadlink DXF** (voor SketchUp thuis)

Beide bestanden bevatten het vooraanzicht 1:1 op schaal: kastomtrek, boog (halfrond / gotisch / schouder), legplanken, en maatvoering in mm.

**Let op:** Lovable's mailsysteem ondersteunt geen bijlages. De bestanden gaan dus mee als downloadlinks, geen attachments. Voor jouw workflow (telefoon openen, thuis downloaden naar SketchUp) is dat zelfs handiger.

## Aanpak

```text
Klant submit reservering
        │
        ▼
1. Genereer PDF + DXF in de browser (client-side)
        │
        ▼
2. Upload beide naar Cloud Storage (bucket: "design-exports")
        │
        ▼
3. Sla reservering op in 'reserveringen'-tabel
        │
        ▼
4. Trigger edge function 'send-reservation-emails'
        │       ├─ mail naar klant (bevestiging — zoals nu)
        │       └─ mail naar info@rondefronten.nl met
        │          ├─ samenvatting + klantgegevens
        │          ├─ PDF downloadlink
        │          └─ DXF downloadlink
```

## Technische details

**PDF generatie**
- Library: `jsPDF` (al populair, ~100kB). Werkt client-side.
- A4 portret, vooraanzicht gecentreerd op schaal, maten in mm.
- Header met "Ronde Fronten — Ontwerp #{kort-id}", footer met datum + klantnaam.
- Onderaan: configuratie-tabel (alle gekozen opties).

**DXF generatie**
- Library: `dxf-writer` (~10kB), client-side.
- Vooraanzicht in mm, schaal 1:1. Layers: `KAST`, `BOOG`, `LEGPLANKEN`, `MATEN`.
- Halfrond → 1 boog. Gotisch → 2 bogen. Schouder → lijnen + 2 hoek-arcs.

**Bestandsnamen**
- `ronde-fronten-{datum}-{kort-id}.pdf`
- `ronde-fronten-{datum}-{kort-id}.dxf`

**Email infrastructuur** (eenmalig opzetten)
- Lovable Cloud is al actief. Email-domein moet eerst geconfigureerd worden (1-klik dialoog).
- Daarna wordt automatisch de transactional-email pijplijn opgezet (queue, suppression, retry).

**Cloud Storage**
- Nieuwe bucket `design-exports` (privé).
- Signed URLs met 30 dagen geldigheid in de mail.

**Database**
- Nieuwe tabel `reserveringen` met klantgegevens, volledige configuratie (jsonb), prijs, pdf-pad, dxf-pad. Anonieme inserts via RLS-policy (geen login nodig).

**Edge function `send-reservation-emails`**
- Triggert 2 templates: `reservation-confirmation` (klant) en `reservation-internal` (jij).
- Internal template bevat beide signed download-URLs + alle config in nette tabel.

## Wat er niet verandert

- Bestaande reserveringsmodal en validatie blijven exact zoals nu.
- Geen wijzigingen aan de configurator preview of prijslogica.
- Het matwit MDF-disclaimer en algemene voorwaarden blijven ongewijzigd.

## Wat je vooraf nog moet leveren

Als ik dit ga bouwen heb ik nodig:
1. **Domeinnaam** voor de afzender van de mails (bv. `notify.rondefronten.nl`). Ik laat een 1-klik setup-dialoog zien om dit te configureren.
2. Bevestiging dat `info@rondefronten.nl` het juiste ontvangstadres is.

