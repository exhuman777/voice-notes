#!/bin/bash
# Voice Notes - One-liner installer
# Usage: curl -fsSL https://raw.githubusercontent.com/exhuman777/voice-notes/main/install.sh | bash

set -e

echo "🎙 Voice Notes Installer"
echo "========================"

# Check dependencies
check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo "❌ Missing: $1"
        return 1
    fi
    echo "✓ $1"
}

echo ""
echo "Checking dependencies..."
check_cmd node || { echo "Install Node.js: https://nodejs.org"; exit 1; }
check_cmd npm || { echo "Install npm with Node.js"; exit 1; }
check_cmd ffmpeg || { echo "Install: brew install ffmpeg"; exit 1; }
check_cmd whisper-cli || { echo "Install: brew install whisper-cpp"; exit 1; }

# Clone repo
INSTALL_DIR="$HOME/voice-notes"
if [ -d "$INSTALL_DIR" ]; then
    echo ""
    echo "Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull
else
    echo ""
    echo "Cloning repository..."
    git clone https://github.com/exhuman777/voice-notes.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Install npm dependencies
echo ""
echo "Installing dependencies..."
npm install

# Find or download whisper model
MODEL_DIR="$HOME/.whisper-models"
MODEL_FILE=""

# Check common locations for existing model
for loc in \
    "$MODEL_DIR/ggml-small.bin" \
    "$MODEL_DIR/ggml-base.bin" \
    "$HOME/.claude1/local-stt-mcp"*/models/ggml-small.bin \
    "$HOME/.claude1/local-stt-mcp"*/models/ggml-base.bin \
    /opt/homebrew/share/whisper-cpp/models/ggml-small.bin \
    /opt/homebrew/share/whisper-cpp/models/ggml-base.bin
do
    if [ -f "$loc" ]; then
        MODEL_FILE="$loc"
        echo "✓ Found model: $MODEL_FILE"
        break
    fi
done

# Download if not found
if [ -z "$MODEL_FILE" ]; then
    echo ""
    echo "Downloading Whisper model (small, 466MB)..."
    mkdir -p "$MODEL_DIR"
    MODEL_FILE="$MODEL_DIR/ggml-small.bin"
    curl -L --retry 3 -o "$MODEL_FILE" \
        https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin
fi

# Create .env.local
echo ""
echo "Creating configuration..."
cat > .env.local << EOF
WHISPER_PATH=$(which whisper-cli)
WHISPER_MODEL=$MODEL_FILE
FFMPEG_PATH=$(which ffmpeg)
EOF

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start Voice Notes:"
echo "  cd $INSTALL_DIR && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
