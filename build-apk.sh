#!/usr/bin/env bash
# ==============================================================================
# ARL v2.0 - Android APK Build & Packaging Script
# Automated Build Toolchain for Native Android Container
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

TOOLS_DIR="/root/android-tools"
ANDROID_DIR="${SCRIPT_DIR}/android"
BIN_DIR="${ANDROID_DIR}/bin"
GEN_DIR="${ANDROID_DIR}/gen"
ASSETS_DIR="${ANDROID_DIR}/assets/www"
DIST_DIR="${SCRIPT_DIR}/dist"
TARGET_SDCARD="/sdcard/Download"
APK_NAME="ARL-v2.0.apk"

echo "=================================================="
echo "   ARL v2.0 - ANDROID APK BUILD & PACKAGING      "
echo "=================================================="

# 1. Verify Prerequisites
echo "[1/6] Verifying toolchain and build dependencies..."

for tool in java javac aapt zipalign apksigner rsvg-convert; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        echo "Error: Required tool '$tool' not found in PATH." >&2
        exit 1
    fi
done

if [[ ! -f "${TOOLS_DIR}/android.jar" ]]; then
    echo "Error: android.jar not found in ${TOOLS_DIR}." >&2
    exit 1
fi

if [[ ! -f "${TOOLS_DIR}/r8.jar" ]]; then
    echo "Error: r8.jar not found in ${TOOLS_DIR}." >&2
    exit 1
fi

if [[ ! -f "${TOOLS_DIR}/debug.keystore" ]]; then
    echo "Notice: debug.keystore not found, generating new debug keystore..."
    keytool -genkeypair -v -keystore "${TOOLS_DIR}/debug.keystore" \
        -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
fi

echo "  ✓ Toolchain verified: javac, aapt, zipalign, apksigner, D8 (R8), android.jar"

# 2. Run Test Suite
echo "[2/6] Validating web assets and running automated tests..."
npm test --silent

# 3. Prepare Web Assets & Icons
echo "[3/6] Syncing production web assets into Android container..."
rm -rf "${ASSETS_DIR}" "${BIN_DIR}" "${GEN_DIR}"
mkdir -p "${ASSETS_DIR}" "${BIN_DIR}/classes" "${GEN_DIR}" "${DIST_DIR}"

# Copy web runtime assets
cp "${SCRIPT_DIR}/index.html" "${ASSETS_DIR}/"
cp "${SCRIPT_DIR}/manifest.json" "${ASSETS_DIR}/"
cp "${SCRIPT_DIR}/sw.js" "${ASSETS_DIR}/"
cp -r "${SCRIPT_DIR}/css" "${ASSETS_DIR}/"
cp -r "${SCRIPT_DIR}/js" "${ASSETS_DIR}/"
cp -r "${SCRIPT_DIR}/data" "${ASSETS_DIR}/"
cp -r "${SCRIPT_DIR}/icons" "${ASSETS_DIR}/"

# Generate Android mipmap icons from vector SVG
echo "  ✓ Generating launcher mipmap icons from icons/icon.svg..."
mkdir -p "${ANDROID_DIR}/res/mipmap-mdpi" \
         "${ANDROID_DIR}/res/mipmap-hdpi" \
         "${ANDROID_DIR}/res/mipmap-xhdpi" \
         "${ANDROID_DIR}/res/mipmap-xxhdpi" \
         "${ANDROID_DIR}/res/mipmap-xxxhdpi"

rsvg-convert -w 48 -h 48 "${SCRIPT_DIR}/icons/icon.svg" -o "${ANDROID_DIR}/res/mipmap-mdpi/ic_launcher.png"
rsvg-convert -w 72 -h 72 "${SCRIPT_DIR}/icons/icon.svg" -o "${ANDROID_DIR}/res/mipmap-hdpi/ic_launcher.png"
rsvg-convert -w 96 -h 96 "${SCRIPT_DIR}/icons/icon.svg" -o "${ANDROID_DIR}/res/mipmap-xhdpi/ic_launcher.png"
rsvg-convert -w 144 -h 144 "${SCRIPT_DIR}/icons/icon.svg" -o "${ANDROID_DIR}/res/mipmap-xxhdpi/ic_launcher.png"
rsvg-convert -w 192 -h 192 "${SCRIPT_DIR}/icons/icon.svg" -o "${ANDROID_DIR}/res/mipmap-xxxhdpi/ic_launcher.png"

