import os
import numpy as np
from PIL import Image

def process_transparent_assets():
    base_path = r"c:\Users\Eli\Desktop\cmfix web"
    raw_path = os.path.join(base_path, "public", "CMfix.png")
    
    raw = Image.open(raw_path).convert("RGBA")
    w, h = raw.size
    print(f"Loaded raw CMfix.png: {w}x{h}")
    
    # 1. PROCESS cmfix-logo.png (tight crop around CMFix + wrench)
    # x: 18.5% to 81.5%, y: 26.5% to 54%
    crop_logo = raw.crop((int(w * 0.185), int(h * 0.265), int(w * 0.815), int(h * 0.54)))
    arr_logo = np.array(crop_logo)
    
    r = arr_logo[:, :, 0].astype(float)
    g = arr_logo[:, :, 1].astype(float)
    b = arr_logo[:, :, 2].astype(float)
    
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    
    # Alpha for logo:
    # Deep black background (lum < 22) -> alpha 0
    # Midtones smoothly ramp up between 22 and 60
    alpha_logo = np.clip((lum - 22) / (60 - 22) * 255.0, 0.0, 255.0)
    
    # Neon green glow boost
    is_green = (g > 55) & (g > r * 1.1)
    alpha_logo[is_green] = np.maximum(alpha_logo[is_green], np.clip(g[is_green] * 1.6, 0.0, 255.0))
    
    # Silver metallic highlights
    is_silver = (lum > 70)
    alpha_logo[is_silver] = 255.0
    
    arr_logo[:, :, 3] = alpha_logo.astype(np.uint8)
    
    img_logo = Image.fromarray(arr_logo)
    # Trim transparent borders cleanly
    bbox_logo = img_logo.getbbox()
    if bbox_logo:
        img_logo = img_logo.crop((
            max(0, bbox_logo[0] - 8),
            max(0, bbox_logo[1] - 8),
            min(img_logo.width, bbox_logo[2] + 8),
            min(img_logo.height, bbox_logo[3] + 8)
        ))
        
    img_logo.save(os.path.join(base_path, "public", "cmfix-logo.png"), "PNG")
    img_logo.save(os.path.join(base_path, "src", "assets", "cmfix-logo.png"), "PNG")
    print(f"Saved transparent cmfix-logo.png: {img_logo.size}")
    
    # 2. PROCESS cmfix-badge.png (Cyber badge with frame + slogan, TRANSPARENT background)
    crop_badge = raw.crop((int(w * 0.12), int(h * 0.20), int(w * 0.88), int(h * 0.62)))
    arr_badge = np.array(crop_badge)
    
    rb = arr_badge[:, :, 0].astype(float)
    gb = arr_badge[:, :, 1].astype(float)
    bb = arr_badge[:, :, 2].astype(float)
    
    lum_b = 0.299 * rb + 0.587 * gb + 0.114 * bb
    
    alpha_badge = np.clip((lum_b - 20) / (55 - 20) * 255.0, 0.0, 255.0)
    is_green_b = (gb > 50) & (gb > rb * 1.1)
    alpha_badge[is_green_b] = np.maximum(alpha_badge[is_green_b], np.clip(gb[is_green_b] * 1.6, 0.0, 255.0))
    is_silver_b = (lum_b > 65)
    alpha_badge[is_silver_b] = 255.0
    
    arr_badge[:, :, 3] = alpha_badge.astype(np.uint8)
    img_badge = Image.fromarray(arr_badge)
    bbox_badge = img_badge.getbbox()
    if bbox_badge:
        img_badge = img_badge.crop((
            max(0, bbox_badge[0] - 10),
            max(0, bbox_badge[1] - 10),
            min(img_badge.width, bbox_badge[2] + 10),
            min(img_badge.height, bbox_badge[3] + 10)
        ))
        
    img_badge.save(os.path.join(base_path, "public", "cmfix-badge.png"), "PNG")
    img_badge.save(os.path.join(base_path, "src", "assets", "cmfix-badge.png"), "PNG")
    print(f"Saved transparent cmfix-badge.png: {img_badge.size}")
    
    # 3. SQUARE ICONS (Transparent square icons)
    # Using the centered logo on transparent canvas
    sq_size = max(img_logo.width, img_logo.height) + 60
    sq_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
    pos = ((sq_size - img_logo.width) // 2, (sq_size - img_logo.height) // 2)
    sq_canvas.paste(img_logo, pos, mask=img_logo)
    
    sq_canvas.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(base_path, "public", "favicon.png"), "PNG")
    sq_canvas.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(base_path, "public", "icon-192.png"), "PNG")
    sq_canvas.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(base_path, "public", "icon-512.png"), "PNG")
    print("Saved transparent favicon.png, icon-192.png, icon-512.png")

if __name__ == "__main__":
    process_transparent_assets()
