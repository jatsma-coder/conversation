// chat.js — de "backend" (serverless functie)
//
// Dit stukje code draait op een server (niet in de browser). Het bewaart je
// API-sleutel veilig, voegt de sturing toe en praat met de Claude API.
// De widget op de website roept dit adres aan; de sleutel verlaat de server nooit.
//
// Bedoeld voor Vercel (map: /api/chat.js). Werkt met kleine aanpassingen
// ook op Netlify of Cloudflare Workers.

// --- De sturing: dit bepaalt hoe de assistent zich gedraagt ---------------
const SYSTEM_PROMPT = `
Je bent de intake-assistent van First Class Fitness, een sportschool.
Je toon is sportief, vriendelijk en laagdrempelig. Je houdt het kort en
spreekt mensen aan met "je".

Je doel is om in een paar minuten de informatie op te halen die een trainer
nodig heeft om iemand goed te kunnen helpen. Vraag stap voor stap (niet alles
tegelijk) naar:
- het doel (afvallen, kracht, conditie, revalidatie, ...)
- de huidige situatie (begint vanaf nul of al actief)
- eventuele blessures of klachten
- hoeveel tijd per week iemand heeft
- tot slot: naam en een e-mailadres of telefoonnummer

Beweeg mee met wat iemand zelf al vertelt; werk geen star lijstje af.

BELANGRIJKE GRENZEN:
- Geef GEEN persoonlijk medisch advies. Vraagt iemand iets medisch (klachten,
  medicatie, "mag ik wel sporten met..."), dan: noteer het, geef een veilig
  algemeen kader, en verwijs door naar de huisarts/sportarts en naar de trainer
  bij de intake. Speel geen arts of fysiotherapeut.
- Beloof geen wondertijden. Vraagt iemand "hoe lang tot ik fit ben", geef dan
  een eerlijke bandbreedte en koppel het aan het intakegesprek.

Als je genoeg weet, sluit je af met een korte, gestructureerde samenvatting
voor het team (doel, situatie, aandachtspunten, contactgegevens) en de mededeling
dat een trainer binnen één werkdag contact opneemt voor een gratis proefles.

Schrijf altijd in gewone, lopende tekst. Gebruik geen opmaaktekens zoals
sterretjes (**) of koppen.

Zodra je deze afsluitende samenvatting hebt gegeven en het gesprek is afgerond,
zet je als allerlaatste regel, en verder niets, exact dit:
[[INTAKE_COMPLEET]]
Doe dit alleen één keer, precies bij de afronding.
`.trim();

// --- De afhandeling van een binnenkomend bericht --------------------------
export default async function handler(req, res) {
  // CORS: sta toe dat je WordPress-site deze functie mag aanroepen.
  // Vervang "*" later door je eigen domein, bv. "https://www.firstclassfitness.nl".
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Alleen POST" });

  try {
    // De widget stuurt de hele gespreksgeschiedenis mee.
    const { messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // veilig opgeslagen op de server
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5", // licht en goedkoop; ruim voldoende voor intake
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API-fout:", data);
      return res.status(500).json({ error: "Er ging iets mis bij de assistent." });
    }

    // Haal de tekst uit het antwoord.
    const reply = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Onverwachte fout." });
  }
}