# 4. Generate R.java & Compile Java Bytecode
echo "[4/6] Compiling Android native container..."

# Generate R.java
aapt package -f -m \
    -J "${GEN_DIR}" \
    -M "${ANDROID_DIR}/AndroidManifest.xml" \
    -S "${ANDROID_DIR}/res" \
    -I "${TOOLS_DIR}/android.jar"

# Compile Java sources
javac -source 8 -target 8 \
    -cp "${TOOLS_DIR}/android.jar" \
    -d "${BIN_DIR}/classes" \
    "${GEN_DIR}/mn/arl/app/R.java" \
    "${ANDROID_DIR}/src/mn/arl/app/MainActivity.java"

# Convert Java bytecode to Dalvik Executable (classes.dex)
java -cp "${TOOLS_DIR}/r8.jar" com.android.tools.r8.D8 \
    --output "${BIN_DIR}" \
    --lib "${TOOLS_DIR}/android.jar" \
    "${BIN_DIR}/classes/mn/arl/app"/*.class

echo "  ✓ Generated classes.dex"

# 5. Package, Align, and Sign APK
echo "[5/6] Packaging and signing APK..."

# Package resources and assets into unaligned APK (-0 json prevents compression overhead on datasets)
aapt package -f \
    -M "${ANDROID_DIR}/AndroidManifest.xml" \
    -S "${ANDROID_DIR}/res" \
    -A "${ANDROID_DIR}/assets" \
    -I "${TOOLS_DIR}/android.jar" \
    -F "${BIN_DIR}/unaligned.apk" \
    -0 json

# Inject classes.dex
(cd "${BIN_DIR}" && aapt add unaligned.apk classes.dex >/dev/null)

# 4-byte zip alignment
zipalign -f -v 4 "${BIN_DIR}/unaligned.apk" "${BIN_DIR}/aligned.apk" >/dev/null

# Cryptographic signing with debug keystore (v2 + v3 signature schemes)
apksigner sign \
    --ks "${TOOLS_DIR}/debug.keystore" \
    --ks-pass pass:android \
    --key-pass pass:android \
    --out "${BIN_DIR}/${APK_NAME}" \
    "${BIN_DIR}/aligned.apk"

# Verify signature
apksigner verify --verbose "${BIN_DIR}/${APK_NAME}" >/dev/null

echo "  ✓ APK cryptographically signed & verified"

# 6. Copy to Destination & Checksum
echo "[6/6] Copying APK to destination..."

cp "${BIN_DIR}/${APK_NAME}" "${DIST_DIR}/${APK_NAME}"

if [[ -d "${TARGET_SDCARD}" ]]; then
    cp "${BIN_DIR}/${APK_NAME}" "${TARGET_SDCARD}/${APK_NAME}"
    echo "  ✓ Copied to ${TARGET_SDCARD}/${APK_NAME}"
else
    echo "  Notice: ${TARGET_SDCARD} not mounted; APK is stored in ${DIST_DIR}/${APK_NAME}"
fi

FILE_SIZE=$(ls -lh "${DIST_DIR}/${APK_NAME}" | awk '{print $5}')
SHA256=$(sha256sum "${DIST_DIR}/${APK_NAME}" | awk '{print $1}')

echo ""
echo "=================================================="
echo "           APK BUILD SUCCESSFUL!                  "
echo "=================================================="
echo "  File:     ${APK_NAME}"
echo "  Size:     ${FILE_SIZE}"
echo "  Package:  mn.arl.app"
echo "  Version:  2.0.0 (Code 200)"
echo "  SHA-256:  ${SHA256}"
echo "  Location: ${TARGET_SDCARD}/${APK_NAME}"
echo "            ${DIST_DIR}/${APK_NAME}"
echo "=================================================="
