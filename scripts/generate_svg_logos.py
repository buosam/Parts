import numpy as np
from PIL import Image

def generate_svg():
    im2 = Image.open('public/logo-mark.png')
    w, h = im2.size
    arr = np.array(im2)
    alpha = arr[:, :, 3]
    blue_mask = (arr[:, :, 2] > 180) & (arr[:, :, 0] < 120) & (alpha > 100)

    pad = np.pad(blue_mask, 1, mode='constant')

    # Trace outer boundary
    def trace(mask):
        ys, xs = np.where(mask)
        if len(ys) == 0: return []
        idx = np.lexsort((ys, xs))[0]
        start = (ys[idx], xs[idx])
        dirs = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]
        c = [start]
        curr = start
        back = 6
        for _ in range(5000):
            found = False
            s_dir = (back + 1) % 8
            for i in range(8):
                d = (s_dir + i) % 8
                ny, nx = curr[0] + dirs[d][0], curr[1] + dirs[d][1]
                if 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1] and mask[ny, nx]:
                    curr = (ny, nx)
                    back = (d + 4) % 8
                    found = True
                    break
            if not found or curr == start:
                break
            c.append(curr)
        return [(p[1] - 1, p[0] - 1) for p in c]

    pts = trace(pad)

    # Ramer-Douglas-Peucker
    def rdp(points, epsilon):
        if len(points) < 3: return points
        p1 = np.array(points[0])
        p2 = np.array(points[-1])
        d = np.linalg.norm(p2 - p1)
        if d == 0:
            dist = np.linalg.norm(points - p1, axis=1)
        else:
            diff = p2 - p1
            dist = np.abs(diff[0] * (p1[1] - points[:, 1]) - diff[1] * (p1[0] - points[:, 0])) / d
        max_idx = np.argmax(dist)
        if dist[max_idx] > epsilon:
            left = rdp(points[:max_idx+1], epsilon)
            right = rdp(points[max_idx:], epsilon)
            return np.vstack([left[:-1], right])
        else:
            return np.vstack([points[0], points[-1]])

    pts_arr = np.array(pts)
    sim = rdp(pts_arr, 0.6)
    print(f'Simplified from {len(pts)} to {len(sim)} points')

    # Format SVG path
    d_str = 'M ' + ' L '.join(f'{pt[0]:.1f},{pt[1]:.1f}' for pt in sim) + ' Z'

    # 1. Color Mark SVG
    svg_mark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" fill="none">
  <!-- IQAutoMarket Standalone Gear Mark -->
  <path d="{d_str}" fill="#335aff" />
  <circle cx="80.5" cy="74.5" r="32.5" fill="#fd660e" />
</svg>
'''
    with open('public/logo-mark.svg', 'w') as f:
        f.write(svg_mark)

    # 2. White Mark SVG (Monochrome for dark headers / contrast)
    svg_mark_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" fill="none">
  <!-- IQAutoMarket Standalone Gear Mark (Monochrome White) -->
  <path d="{d_str}" fill="#ffffff" />
  <circle cx="80.5" cy="74.5" r="32.5" fill="#ffffff" />
</svg>
'''
    with open('public/logo-white.svg', 'w') as f:
        f.write(svg_mark_white)

    # 3. Square Favicon SVG (centered in a viewBox="0 0 160 160")
    # Mark is 114x150. Centering in 160x160: dx = (160 - 114)/2 = 23, dy = (160 - 150)/2 = 5
    svg_favicon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
  <g transform="translate(23, 5)">
    <path d="{d_str}" fill="#335aff" />
    <circle cx="80.5" cy="74.5" r="32.5" fill="#fd660e" />
  </g>
</svg>
'''
    with open('public/favicon.svg', 'w') as f:
        f.write(svg_favicon)

    print('Successfully generated SVG files in public/')

if __name__ == '__main__':
    generate_svg()
