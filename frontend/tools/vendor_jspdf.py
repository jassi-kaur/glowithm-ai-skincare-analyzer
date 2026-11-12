"""
Download jsPDF once so the PDF button works WITHOUT internet (for example during a
demo or viva) and print the Subresource-Integrity hash of the file.

    python tools/vendor_jspdf.py

The analyzer page loads js/vendor/jspdf.umd.min.js first and only falls back to the CDN
if that file is missing.
"""
import base64
import hashlib
import os
import urllib.request

URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
TARGET = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "js", "vendor", "jspdf.umd.min.js")

os.makedirs(os.path.dirname(TARGET), exist_ok=True)
with urllib.request.urlopen(URL, timeout=30) as response:
    data = response.read()

if b"jsPDF" not in data[:5000000] or len(data) < 100000:
    raise SystemExit("Downloaded file does not look like jsPDF; not saving it.")

with open(TARGET, "wb") as f:
    f.write(data)

digest = base64.b64encode(hashlib.sha384(data).digest()).decode()
print(f"Saved {len(data):,} bytes to {TARGET}")
print(f"SRI (for the CDN <script> tag): sha384-{digest}")
