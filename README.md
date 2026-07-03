# Portfolio Fotografico - Ritratti

Questo è un sito web a pagina singola, moderno e minimale, progettato per fotografi che desiderano esporre i propri ritratti in formato verticale (portrait). Il sito è ottimizzato sia per schermi desktop che per dispositivi mobili ed è pronto per essere ospitato gratuitamente su **GitHub Pages**.

## Funzionalità

- **Caricamento automatico a "Zero Configurazione"**: Rileva automaticamente le immagini presenti nella cartella `images/` senza che tu debba mai modificare il codice HTML.
- **Design Responsive Premium**: Un tema scuro raffinato con font eleganti e transizioni fluide.
- **Ottimizzato per Ritratti**: Le foto occupano la massima altezza possibile su desktop senza costringere a scorrere la pagina, e si adattano in larghezza su mobile.
- **Navigazione Flessibile**: Supporta click sui pallini indicatori, swipe su mobile, frecce della tastiera e pulsanti direzionali.
- **Presentazione Autoplay**: Modalità slideshow automatica con pulsante di controllo Play/Pausa.

---

## Come aggiungere le tue foto

Il carosello legge i file direttamente dalla cartella `images/`. Per aggiungere nuove foto o sostituire quelle esistenti:

1. Salva i tuoi ritratti all'interno della cartella `images/`.
2. Assegna loro un nome sequenziale che rispetti questo formato:
   - **`IMG001.jpg`**
   - **`IMG002.jpg`**
   - **`IMG003.jpg`**
   - **`IMG004.jpg`** (e così via...)
3. Lo script supporta le estensioni di file più comuni: `.jpg`, `.jpeg` e `.png` (sia minuscole che maiuscole).

> [!IMPORTANT]
> **La numerazione deve essere consecutiva.** Non saltare nessun numero (es. non passare da `IMG002` a `IMG004` senza avere `IMG003`), altrimenti lo script penserà che le foto siano finite e si fermerà prima di rilevare le successive.

---

## Come testare il sito in locale (sul proprio computer)

A causa dei sistemi di sicurezza dei browser moderni relativi all'accesso ai file locali, per caricare correttamente le immagini in modalità di sviluppo locale è consigliabile avviare un server locale anziché fare doppio click sul file `index.html`.

Ecco alcuni modi semplici per farlo:

### Metodo A: Estensione di VS Code (Consigliato)
Se utilizzi **VS Code**, installa l'estensione **Live Server**, apri la cartella del progetto e clicca su **Go Live** in basso a destra.

### Metodo B: Tramite Python
Se hai Python installato sul computer, apri il terminale nella cartella del progetto e digita:
- Python 3: `python -m http.server 8000`
- Python 2: `python -m SimpleHTTPServer 8000`
Dopodiché apri il browser su `http://localhost:8000`.

---

## Come pubblicare il sito su GitHub Pages

Per pubblicare il tuo sito sul tuo profilo personale GitHub:

1. Accedi a [GitHub](https://github.com/) e crea un nuovo repository pubblico (es. `sito-ritratti`).
2. Esegui il push dei file di questo progetto sul repository:
   ```bash
   git init
   git add .
   git commit -m "Primo commit: portfolio ritratti"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/sito-ritratti.git
   git push -u origin main
   ```
3. Su GitHub, vai nelle **Settings** (Impostazioni) del tuo repository.
4. Nel menu laterale sinistro, clicca su **Pages**.
5. Sotto la voce **Build and deployment**, seleziona come **Source** "Deploy from a branch".
6. Sotto **Branch**, seleziona `main` (o la tua branch principale) e la cartella `/ (root)`.
7. Clicca su **Save**.

Dopo circa un minuto, il tuo sito sarà accessibile pubblicamente all'indirizzo:
`https://TUO-UTENTE.github.io/sito-ritratti/`
