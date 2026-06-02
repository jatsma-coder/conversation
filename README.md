# First Class Fitness — intake-assistent (proefopzet)

Twee onderdelen:
- `api/chat.js` — de backend (serverless functie). Bewaart je API-sleutel en de sturing.
- `widget.html` — de chatbubbel die je in WordPress plakt.

De API-sleutel zit **alleen** in de backend, nooit in de widget.

## Stap 1 — API-sleutel
Maak een account op console.anthropic.com, zet er wat tegoed op en maak een API-sleutel aan. Bewaar die even apart.

## Stap 2 — Backend op Vercel zetten
1. Maak een gratis account op vercel.com.
2. Maak een nieuw project met daarin de map `api` en daarin `chat.js` (precies zoals hier).
3. Zet bij het project onder *Settings → Environment Variables* een variabele:
   - naam: `ANTHROPIC_API_KEY`
   - waarde: je sleutel uit stap 1
4. Deploy. Je krijgt een adres als `https://jouw-project.vercel.app`.
   Je functie is dan bereikbaar op `https://jouw-project.vercel.app/api/chat`.

## Stap 3 — Widget koppelen
Open `widget.html` en vervang bij `BACKEND_URL` het voorbeeldadres door jouw
functie-adres uit stap 2.

## Stap 4 — In WordPress plakken
Voeg op een pagina een **Aangepaste HTML**-blok toe en plak de volledige inhoud
van `widget.html` erin. Publiceer en test de bubbel rechtsonder.

## Daarna (optioneel)
- **Veiliger:** vervang in `chat.js` de `Access-Control-Allow-Origin` van `*`
  door je eigen domein.
- **Leads ontvangen:** laat de backend de samenvatting per e-mail versturen
  (bijv. via een dienst als Resend) of wegschrijven naar een Google Sheet.
- **Toon/vragen aanpassen:** alles wat de assistent doet, pas je aan in de
  `SYSTEM_PROMPT` bovenin `chat.js`.

## Kosten
Met Haiku 4.5 ($1 / $5 per miljoen tokens) kost een gesprek als dit doorgaans
centen. "Prompt caching" kan het herhaalde instructiedeel nog flink goedkoper
maken als je later veel verkeer krijgt.
