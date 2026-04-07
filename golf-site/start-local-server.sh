#!/bin/bash
# ============================================================
# Local Development Server — Middletown Area Golf Association
# ============================================================
# Run this script from the golf-site folder on your Mac.
# Then open: http://localhost:8080 in your browser.
#
# Usage:
#   cd path/to/golf-site
#   bash start-local-server.sh
# ============================================================

PORT=8080
SITE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🏌️  Middletown Area Golf — Local Preview Server"
echo "================================================"
echo "📂  Serving: $SITE_DIR"
echo "🌐  Open in browser: http://localhost:$PORT"
echo ""
echo "   Press Ctrl+C to stop the server."
echo ""

cd "$SITE_DIR"

# Try Python 3 first (pre-installed on Mac)
if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT
# Fall back to Python 2
elif command -v python &>/dev/null; then
  python -m SimpleHTTPServer $PORT
# Fall back to Node (if installed)
elif command -v npx &>/dev/null; then
  npx serve -l $PORT .
else
  echo "❌  No local server found. Please install Python 3 or Node.js."
  echo "    Or run: brew install python3"
fi
