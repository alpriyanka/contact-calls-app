#!/bin/bash
cd "$(dirname "$0")"
echo "Serving at http://localhost:8080"
echo "On your phone (same Wi-Fi): http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}'):8080"
python3 -m http.server 8080
