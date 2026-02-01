"""
Background Generator for Retro Game Engine
Generates mode-specific background images from a source image.

Usage:
    python generate_backgrounds.py <source_image> <output_folder> [level_name]

Example:
    python generate_backgrounds.py ../../sprites.old/background_desert.png ../games/pang/assets/backgrounds level1
"""

import sys
import os
from PIL import Image
import numpy as np

# Mode specifications
MODES = {
    '1bit': {
        'width': 256,
        'height': 192,
        'colours': 2,
        'dither': 'bayer',  # Ordered Bayer dithering
    },
    '8bit-basic': {
        'width': 256,
        'height': 192,
        'colours': 2,  # Spectrum style: single INK colour on black PAPER
        'dither': 'spectrum',  # Special Spectrum-style cyan-on-black dithering
        'ink_colour': (0, 215, 215),  # Cyan #00D7D7
    },
    '8bit-cpc': {
        'width': 160,
        'height': 200,
        'colours': 16,
        'dither': None,
    },
    '8bit-plus': {
        'width': 320,
        'height': 200,
        'colours': None,  # Full colour
        'dither': None,
    },
    '16bit': {
        'width': 320,
        'height': 224,
        'colours': None,  # Full colour
        'dither': None,
    },
}

# 8x8 Bayer dithering matrix (normalized to 0-1)
BAYER_MATRIX_8x8 = np.array([
    [ 0, 32,  8, 40,  2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44,  4, 36, 14, 46,  6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [ 3, 35, 11, 43,  1, 33,  9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47,  7, 39, 13, 45,  5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
]) / 64.0


def apply_bayer_dither(img, threshold=0.5):
    """
    Apply ordered Bayer dithering to convert image to 1-bit.
    
    Args:
        img: PIL Image (will be converted to grayscale)
        threshold: Base threshold (0-1), adjusted by Bayer matrix
    
    Returns:
        PIL Image in mode '1' (1-bit)
    """
    # Convert to grayscale and normalize to 0-1
    gray = img.convert('L')
    pixels = np.array(gray, dtype=np.float32) / 255.0
    
    height, width = pixels.shape
    
    # Create output array
    output = np.zeros((height, width), dtype=np.uint8)
    
    # Apply Bayer dithering
    for y in range(height):
        for x in range(width):
            # Get Bayer threshold for this pixel
            bayer_value = BAYER_MATRIX_8x8[y % 8, x % 8]
            # Adjust threshold based on Bayer matrix
            adjusted_threshold = threshold - 0.5 + bayer_value
            # Compare pixel to adjusted threshold
            if pixels[y, x] > adjusted_threshold:
                output[y, x] = 255  # White
            else:
                output[y, x] = 0    # Black
    
    return Image.fromarray(output, mode='L').convert('1')


def apply_spectrum_dither(img, ink_colour=(0, 215, 215), threshold=0.5):
    """
    Apply Spectrum-style ordered dithering.
    Creates a 2-colour image: black PAPER with coloured INK dithering.
    Similar to original Spectrum Pang Mt. Fuji background.
    
    Args:
        img: PIL Image (will be converted to grayscale)
        ink_colour: RGB tuple for INK colour (default: Cyan #00D7D7)
        threshold: Base threshold (0-1), adjusted by Bayer matrix
    
    Returns:
        PIL Image in RGB mode (black + ink colour)
    """
    # Convert to grayscale and normalize to 0-1
    gray = img.convert('L')
    pixels = np.array(gray, dtype=np.float32) / 255.0
    
    height, width = pixels.shape
    
    # Create RGB output array (black background)
    output = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Apply Bayer dithering with ink colour
    for y in range(height):
        for x in range(width):
            # Get Bayer threshold for this pixel
            bayer_value = BAYER_MATRIX_8x8[y % 8, x % 8]
            # Adjust threshold based on Bayer matrix
            adjusted_threshold = threshold - 0.5 + bayer_value
            # Compare pixel to adjusted threshold
            if pixels[y, x] > adjusted_threshold:
                output[y, x] = ink_colour  # INK colour (cyan)
            # else: stays black (PAPER)
    
    return Image.fromarray(output, mode='RGB')


def reduce_colours(img, num_colours):
    """
    Reduce image to specified number of colours using quantization.
    
    Args:
        img: PIL Image
        num_colours: Target number of colours
    
    Returns:
        PIL Image with reduced palette
    """
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Use PIL's built-in quantization
    return img.quantize(colors=num_colours, method=Image.Quantize.MEDIANCUT).convert('RGB')


def resize_image(img, width, height):
    """
    Resize image to target dimensions using nearest neighbor for pixel art look.
    
    Args:
        img: PIL Image
        width: Target width
        height: Target height
    
    Returns:
        Resized PIL Image
    """
    return img.resize((width, height), Image.Resampling.NEAREST)


def process_for_mode(source_img, mode_name, mode_config):
    """
    Process source image for a specific display mode.
    
    Args:
        source_img: PIL Image (source)
        mode_name: Name of the mode (e.g., '1bit', '16bit')
        mode_config: Configuration dict for the mode
    
    Returns:
        Processed PIL Image
    """
    width = mode_config['width']
    height = mode_config['height']
    colours = mode_config['colours']
    dither = mode_config.get('dither')
    
    # Step 1: Resize to target resolution
    img = resize_image(source_img, width, height)
    
    # Step 2: Apply colour reduction or dithering
    if dither == 'bayer':
        # 1-bit mode with Bayer dithering (black and white)
        img = apply_bayer_dither(img)
    elif dither == 'spectrum':
        # Spectrum-style: single INK colour dithered on black PAPER
        ink_colour = mode_config.get('ink_colour', (0, 215, 215))
        img = apply_spectrum_dither(img, ink_colour=ink_colour)
    elif colours is not None and colours > 2:
        # Reduce to specified number of colours
        img = reduce_colours(img, colours)
    # else: keep full colour
    
    return img


def generate_all_backgrounds(source_path, output_folder, level_name='level1'):
    """
    Generate background images for all modes from a source image.
    
    Args:
        source_path: Path to source image
        output_folder: Base output folder
        level_name: Name of the level (creates subfolder)
    """
    # Load source image
    print(f"Loading source image: {source_path}")
    source_img = Image.open(source_path)
    
    # Convert to RGB if necessary
    if source_img.mode != 'RGB':
        source_img = source_img.convert('RGB')
    
    print(f"Source image size: {source_img.width}x{source_img.height}")
    
    # Create output directory
    level_folder = os.path.join(output_folder, level_name)
    os.makedirs(level_folder, exist_ok=True)
    
    # Process for each mode
    for mode_name, mode_config in MODES.items():
        print(f"\nProcessing for {mode_name}...")
        print(f"  Target: {mode_config['width']}x{mode_config['height']}")
        
        # Process image
        processed = process_for_mode(source_img, mode_name, mode_config)
        
        # Save
        output_path = os.path.join(level_folder, f"{mode_name}.png")
        
        # Convert 1-bit to RGB for better compatibility
        if processed.mode == '1':
            processed = processed.convert('RGB')
        
        processed.save(output_path, optimize=True)
        
        # Report file size
        file_size = os.path.getsize(output_path)
        print(f"  Saved: {output_path} ({file_size / 1024:.1f} KB)")
    
    print(f"\nAll backgrounds generated in: {level_folder}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        print("\nRunning with default paths for desert background...")
        
        # Default paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        source_path = os.path.join(script_dir, '..', '..', 'sprites.old', 'background_desert.png')
        output_folder = os.path.join(script_dir, '..', 'games', 'pang', 'assets', 'backgrounds')
        level_name = 'level1'
    else:
        source_path = sys.argv[1]
        output_folder = sys.argv[2]
        level_name = sys.argv[3] if len(sys.argv) > 3 else 'level1'
    
    # Normalize paths
    source_path = os.path.normpath(source_path)
    output_folder = os.path.normpath(output_folder)
    
    # Check source exists
    if not os.path.exists(source_path):
        print(f"Error: Source image not found: {source_path}")
        sys.exit(1)
    
    generate_all_backgrounds(source_path, output_folder, level_name)


if __name__ == '__main__':
    main()
