import os
import subprocess

svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#000000"/>
  <!-- Minimalist White Globe -->
  <g fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">
    <!-- Outer boundary circle -->
    <circle cx="256" cy="256" r="148" stroke-width="12"/>
    <!-- Equator horizontal line -->
    <line x1="108" y1="256" x2="404" y2="256" stroke-width="12"/>
    <!-- Prime meridian vertical line -->
    <line x1="256" y1="108" x2="256" y2="404" stroke-width="12"/>
    <!-- Longitudinal inner ellipse -->
    <ellipse cx="256" cy="256" rx="74" ry="148" stroke-width="12"/>
    <!-- Latitudinal arcs -->
    <path d="M 143 180 C 176 198, 336 198, 369 180" stroke-width="12"/>
    <path d="M 143 332 C 176 314, 336 314, 369 332" stroke-width="12"/>
  </g>
</svg>
'''

with open('/root/arl/icons/icon.svg', 'w') as f:
    f.write(svg_content)

with open('/root/arl/icons/favicon.svg', 'w') as f:
    f.write(svg_content)

# Render PNGs using rsvg-convert
subprocess.run(['rsvg-convert', '-w', '192', '-h', '192', '/root/arl/icons/icon.svg', '-o', '/root/arl/icons/icon-192.png'], check=True)
subprocess.run(['rsvg-convert', '-w', '512', '-h', '512', '/root/arl/icons/icon.svg', '-o', '/root/arl/icons/icon-512.png'], check=True)
subprocess.run(['rsvg-convert', '-w', '180', '-h', '180', '/root/arl/icons/icon.svg', '-o', '/root/arl/icons/apple-touch-icon.png'], check=True)

print("Icons successfully created and rendered!")
