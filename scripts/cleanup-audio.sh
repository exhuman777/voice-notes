#!/bin/bash
# Delete audio files older than 24 hours
# Transcriptions are stored in tasks.json, audio files can be removed

UPLOADS_DIR="$(dirname "$0")/../uploads"

# Find and delete wav/webm files older than 24 hours
find "$UPLOADS_DIR" -type f \( -name "*.wav" -o -name "*.webm" \) -mtime +1 -delete 2>/dev/null

echo "$(date): Cleanup completed"
