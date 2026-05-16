import { Link } from "react-router-dom";

const TERMS_ARTICLES = [
  {
    title: "Artikel 1 — Identiteit",
    content:
      "Ronde Fronten, Cingelwal 15, 7031 CA Wehl. KVK: 42056029. BTW: NL005460524B19. E-mail: info@rondefronten.nl",
  },
  {
    title: "Artikel 2 — Toepasselijkheid",
    content:
      "Deze algemene voorwaarden zijn van toepassing op alle offertes, reserveringen en overeenkomsten tussen Ronde Fronten en de klant. Door een reservering te plaatsen via de website of anderszins, aanvaardt de klant deze voorwaarden.",
  },
  {
    title: "Artikel 3 — Aanbod en overeenkomst",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Alle prijzen op de website zijn indicatief en inclusief BTW, tenzij anders vermeld.</li>
        <li>Een overeenkomst komt tot stand op het moment dat Ronde Fronten de reservering schriftelijk bevestigt per e-mail en de klant de betaling heeft voldaan.</li>
        <li>Ronde Fronten behoudt zich het recht voor een reservering te weigeren of aanvullende voorwaarden te stellen, bijvoorbeeld bij onrealistische of technisch onuitvoerbare maatopgaven.</li>
        <li>Bij grote afwijkingen van standaardmaten of bijzondere uitvoeringen kan Ronde Fronten een aangepaste prijs opgeven vóór bevestiging.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 4 — Maatwerk en herroepingsrecht",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Alle producten van Ronde Fronten zijn maatwerk en worden op specifieke maat geproduceerd naar opgave van de klant.</li>
        <li>Op grond van artikel 6:230p sub c van het Burgerlijk Wetboek is het herroepingsrecht uitdrukkelijk uitgesloten voor maatwerk producten. De klant kan een bevestigde en betaalde bestelling niet retourneren of annuleren op basis van het wettelijk herroepingsrecht.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 5 — Maatopgave",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>De klant is zelf verantwoordelijk voor de juistheid van de opgegeven maten. Ronde Fronten produceert op basis van de maten zoals opgegeven in de reservering.</li>
        <li>Ronde Fronten adviseert de klant de ruimte nauwkeurig op te meten en de maten te controleren vóór bevestiging. Bij twijfel kan de klant contact opnemen via info@rondefronten.nl.</li>
        <li>Indien de klant onjuiste maten heeft opgegeven en het product reeds in productie is of geleverd is, kan Ronde Fronten niet aansprakelijk worden gesteld voor het niet passen of functioneren van het product.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 6 — Betaling",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Betaling dient volledig te worden voldaan na ontvangst van de bevestiging en betaallink van Ronde Fronten, vóór aanvang van de productie.</li>
        <li>Productie start uitsluitend na ontvangst van de volledige betaling.</li>
        <li>Bij niet tijdige betaling behoudt Ronde Fronten zich het recht voor de reservering te annuleren.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 7 — Annulering",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Annuleren vóór ontvangst van de bevestiging van Ronde Fronten is kosteloos mogelijk.</li>
        <li>Na bevestiging maar vóór betaling is annulering mogelijk zonder kosten, tenzij reeds materiaal is ingekocht. In dat geval worden de aantoonbare materiaalkosten in rekening gebracht.</li>
        <li>Na betaling is annulering alleen mogelijk tegen een annuleringsvergoeding van 30% van de orderwaarde, ter dekking van gemaakte materiaal- en verwerkingskosten. Bij annulering na aanvang van de productie bedraagt de vergoeding 100% van de orderwaarde.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 8 — Levertijd",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>De indicatieve levertijd bedraagt 6 tot 9 weken na ontvangst van de betaling.</li>
        <li>Deze levertijd is indicatief en geen fatale termijn. Bij overschrijding heeft de klant geen recht op schadevergoeding, tenzij de vertraging meer dan 4 weken bedraagt en aantoonbaar te wijten is aan Ronde Fronten.</li>
        <li>Ronde Fronten informeert de klant tijdig bij verwachte vertraging.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 9 — Levering en transport",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Producten worden geleverd als bouwpakket. Ronde Fronten streeft ernaar het pakket zo gebruiksklaar mogelijk aan te leveren, zodat het uit zo weinig mogelijk onderdelen bestaat.</li>
        <li>Transport wordt verzorgd door een externe partij. Ronde Fronten is niet aansprakelijk voor vertragingen door de transporteur.</li>
        <li>Verzending binnen Nederland is gratis. Voor de Waddeneilanden en overige per boot bereikbare eilanden geldt een bezorgtoeslag. Ronde Fronten neemt hierover vooraf contact op met de klant.</li>
        <li>De klant dient bij aflevering de verpakking direct te controleren op zichtbare schade. Indien de verpakking beschadigd is dient de klant direct foto's te maken van de beschadigde verpakking en eventuele schade aan de inhoud, en dit binnen 24 uur te melden via info@rondefronten.nl.</li>
        <li>Bij transportschade neemt Ronde Fronten contact op met de transporteur om tot een oplossing te komen.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 10 — Montage",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Producten worden geleverd als bouwpakket. Montage is niet inbegrepen. De klant monteert het product zelf aan de hand van de bijgeleverde instructies.</li>
        <li>Ronde Fronten is niet aansprakelijk voor schade ontstaan door onjuiste montage door de klant.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 11 — Garantie",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Ronde Fronten geeft 1 jaar garantie op de constructie en verlichting bij normaal gebruik, gerekend vanaf de leverdatum.</li>
        <li>De legplanken zijn berekend op een belasting van 25 kg per plank bij statisch gewicht en 20 kg bij impactgewicht, bij normaal gebruik.</li>
        <li>Garantie vervalt bij onjuiste montage door de klant, gebruik niet in overeenstemming met de bestemming, vochtschade of waterschade of extreme temperatuurwisselingen, of beschadiging door de klant of derden.</li>
        <li>Garantie op de binnenzijdekleur is uitgesloten, aangezien de klant de binnenzijde zelf schildert.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 12 — Klachten",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Klachten over de geleverde producten dienen binnen 7 dagen na ontvangst schriftelijk te worden gemeld via info@rondefronten.nl, voorzien van duidelijke foto's en een beschrijving van de klacht.</li>
        <li>Ronde Fronten streeft ernaar klachten binnen 5 werkdagen te beantwoorden.</li>
        <li>Bij een gegronde klacht zal Ronde Fronten naar eigen inzicht overgaan tot herstel, vervanging of een passende vergoeding.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 13 — Aansprakelijkheid",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>De aansprakelijkheid van Ronde Fronten is beperkt tot de factuurwaarde van het geleverde product.</li>
        <li>Ronde Fronten is niet aansprakelijk voor gevolgschade, waaronder schade aan muren, vloeren of andere eigendommen bij montage.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 14 — Persoonsgegevens",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Ronde Fronten verwerkt persoonsgegevens uitsluitend ten behoeve van de uitvoering van de overeenkomst en handelt conform de Algemene Verordening Gegevensbescherming (AVG).</li>
        <li>Gegevens worden niet gedeeld met derden, behoudens de transporteur voor de bezorging.</li>
      </ol>
    ),
  },
  {
    title: "Artikel 15 — Geschillen en toepasselijk recht",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Op alle overeenkomsten is Nederlands recht van toepassing.</li>
        <li>Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Gelderland.</li>
      </ol>
    ),
  },
];

export default function AlgemeneVoorwaarden() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-10">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-copper transition-colors"
          >
            ← Terug naar de configurator
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="font-serif-display text-4xl md:text-5xl text-foreground mb-3">
            Algemene Voorwaarden
          </h1>
          <p className="text-muted-foreground font-light tracking-wide">
            Ronde Fronten — Versie 1.0, mei 2026
          </p>
        </div>

        <div className="space-y-10">
          {TERMS_ARTICLES.map((article, index) => (
            <section key={index}>
              <h2 className="font-serif-display text-xl text-foreground mb-3">
                {article.title}
              </h2>
              <div className="text-muted-foreground font-light leading-relaxed text-sm">
                {article.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
