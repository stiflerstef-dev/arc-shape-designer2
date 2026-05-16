# Tekening (DXF) per mail bij elke bestelling

Bij elke reservering ontvang jij op **info@rondefronten.nl** een mail met een DXF-tekening van het ontwerp, plus een volledige samenvatting van de configuratie. De DXF opent direct in SketchUp Free — daar kun je de boog gemakkelijk extruderen naar 3D.

## Wat de klant en jij krijgen

- **Klant**: bestaande bevestigingsmail (ongewijzigd qua look).
- **Jij**: aparte mail naar `info@rondefronten.nl` met:
  - Klantgegevens (naam, mail, telefoon, adres)
  - Volledige configuratie (afmetingen kast + boog, boogvorm, legplanken, achterwand, roede, verlichting, plaatsing)
  - Prijs
  - **Downloadlink naar het DXF-bestand** (let op: link, geen bijlage — Lovable's mailsysteem ondersteunt geen attachments)

De DXF bevat het vooraanzicht: kastomtrek, boog (halfrond / gotisch / schouder), legplanken, alle maten in mm op aparte annotatie-laag.

## Aanpak

```text
Klant submit reservering
        │
        ▼
1. Genereer DXF in de browser (client-side)
        │
        ▼
2. Upload DXF naar Cloud Storage (bucket: "design-exports")
        │
        ▼
3. Sla reservering op in 'reserveringen'-tabel
        │
        ▼
4. Trigger edge function 'send-reservation-emails'
        │       ├─ mail naar klant (bevestiging — zoals nu)
        │       └─ mail naar info@rondefronten.nl met downloadlink + samenvatting
```

## Technische details

**Email infrastructuur** (eenmalig opzetten)
- Lovable Cloud is al actief. Email-domein moet eerst geconfigureerd worden (1-klik dialoog).
- Daarna wordt automatisch de transactional-email pijplijn opgezet (queue, suppression, retry).

**DXF generatie**
- Library: `dxf-writer` (npm, werkt in browser/Deno, ~10kB).
- Vooraanzicht in mm, schaal 1:1. Layers: `KAST`, `BOOG`, `LEGPLANKEN`, `MATEN`.
- Halfrond → 1 boog. Gotisch → 2 bogen. Schouder → lijnen + 2 hoek-arcs.
- Bestandsnaam: `ronde-fronten-{datum}-{kort-id}.dxf`.

**Cloud Storage**
- Nieuwe bucket `design-exports` (privé).
- Signed URL met 30 dagen geldigheid in de mail (genoeg voor je workflow).

**Database**
- Nieuwe tabel `reserveringen` met klantgegevens, volledige configuratie (jsonb), prijs, dxf-pad. Geen login nodig — anonieme inserts via RLS-policy.

**Edge function `send-reservation-emails`**
- Triggert 2 templates: `reservation-confirmation` (klant) en `reservation-internal` (jij).
- Internal template bevat de signed DXF download URL + alle config in nette tabel.

## Wat er niet verandert

- Bestaande reserveringsmodal en validatie blijven exact zoals nu.
- Geen wijzigingen aan de configurator preview of prijslogica.
- Het matwit MDF-disclaimer en algemene voorwaarden blijven ongewijzigd.

## Wat je vooraf nog moet leveren

Als ik dit ga bouwen heb ik nodig:
1. **Domeinnaam** voor de afzender van de mails (bv. `notify.rondefronten.nl`). Ik laat een 1-klik setup-dialoog zien om dit te configureren.
2. Bevestiging dat `info@rondefronten.nl` het juiste ontvangstadres is (al opgegeven, dubbelchecken).

