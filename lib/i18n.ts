export type Locale = "en" | "nl";

export type TranslationKey =
  | "brand"
  | "navHelp"
  | "navHow"
  | "navCompare"
  | "heroTitle"
  | "heroSubtitle"
  | "chatTitle"
  | "chatPlaceholder"
  | "chatLoading"
  | "send"
  | "catBaggage"
  | "catBaggageDesc"
  | "catDelays"
  | "catDelaysDesc"
  | "catRefunds"
  | "catRefundsDesc"
  | "catNotices"
  | "catNoticesDesc"
  | "examplesTitle"
  | "compareTitle"
  | "compareSubtitle"
  | "compareWithout"
  | "compareWith"
  | "compareRun"
  | "compareRunning"
  | "policyBadge"
  | "liveBadge"
  | "flowTitle";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    brand: "Erasmus Airways",
    navHelp: "Help Center",
    navHow: "How It Works",
    navCompare: "Compare",
    heroTitle: "How can we help you today?",
    heroSubtitle:
      "Answers grounded in official policies and live travel notices.",
    chatTitle: "Travel assistant",
    chatPlaceholder: "Ask about your flight, baggage, or refund...",
    chatLoading: "Preparing your help centre...",
    send: "Send",
    catBaggage: "Baggage",
    catBaggageDesc: "Cabin bags, checked luggage, overweight fees",
    catDelays: "Delays & EU261",
    catDelaysDesc: "Compensation, duty of care, disruption rights",
    catRefunds: "Refunds & changes",
    catRefundsDesc: "Cancellations, rebooking, fare rules",
    catNotices: "Travel notices",
    catNoticesDesc: "Strikes, Schiphol, Middle East routes",
    examplesTitle: "Common questions",
    compareTitle: "Why document search matters",
    compareSubtitle:
      "Compare answers without airline documents vs. answers grounded in Erasmus Airways policies.",
    compareWithout: "Without documents",
    compareWith: "With policy search",
    compareRun: "Compare answers",
    compareRunning: "Comparing...",
    policyBadge: "Policy",
    liveBadge: "Live notice",
    flowTitle: "How your answer is found",
  },
  nl: {
    brand: "Erasmus Airways",
    navHelp: "Helpcentrum",
    navHow: "Hoe het werkt",
    navCompare: "Vergelijk",
    heroTitle: "Hoe kunnen we u helpen?",
    heroSubtitle:
      "Antwoorden op basis van officieel beleid en actuele reismededelingen.",
    chatTitle: "Reisassistent",
    chatPlaceholder: "Stel een vraag over uw vlucht, bagage of terugbetaling...",
    chatLoading: "Helpcentrum wordt geladen...",
    send: "Verstuur",
    catBaggage: "Bagage",
    catBaggageDesc: "Handbagage, ruimbagage, overgewicht",
    catDelays: "Vertraging & EU261",
    catDelaysDesc: "Compensatie, zorgplicht, rechten bij verstoring",
    catRefunds: "Terugbetalingen",
    catRefundsDesc: "Annuleringen, omboeken, tariefregels",
    catNotices: "Reismededelingen",
    catNoticesDesc: "Stakingen, Schiphol, Midden-Oosten",
    examplesTitle: "Veelgestelde vragen",
    compareTitle: "Waarom documentzoeken belangrijk is",
    compareSubtitle:
      "Vergelijk antwoorden zonder luchtvaartdocumenten vs. antwoorden op basis van Erasmus Airways beleid.",
    compareWithout: "Zonder documenten",
    compareWith: "Met beleidszoekopdracht",
    compareRun: "Vergelijk antwoorden",
    compareRunning: "Bezig met vergelijken...",
    policyBadge: "Beleid",
    liveBadge: "Live mededeling",
    flowTitle: "Hoe uw antwoord wordt gevonden",
  },
};

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export const DEMO_QUESTIONS = [
  "My flight was delayed 2.5 hours — am I entitled to compensation?",
  "My Tel Aviv flight was rerouted due to airspace restrictions and arrived 3.5 hours late — do I get EU261 compensation?",
  "Erasmus Airways cancelled my flight 10 days before departure — what are my options?",
  "What is Erasmus Airways' policy on bereavement cancellations?",
];

export const CATEGORY_PROMPTS = {
  baggage:
    "What is Erasmus Airways' policy on overweight checked baggage?",
  delays:
    "My flight was delayed — when am I entitled to EU261 compensation?",
  refunds:
    "Can I get a refund if Erasmus Airways cancels my flight?",
  notices:
    "Are there any current travel notices affecting Schiphol or Brussels?",
};
