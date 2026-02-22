#!/bin/bash
# Voice Notes - One-liner installer
# Usage: curl -fsSL https://raw.githubusercontent.com/exhuman777/voice-notes/main/install.sh | bash

set -e

echo ""
echo "  Voice Notes Installer"
echo "  ====================="
echo ""

# Check dependencies
check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo "  x Missing: $1"
        return 1
    fi
    echo "  + $1 found"
}

echo "  Checking dependencies..."
echo ""
check_cmd node || { echo ""; echo "  Install Node.js: https://nodejs.org"; exit 1; }
check_cmd npm || { echo ""; echo "  Install npm (comes with Node.js)"; exit 1; }
check_cmd ffmpeg || { echo ""; echo "  Install FFmpeg: brew install ffmpeg"; exit 1; }
check_cmd whisper-cli || { echo ""; echo "  Install whisper.cpp: brew install whisper-cpp"; exit 1; }

# Clone or update repo
INSTALL_DIR="$HOME/voice-notes"
if [ -d "$INSTALL_DIR/.git" ]; then
    echo ""
    echo "  Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull
else
    if [ -d "$INSTALL_DIR" ]; then
        echo ""
        echo "  Directory exists but not a git repo. Backing up..."
        mv "$INSTALL_DIR" "$INSTALL_DIR.backup.$(date +%s)"
    fi
    echo ""
    echo "  Cloning repository..."
    git clone https://github.com/exhuman777/voice-notes.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Install npm dependencies
echo ""
echo "  Installing dependencies..."
npm install --silent

# Find or download whisper model
MODEL_DIR="$HOME/.whisper-models"
MODEL_FILE=""

# Check common locations for existing model
for loc in \
    "$MODEL_DIR/ggml-base.bin" \
    "$MODEL_DIR/ggml-small.bin" \
    /opt/homebrew/share/whisper-cpp/models/ggml-base.bin \
    /opt/homebrew/share/whisper-cpp/models/ggml-small.bin
do
    if [ -f "$loc" ]; then
        MODEL_FILE="$loc"
        echo "  + Found model: $MODEL_FILE"
        break
    fi
done

# Download if not found
if [ -z "$MODEL_FILE" ]; then
    echo ""
    echo "  Downloading Whisper base model (~142MB)..."
    mkdir -p "$MODEL_DIR"
    MODEL_FILE="$MODEL_DIR/ggml-base.bin"
    curl -L --retry 3 --progress-bar -o "$MODEL_FILE" \
        https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
fi

# Create .env.local
echo ""
echo "  Creating configuration..."
cat > .env.local << EOF
WHISPER_PATH=$(which whisper-cli)
WHISPER_MODEL=$MODEL_FILE
FFMPEG_PATH=$(which ffmpeg)
EOF

echo ""
echo "  ============================="
echo "  Installation complete!"
echo "  ============================="
echo ""
echo "  Start Voice Notes:"
echo "    cd ~/voice-notes && npm run dev"
echo ""
echo "  Then open: http://localhost:6767"
echo ""
