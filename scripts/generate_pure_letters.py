import os
import cv2
import numpy as np
from PIL import Image

def generate_pure_letters():
    base_dir = r"c:\Users\Eli\Desktop\cmfix web"
    raw_path = os.path.join(base_dir, "public", "CMfix.png")
    
    raw = Image.open(raw_path).convert("RGBA")
    w, h = raw.size
    print(f"Original CMfix.png size: {w}x{h}")
    
    # 1. Crop full letters region (including wrench)
    crop = raw.crop((int(w * 0.20), int(h * 0.23), int(w * 0.81), int(h * 0.54)))
    arr_bgr = cv2.cvtColor(np.array(crop), cv2.COLOR_RGBA2BGR)
    gray = cv2.cvtColor(arr_bgr, cv2.COLOR_BGR2GRAY)
    
    # 2. Extract letter core components at threshold 70
    _, thresh = cv2.threshold(gray, 70, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(thresh)
    
    letter_labels = [23, 25, 26, 27, 28, 29, 30]
    letters_mask = np.zeros_like(gray, dtype=np.uint8)
    for l in letter_labels:
        letters_mask[labels == l] = 255
        
    # Dilate mask smoothly to preserve the electric green neon glow around letters
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
    dilated_mask = cv2.dilate(letters_mask, kernel)
    
    # Strict boundary guards to eliminate any frame lines
    dilated_mask[:28, :] = 0
    dilated_mask[:58, :200] = 0
    dilated_mask[265:, :] = 0
    dilated_mask[:, 1000:] = 0
    
    # Gaussian blur for soft glow transition
    mask_float = dilated_mask.astype(float) / 255.0
    mask_float = cv2.GaussianBlur(mask_float, (15, 15), 0)
    
    # Compute luminance and color channels
    arr = np.array(crop)
    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    
    # Smooth alpha calculation
    alpha = np.clip((lum - 20) / (65 - 20) * 255.0, 0.0, 255.0)
    
    # Neon green glow boost
    is_green = (g > 55) & (g > r * 1.1)
    alpha[is_green] = np.maximum(alpha[is_green], np.clip(g[is_green] * 1.5, 0.0, 255.0))
    
    # Solid metallic chrome fill for letters
    is_solid = (lum > 70)
    alpha[is_solid] = 255.0
    
    # Multiply by mask
    alpha = alpha * mask_float
    arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    arr[arr[:, :, 3] == 0, :3] = 0
    
    pure_letters = Image.fromarray(arr)
    bbox = pure_letters.getbbox()
    if bbox:
        # Add 6px clean transparent padding
        pure_letters = pure_letters.crop((
            max(0, bbox[0] - 6),
            max(0, bbox[1] - 6),
            min(pure_letters.width, bbox[2] + 6),
            min(pure_letters.height, bbox[3] + 6)
        ))
        
    print(f"Generated pure letters: {pure_letters.size}")
    
    # 3. Save to public and src/assets for both cmfix-logo and cmfix-badge
    targets = [
        os.path.join(base_dir, "public", "cmfix-logo.png"),
        os.path.join(base_dir, "src", "assets", "cmfix-logo.png"),
        os.path.join(base_dir, "public", "cmfix-badge.png"),
        os.path.join(base_dir, "src", "assets", "cmfix-badge.png")
    ]
    for t in targets:
        pure_letters.save(t, "PNG", optimize=True)
        print(f"Saved: {t}")
        
    # 4. Generate transparent square icons for PWA & favicon
    sq_size = max(pure_letters.width, pure_letters.height) + 60
    sq_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
    pos = ((sq_size - pure_letters.width) // 2, (sq_size - pure_letters.height) // 2)
    sq_canvas.paste(pure_letters, pos, mask=pure_letters)
    
    fav_targets = [
        (os.path.join(base_dir, "public", "favicon.png"), 64),
        (os.path.join(base_dir, "src", "assets", "favicon.png"), 64),
        (os.path.join(base_dir, "public", "icon-192.png"), 192),
        (os.path.join(base_dir, "src", "assets", "icon-192.png"), 192),
        (os.path.join(base_dir, "public", "icon-512.png"), 512),
        (os.path.join(base_dir, "src", "assets", "icon-512.png"), 512)
    ]
    for path, sz in fav_targets:
        sq_canvas.resize((sz, sz), Image.Resampling.LANCZOS).save(path, "PNG", optimize=True)
        print(f"Saved icon {sz}x{sz}: {path}")

    # Remove temporary test files
    for tmp in ["public/test_letters_crop.png", "public/test_letters_full.png", "public/test_isolated_letters.png", "public/test_isolated_letters_v2.png", "public/test_perfect_letters.png"]:
        p = os.path.join(base_dir, tmp)
        if os.path.exists(p):
            os.remove(p)

    print("SUCCESS: Both logos updated to ONLY THE LETTERS without background or frames!")

if __name__ == "__main__":
    generate_pure_letters()
