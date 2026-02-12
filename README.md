# Voice Notes

Record, transcribe, and organize voice notes with automatic speech-to-text.

Nagrywaj, transkrybuj i organizuj notatki głosowe z automatycznym rozpoznawaniem mowy.

## Quick Install / Szybka instalacja

```bash
# macOS (requires Homebrew)
brew install whisper-cpp ffmpeg node
curl -fsSL https://raw.githubusercontent.com/exhuman777/voice-notes/main/install.sh | bash
```

Then run: `cd ~/voice-notes && npm run dev` → http://localhost:3000

## Features / Funkcje

- **Record** voice notes directly in browser / Nagrywaj notatki głosowe w przeglądarce
- **Automatic transcription** using Whisper / Automatyczna transkrypcja przez Whisper
- **Custom groups** - organize notes your way / Własne grupy - organizuj po swojemu
- **Drag & drop** between groups / Przeciągaj między grupami
- **File upload** - drop any file / Wrzuć dowolny plik

## Requirements / Wymagania

- Node.js 18+
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) - local speech-to-text
- FFmpeg - audio conversion

### macOS (Homebrew)

```bash
# Install whisper.cpp
brew install whisper-cpp

# Install FFmpeg
brew install ffmpeg

# Download Whisper model (base is recommended, ~140MB)
# Pobierz model Whisper (base zalecany, ~140MB)
mkdir -p ~/.whisper-models
cd ~/.whisper-models
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

### Linux (Ubuntu/Debian)

```bash
# Install FFmpeg
sudo apt update && sudo apt install ffmpeg

# Build whisper.cpp from source
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make
sudo cp main /usr/local/bin/whisper-cli

# Download model
mkdir -p ~/.whisper-models
curl -L -o ~/.whisper-models/ggml-base.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

### Windows (WSL recommended / WSL zalecane)

Use WSL2 with Ubuntu, then follow Linux instructions.

Użyj WSL2 z Ubuntu, potem postępuj jak dla Linuxa.

## Setup / Instalacja

```bash
# Clone repository / Sklonuj repozytorium
git clone https://github.com/anthropics/voice-notes.git
cd voice-notes

# Install dependencies / Zainstaluj zależności
npm install

# Configure whisper path (edit if different)
# Skonfiguruj ścieżkę whisper (edytuj jeśli inna)
```

**Option A: Environment variables / Zmienne środowiskowe:**

Create `.env.local`:
```bash
WHISPER_PATH=/opt/homebrew/bin/whisper-cli
WHISPER_MODEL=/Users/you/.whisper-models/ggml-base.bin
FFMPEG_PATH=/opt/homebrew/bin/ffmpeg
```

**Option B: Edit source / Edytuj źródło:**

Edit `src/app/api/record/route.ts` and `src/app/api/transcribe/route.ts`

## Run / Uruchomienie

```bash
# Development
npm run dev

# Open browser / Otwórz przeglądarkę
open http://localhost:3034
```

## Usage / Użycie

1. Click **Record** to start recording / Kliknij **Record** żeby nagrać
2. Click **Stop** when done / Kliknij **Stop** gdy skończysz
3. Select a group for your note / Wybierz grupę dla notatki
4. Wait for transcription / Poczekaj na transkrypcję
5. Drag notes between groups / Przeciągaj notatki między grupami

## Language Support / Obsługa języków

Whisper automatically detects language (Polish, English, and 90+ others).

Whisper automatycznie wykrywa język (polski, angielski i 90+ innych).

For better Polish transcription, use larger model:

Dla lepszej transkrypcji po polsku, użyj większego modelu:

```bash
# Download large model (~3GB) / Pobierz duży model (~3GB)
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin
```

## Models / Modele

| Model | Size | Quality | Speed |
|-------|------|---------|-------|
| tiny | 75MB | ★★☆☆☆ | Fastest |
| base | 142MB | ★★★☆☆ | Fast |
| small | 466MB | ★★★★☆ | Medium |
| medium | 1.5GB | ★★★★☆ | Slow |
| large-v3 | 3GB | ★★★★★ | Slowest |

## File Structure / Struktura plików

```
voice-notes/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── record/     # Recording endpoint
│   │   │   ├── transcribe/ # Transcription endpoint
│   │   │   ├── tasks/      # Tasks CRUD
│   │   │   ├── upload/     # File upload
│   │   │   └── files/      # File serving
│   │   ├── layout.tsx      # App layout + CSS
│   │   └── page.tsx        # Main UI
│   └── lib/
│       ├── store.ts        # Zustand state
│       └── utils.ts        # Helpers
├── tasks.json              # Tasks database
├── uploads/                # Uploaded files
└── package.json
```

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Zustand (state)
- whisper.cpp (transcription)
- FFmpeg (audio conversion)

## Troubleshooting / Rozwiązywanie problemów

**Transcription not working / Transkrypcja nie działa:**
```bash
# Check whisper installation / Sprawdź instalację whisper
which whisper-cli
whisper-cli --help

# Check model exists / Sprawdź czy model istnieje
ls -la ~/.whisper-models/
```

**Empty recordings / Puste nagrania:**
- Allow microphone access in browser / Zezwól na mikrofon w przeglądarce
- Check browser console for errors / Sprawdź konsolę przeglądarki

**FFmpeg errors / Błędy FFmpeg:**
```bash
which ffmpeg
ffmpeg -version
```

## License

MIT
