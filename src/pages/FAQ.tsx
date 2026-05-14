import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "Hoe meet ik mijn nis correct op?",
    answer:
      "Meet hoogte, breedte en diepte op minimaal 3 punten. Gebruik altijd de kleinste maat. In de productie wordt de kast altijd nog een paar millimeter kleiner gemaakt, zodat hij gegarandeerd fijnloos past.",
  },
  {
    id: "faq-2",
    question: "Welke boogvorm past bij mijn interieur?",
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Halfrond</strong> — tijdloos en klassiek, past in vrijwel elk interieur
        </li>
        <li>
          <strong>Gotisch</strong> — puntig en dramatisch, mooi bij hoog plafond en klassieke details
        </li>
        <li>
          <strong>Schouder</strong> — subtiel en modern, strak bij een hedendaagse inrichting
        </li>
      </ul>
    ),
  },
  {
    id: "faq-3",
    question: "Hoe diep moet een boogkast zijn?",
    answer:
      "Voor boeken en decoratie is 25–30 cm meestal voldoende. Voor opbergruimte met manden of dozen reken je op 35–40 cm. Moet je er kleding in hangen? Dan is 55 cm of dieper wenselijk. Wil je 80 cm diep? Geen probleem, we maken hem op maat.",
  },
  {
    id: "faq-5",
    question: "Van welk materiaal worden de kasten gemaakt?",
    answer:
      "De kasten worden vervaardigd uit MDF die vooraf in een matte witte primer wordt gezet. De constructie zelf is van lichtgewicht en sterk multiplex.",
  },
  {
    id: "faq-6",
    question: "Kan ik de kast zelf monteren?",
    answer:
      "Laten plaatsen doen wij niet, maar ken je iemand die handig is? Regel dat dan alvast. De kast wordt in voorgebouwde delen geleverd met duidelijke montage-instructies.",
  },
  {
    id: "faq-7",
    question: "Hoe lang duurt de levering?",
    answer:
      "De levering is 6 tot 10 weken. Je ontvangt een mail wanneer jouw kast onderweg is.",
  },
  {
    id: "faq-8",
    question: "Wat als de kast niet past?",
    answer:
      "Omdat elke kast exact op jouw maat wordt gemaakt, is hij niet retourneerbaar. We controleren je opgaven zorgvuldig voor we beginnen met productie. Twijfel je? Stuur gerust een foto van je nis mee bij je aanvraag.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-copper transition-colors"
          >
            ← Terug naar configurator
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-serif-display text-4xl md:text-5xl text-foreground mb-3">
            Veelgestelde vragen
          </h1>
          <p className="text-muted-foreground font-light tracking-wide">
            Alles wat je wilt weten over jouw boogkast op maat.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-b border-border">
              <AccordionTrigger className="text-left font-serif-display text-lg text-foreground hover:text-copper hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground font-light text-sm mb-4">
            Staat jouw vraag er niet tussen?
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-light tracking-wide text-sm transition-colors"
          >
            Start de configurator
          </Link>
        </div>
      </div>
    </div>
  );
}
