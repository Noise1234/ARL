#!/usr/bin/env python3
"""
Packages and signs ARL APK with complete v1 JAR signature.
Updates all web assets inside assets/www/ with the latest files.
"""

import os
import zipfile
import hashlib
import base64
import subprocess
import shutil

ROOT = '/root/ARL'
OLD_APK = os.path.join(ROOT, 'dist/ARL-v2.0.apk')
OUT_APK = os.path.join(ROOT, 'dist/ARL-v2.0.apk')
BUILD_DIR = '/tmp/apk_build'
KEY_DIR = '/tmp/apk_keys'

os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(KEY_DIR, exist_ok=True)

# 1. Generate RSA key & certificate if not present
key_pem = os.path.join(KEY_DIR, 'key.pem')
cert_pem = os.path.join(KEY_DIR, 'cert.pem')

if not os.path.exists(key_pem) or not os.path.exists(cert_pem):
    cmd = [
        'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
        '-keyout', key_pem, '-out', cert_pem, '-days', '10000',
        '-subj', '/CN=Android Debug/O=Android/C=US'
    ]
    subprocess.run(cmd, check=True)

# 2. Extract native binary components from OLD_APK
# (AndroidManifest.xml, classes.dex, resources.arsc, res/*)
native_files = {}
with zipfile.ZipFile(OLD_APK, 'r') as zf:
    for name in zf.namelist():
        if name.startswith('assets/www/') or name.startswith('META-INF/'):
            continue
        native_files[name] = zf.read(name)

print(f"Extracted {len(native_files)} native container files from existing APK.")

# 3. Collect updated web assets from ROOT
web_assets = {}

def add_file(rel_path):
    full_path = os.path.join(ROOT, rel_path)
    if os.path.isfile(full_path):
        apk_path = f"assets/www/{rel_path}"
        with open(full_path, 'rb') as f:
            web_assets[apk_path] = f.read()

def add_dir(dir_name):
    full_dir = os.path.join(ROOT, dir_name)
    for root, dirs, files in os.walk(full_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT)
            apk_path = f"assets/www/{rel_path}"
            with open(full_path, 'rb') as f:
                web_assets[apk_path] = f.read()

add_file('index.html')
add_file('manifest.json')
add_file('sw.js')
add_dir('css')
add_dir('js')
add_dir('data')
add_dir('icons')

print(f"Collected {len(web_assets)} web assets from {ROOT}.")

# Combine all files into master dictionary
all_files = {}
all_files.update(native_files)
all_files.update(web_assets)

# Sort file list for deterministic zip structure
sorted_names = sorted(all_files.keys())

# 4. Generate MANIFEST.MF
manifest_lines = [
    "Manifest-Version: 1.0",
    "Created-By: 1.0 (Android)"
]

manifest_entries = {}
manifest_bytes_map = {}

for name in sorted_names:
    data = all_files[name]
    digest = base64.b64encode(hashlib.sha256(data).digest()).decode('ascii')
    entry_lines = [
        f"Name: {name}",
        f"SHA-256-Digest: {digest}"
    ]
    entry_str = "\r\n".join(entry_lines) + "\r\n\r\n"
    manifest_entries[name] = entry_str
    manifest_bytes_map[name] = entry_str.encode('utf-8')

manifest_content = "\r\n".join(manifest_lines) + "\r\n\r\n" + "".join(manifest_entries[name] for name in sorted_names)
manifest_bytes = manifest_content.encode('utf-8')

# 5. Generate CERT.SF
manifest_digest = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode('ascii')
sf_lines = [
    "Signature-Version: 1.0",
    "Created-By: 1.0 (Android)",
    f"SHA-256-Digest-Manifest: {manifest_digest}"
]

sf_entries = []
for name in sorted_names:
    entry_digest = base64.b64encode(hashlib.sha256(manifest_bytes_map[name]).digest()).decode('ascii')
    sf_entries.append(f"Name: {name}\r\nSHA-256-Digest: {entry_digest}\r\n\r\n")

sf_content = "\r\n".join(sf_lines) + "\r\n\r\n" + "".join(sf_entries)
sf_bytes = sf_content.encode('utf-8')

sf_path = os.path.join(BUILD_DIR, 'CERT.SF')
with open(sf_path, 'wb') as f:
    f.write(sf_bytes)

# 6. Generate CERT.RSA via OpenSSL CMS
rsa_path = os.path.join(BUILD_DIR, 'CERT.RSA')
cmd = [
    'openssl', 'cms', '-sign',
    '-in', sf_path,
    '-out', rsa_path,
    '-outform', 'DER',
    '-signer', cert_pem,
    '-inkey', key_pem,
    '-noattr',
    '-binary'
]
subprocess.run(cmd, check=True)

with open(rsa_path, 'rb') as f:
    rsa_bytes = f.read()

# 7. Package complete APK
tmp_apk = os.path.join(BUILD_DIR, 'ARL-output.apk')
with zipfile.ZipFile(tmp_apk, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
    # First write META-INF entries
    zout.writestr('META-INF/MANIFEST.MF', manifest_bytes)
    zout.writestr('META-INF/CERT.SF', sf_bytes)
    zout.writestr('META-INF/CERT.RSA', rsa_bytes)
    
    # Next write all application files
    for name in sorted_names:
        # Keep uncompressed for resources.arsc and uncompressed assets if needed
        compress_type = zipfile.ZIP_STORED if name.endswith('.arsc') or name.endswith('.png') else zipfile.ZIP_DEFLATED
        zout.writestr(name, all_files[name], compress_type=compress_type)

apk_size = os.path.getsize(tmp_apk)
print(f"Successfully packaged signed APK: {tmp_apk} ({apk_size / (1024*1024):.2f} MB)")

# Copy to target destinations
shutil.copyfile(tmp_apk, OUT_APK)
print(f"Updated {OUT_APK}")

# Also copy to /sdcard/Download
sdcard_dir = '/sdcard/Download'
if os.path.exists(sdcard_dir):
    sdcard_dest = os.path.join(sdcard_dir, 'ARL-v2.0.apk')
    shutil.copyfile(tmp_apk, sdcard_dest)
    print(f"Updated {sdcard_dest}")
    # Also write a dated/latest version
    shutil.copyfile(tmp_apk, os.path.join(sdcard_dir, 'ARL-v2.0-latest.apk'))
    print(f"Updated {os.path.join(sdcard_dir, 'ARL-v2.0-latest.apk')}")
