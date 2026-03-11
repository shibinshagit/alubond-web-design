#!/bin/bash
# Copy only assets actually used by the site into assets/ for deployment.
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

mkdir -p assets/brand assets/hero assets/app-cards assets/frames assets/videos
mkdir -p "assets/gallery/hi res images" "assets/gallery/Belgium" "assets/gallery/Croatia" "assets/gallery/Turkey" "assets/gallery/Netherlands" "assets/gallery/UAE" "assets/gallery/Qatar" "assets/gallery/Serbia" "assets/gallery/Italy"

# Brand
cp "brand assets/Alubond_Logo.png" assets/brand/

# Hero slider
for f in "hero slider"/*; do
  [ -f "$f" ] && cp "$f" assets/hero/
done

# Application cards (only those referenced in index.html)
cp "alubond application card/facade.jpeg" "alubond application card/trailer.jpeg" "alubond application card/coporate identity.png" "alubond application card/machine covers.jpg" "alubond application card/elevators .avif" "alubond application card/marine .jpg" "alubond application card/bullet train.png" assets/app-cards/ 2>/dev/null || true

# Frames (1–241 for canvas animation)
for i in $(seq 1 241); do
  n=$(printf "%04d" $i)
  [ -f "frames2/frame_${n}.webp" ] && cp "frames2/frame_${n}.webp" assets/frames/
done

# Gallery images from HIRES PICTURE (same relative path under assets/gallery)
HP="HIRES PICTURE"
cp "$HP/JW-MARRIOTT-303.jpg" "assets/gallery/" 2>/dev/null || true
cp "$HP/hotel W barcelona 21.jpg" "assets/gallery/" 2>/dev/null || true
cp "$HP/Kineum Building_Gothenburg Sweden.jpg" "assets/gallery/" 2>/dev/null || true
cp "$HP/Deltacity.JPG" "assets/gallery/" 2>/dev/null || true
cp "$HP/Vietnam.jpg" "assets/gallery/" 2>/dev/null || true
cp "$HP/Hungary.jpeg" "assets/gallery/" 2>/dev/null || true
cp "$HP/Belvedere BC, Canada.jpeg" "assets/gallery/" 2>/dev/null || true
cp "$HP/MD_entertainment_head_quarter_Commercial_Building_Jakarta_Indonesia.jpg" "assets/gallery/" 2>/dev/null || true

cp "$HP/hi res images/Tiara Tower_6.jpg" "$HP/hi res images/Poliklinika 027_28_29_30_tonemapped.jpg" "$HP/hi res images/Ferrari_World_Abu_Dhabi.jpg" "$HP/hi res images/elite-10-dubai-sports-city-02.jpg" "$HP/hi res images/AloftCityCentre-Deira_5.jpg" "assets/gallery/hi res images/" 2>/dev/null || true

cp "$HP/Belgium/NAC_Municipal _building_Houthalen-Helchteren_Belgiu.jpg" "assets/gallery/Belgium/" 2>/dev/null || true
cp "$HP/Croatia/KING  CROSS_Commercial_Building_Zagreb_Croatia.jpg" "$HP/Croatia/HotelWell_Terme_Tuhelj_Croatia.jpg" "assets/gallery/Croatia/" 2>/dev/null || true
cp "$HP/Turkey/ITU  TEKNOKENT_Educational_Building_Istanbul_Turkey2.jpg" "$HP/Turkey/BAUHAUS_Commercial_Building_Istanbul_Turkey.jpg" "assets/gallery/Turkey/" 2>/dev/null || true
cp "$HP/Netherlands/Eindhoven Airport 01.JPG" "assets/gallery/Netherlands/" 2>/dev/null || true
cp "$HP/Netherlands/Ijburg_College_ Netherland (2).jpg" "assets/gallery/Netherlands/" 2>/dev/null || true
cp "$HP/UAE/Button_Yas_Marina.jpg" "$HP/UAE/Hotel Holiday Inn, Abu Dhabi.jpg" "assets/gallery/UAE/" 2>/dev/null || true
cp "$HP/Qatar/qipco tower qatar 01 s.jpg" "assets/gallery/Qatar/" 2>/dev/null || true
cp "$HP/Serbia/Zira _Hotel_Belgrade_Serbia.JPG" "$HP/Serbia/IN Hotel_Belgrade, Serbia.JPG" "$HP/Serbia/RED_stripe2.jpg" "assets/gallery/Serbia/" 2>/dev/null || true
# Porsche filename may have special char
cp "$HP/Serbia/25 Porsche Building, Belgrade Architect Goran Vojvodić 300dpi.jpg" "assets/gallery/Serbia/" 2>/dev/null || cp "$HP/Serbia/25 Porsche Building, Belgrade Architect Goran Vojvodic 300dpi.jpg" "assets/gallery/Serbia/" 2>/dev/null || true
cp "$HP/Italy/BEA center Olomouc and Politecnico Italy CS4.jpg" "$HP/Italy/Franchi Marmi_Office_Building_Carrara, Italy.JPG" "$HP/Italy/MiNEC _Office_Building_Vimodrone_Italy (1).jpg" "$HP/Italy/sipam autotorino_01 s.jpg" "assets/gallery/Italy/" 2>/dev/null || true

# Videos (optional for deploy; .gitignore has *.mp4 - we can add to assets and allow)
[ -f "alubond fr.mp4" ] && cp "alubond fr.mp4" assets/videos/
[ -f "alubondcolor chart wood.mp4" ] && cp "alubondcolor chart wood.mp4" assets/videos/

echo "Assets copied to assets/"
