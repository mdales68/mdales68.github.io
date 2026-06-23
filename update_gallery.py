#!/usr/bin/env python3
import os
import json
import re

# Configurations
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
DATA_JS_PATH = os.path.join(BASE_DIR, 'data.js')
INDEX_HTML_PATH = os.path.join(BASE_DIR, 'index.html')
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')

def clean_name(name):
    """Convert name to human-readable title (e.g., 'geometrie-urbane' -> 'Geometrie Urbane')"""
    return name.replace('-', ' ').replace('_', ' ').strip().title()

def sync_album(album_dir, album_id):
    metadata_path = os.path.join(album_dir, 'metadata.json')
    
    # 1. Load or initialize metadata
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
        except Exception as e:
            print(f"Errore nella lettura di {metadata_path}: {e}. Verrà reinizializzato.")
            metadata = None
    else:
        metadata = None

    if not metadata:
        metadata = {
            "title": clean_name(album_id),
            "description": f"Questo album racchiude una collezione di scatti dedicati a {clean_name(album_id)}.",
            "cover": "",
            "meta": album_id.upper().replace('-', ' '),
            "photos": {}
        }

    # Ensure photos key exists
    if "photos" not in metadata:
        metadata["photos"] = {}

    # 2. Scan physical images in the folder
    physical_images = [
        f for f in os.listdir(album_dir)
        if f.lower().endswith(IMAGE_EXTENSIONS)
    ]
    physical_images.sort()

    # 3. Synchronize photos dict in metadata
    updated_photos = {}
    for img in physical_images:
        if img in metadata["photos"]:
            # Keep existing metadata
            updated_photos[img] = metadata["photos"][img]
        else:
            # Create new metadata entry
            title = os.path.splitext(img)[0]
            title = clean_name(title)
            updated_photos[img] = {
                "title": title,
                "caption": "Aggiungi una didascalia per questa foto.",
                "meta": "Dati di scatto (es. 50mm • f/2.8)",
                "aspectRatio": "landscape"
            }
    
    metadata["photos"] = updated_photos

    # 4. Set cover photo if empty or invalid
    if not metadata.get("cover") or metadata["cover"] not in physical_images:
        if physical_images:
            metadata["cover"] = physical_images[0]
        else:
            metadata["cover"] = ""

    # 5. Save updated metadata.json
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    return metadata

def update_index_html():
    """Ensure data.js is loaded in index.html before app.js"""
    if not os.path.exists(INDEX_HTML_PATH):
        print(f"index.html non trovato a {INDEX_HTML_PATH}")
        return

    with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if data.js is already imported
    if 'src="data.js"' in content:
        return

    # Look for app.js and inject data.js before it
    app_script_tag = '<script src="app.js"></script>'
    if app_script_tag in content:
        new_tag = '<script src="data.js"></script>\n    <script src="app.js"></script>'
        content = content.replace(app_script_tag, new_tag)
        with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        print("index.html aggiornato con successo: aggiunto tag script per data.js")
    else:
        print("Attenzione: <script src=\"app.js\"></script> non trovato in index.html. Impossibile auto-iniettare data.js.")

def main():
    if not os.path.exists(ASSETS_DIR):
        print(f"Cartella assets non trovata a: {ASSETS_DIR}")
        return

    albums = []
    
    # Scan subdirectories under assets/
    subdirs = [
        d for d in os.listdir(ASSETS_DIR)
        if os.path.isdir(os.path.join(ASSETS_DIR, d)) and not d.startswith('.')
    ]
    subdirs.sort()

    for subdir in subdirs:
        album_dir = os.path.join(ASSETS_DIR, subdir)
        album_id = subdir
        
        print(f"Sincronizzazione album: {album_id}...")
        metadata = sync_album(album_dir, album_id)
        
        # Build photos list for app.js
        photos_list = []
        for filename, photo_data in metadata["photos"].items():
            photos_list.append({
                "url": f"assets/{album_id}/{filename}",
                "title": photo_data.get("title", clean_name(os.path.splitext(filename)[0])),
                "caption": photo_data.get("caption", ""),
                "meta": photo_data.get("meta", ""),
                "aspectRatio": photo_data.get("aspectRatio", "landscape")
            })

        # Calculate cover path
        cover_filename = metadata.get("cover", "")
        cover_url = f"assets/{album_id}/{cover_filename}" if cover_filename else ""

        # Build album object
        album_obj = {
            "id": album_id,
            "title": metadata.get("title", clean_name(album_id)),
            "description": metadata.get("description", ""),
            "cover": cover_url,
            "meta": f"{len(photos_list)} FOTO • {metadata.get('meta', album_id.upper())}",
            "photos": photos_list
        }
        
        albums.append(album_obj)

    # Write data.js
    js_content = f"// Auto-generated photo database. DO NOT EDIT MANUALLY.\nconst ALBUMS_DATA = {json.dumps(albums, indent=4, ensure_ascii=False)};\n"
    with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"data.js generato con successo con {len(albums)} album.")
    
    # Update index.html
    update_index_html()
    
    print("Sincronizzazione completata!")

if __name__ == '__main__':
    main()
