```
██╗   ██╗ ██████╗ ██╗ ██████╗███████╗
██║   ██║██╔═══██╗██║██╔════╝██╔════╝
██║   ██║██║   ██║██║██║     █████╗
╚██╗ ██╔╝██║   ██║██║██║     ██╔══╝
 ╚████╔╝ ╚██████╔╝██║╚██████╗███████╗
  ╚═══╝   ╚═════╝ ╚═╝ ╚═════╝╚══════╝

███╗   ██╗ ██████╗ ████████╗███████╗███████╗
████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
```

<p align="center">
  <strong>Voice Notes</strong> — Record, transcribe, organize. 100% local, 100% free.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/framework-Next.js%2016-purple" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/ai-Whisper_(local)-brightgreen" alt="Whisper" />
  <img src="https://img.shields.io/badge/lang-TypeScript-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="MIT" />
</p>

---

Record voice notes in browser, auto-transcribe with Whisper locally (no API keys, no cloud, no cost), organize on a drag-and-drop kanban board. Single click any note to copy text — paste straight into prompts.

## Quick Install (macOS)

```bash
brew install whisper-cpp ffmpeg node
curl -fsSL https://raw.githubusercontent.com/exhuman777/voice-notes/main/install.sh | bash
```

Then: `cd ~/voice-notes && npm run dev` and open http://localhost:6767

## Features

- **Record** voice notes directly in browser
- **Instant transcription** — Whisper runs locally, no API needed
- **Single click to copy** — tap any note to copy text to clipboard
- **Double click to edit** — opens full preview panel
- **Language selector** — Polish + English by default, 25+ more available
- **Drag & drop** between groups (Work, Personal, Prompts, Ideas)
- **File upload** — drop audio files for transcription
- **Custom groups** — add your own categories

## Requirements

- Node.js 18+
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) — local speech-to-text
- FFmpeg — audio conversion

### macOS

```bash
brew install whisper-cpp ffmpeg
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install ffmpeg

# Build whisper.cpp from source
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp && make
sudo cp main /usr/local/bin/whisper-cli
```

### Windows

Use WSL2 with Ubuntu, then follow Linux instructions.

## Setup

```bash
git clone https://github.com/exhuman777/voice-notes.git
cd voice-notes
npm install
```

Download a Whisper model (~142MB):

```bash
mkdir -p ~/.whisper-models
curl -LO --output-dir ~/.whisper-models \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

Create `.env.local`:

```bash
WHISPER_PATH=/opt/homebrew/bin/whisper-cli    # macOS, or: /usr/local/bin/whisper-cli
WHISPER_MODEL=/Users/YOU/.whisper-models/ggml-base.bin
FFMPEG_PATH=/opt/homebrew/bin/ffmpeg          # macOS, or: /usr/bin/ffmpeg
```

## Run

```bash
npm run dev
```

Open http://localhost:6767

## Usage

1. Click **Record** to start recording
2. Click **Stop** when done
3. Select a group for your note
4. Transcription happens automatically
5. **Single click** any note to copy text to clipboard
6. **Double click** to open preview/edit panel
7. Drag notes between groups to organize

## Language

Default: Polish. Switch to English or 25+ other languages via the language button in the header. Your choice is saved automatically.

For better quality with non-English languages, use a larger model:

```bash
# Small model (~466MB, better quality)
curl -LO --output-dir ~/.whisper-models \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# Large model (~3GB, best quality)
curl -LO --output-dir ~/.whisper-models \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin
```

Update `WHISPER_MODEL` in `.env.local` to point to the new model.

| Model | Size | Quality | Speed |
|-------|------|---------|-------|
| tiny | 75MB | OK | Fastest |
| base | 142MB | Good | Fast |
| small | 466MB | Great | Medium |
| medium | 1.5GB | Excellent | Slow |
| large-v3 | 3GB | Best | Slowest |

## File Structure

```
voice-notes/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── record/      # Recording + transcription
│   │   │   ├── transcribe/  # File transcription
│   │   │   ├── tasks/       # Tasks CRUD
│   │   │   ├── upload/      # File upload
│   │   │   └── files/       # File serving
│   │   ├── layout.tsx       # App layout + styles
│   │   └── page.tsx         # Main UI
│   └── lib/
│       ├── store.ts         # Zustand state
│       └── utils.ts         # Helpers
├── tasks.json               # Local database
├── uploads/                 # Audio files
├── install.sh               # One-liner installer
└── package.json
```

## Tech Stack

- Next.js 16 (App Router + Turbopack)
- React 19
- Zustand (state management)
- whisper.cpp (local transcription)
- FFmpeg (audio conversion)

## Troubleshooting

**Transcription not working:**
```bash
which whisper-cli        # Should show a path
ls ~/.whisper-models/    # Should show ggml-base.bin
```

**Empty recordings:**
- Allow microphone access when browser asks
- Check browser console (F12) for errors

**Slow transcription:**
- Use `ggml-base.bin` model (fastest with good quality)
- Avoid `auto` language detection — pick a specific language

## License

MIT
