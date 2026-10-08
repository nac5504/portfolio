import * as THREE from "three";

/** Bind UVs to the existing display's vertices, never to a second floating plane.
 * This asset's display is in its local XY plane. Reject incompatible replacements
 * instead of silently guessing a screen axis or falling back to an HTML overlay.
 */
export function createDisplayGeometry(source: THREE.BufferGeometry) {
  source.computeBoundingBox();
  const bounds = source.boundingBox!;
  const size = bounds.getSize(new THREE.Vector3());
  if (size.x <= 0 || size.y <= 0 || size.z > Math.min(size.x, size.y) * 0.001) {
    throw new Error("The phone display must be a planar XY mesh with nonzero dimensions.");
  }
  const geometry = source.clone();
  const positions = geometry.getAttribute("position");
  const uv = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    uv[i * 2] = (positions.getX(i) - bounds.min.x) / size.x;
    uv[i * 2 + 1] = (positions.getY(i) - bounds.min.y) / size.y;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return { geometry, aspect: size.y / size.x };
}

export const SCREEN_WIDTH = 300;
export const socials = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/nicholas-candello-426392157/", icon: "/portfolio/icons/linkedin.png" },
  { name: "X", href: "https://x.com/nick_candello", icon: "/portfolio/icons/x.png" },
  { name: "Instagram", href: "https://www.instagram.com/nick_candello", icon: "/portfolio/icons/instagram.png" },
];

type ScreenApp = { name: string; slug: string; icon: string; color: string };
export type ScreenTarget = {
  x: number; y: number; width: number; height: number; label: string;
  slug?: string; href?: string;
};

// Rendering and hit testing share these exact rectangles.
export function screenTargets(apps: ScreenApp[], height: number): ScreenTarget[] {
  return [
    ...apps.map((app, i) => ({
      x: 24 + (i % 3) * 94, y: 76 + Math.floor(i / 3) * 106,
      width: 64, height: 88, label: app.name, slug: app.slug,
    })),
    ...socials.map((social, i) => ({
      x: 38 + i * 80, y: height - 107, width: 64, height: 64,
      label: social.name, href: social.href,
    })),
  ];
}

export function targetAtUV(targets: ScreenTarget[], uv: THREE.Vector2, height: number) {
  const x = uv.x * SCREEN_WIDTH;
  const y = (1 - uv.y) * height;
  return targets.find(t => x >= t.x && x <= t.x + t.width && y >= t.y && y <= t.y + t.height);
}

export function createScreenTexture(apps: ScreenApp[], height: number, anisotropy: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round(1024 * height / SCREEN_WIDTH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("A 2D canvas is required to draw the phone screen.");
  ctx.scale(canvas.width / SCREEN_WIDTH, canvas.height / height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  const targets = screenTargets(apps, height);
  const images = new Map<string, HTMLImageElement>();
  let disposed = false;
  let hovered: ScreenTarget | undefined;

  function rounded(x: number, y: number, w: number, h: number, r: number, fill: string) {
    ctx!.beginPath();
    ctx!.roundRect(x, y, w, h, r);
    ctx!.fillStyle = fill;
    ctx!.fill();
  }
  function icon(src: string, target: ScreenTarget, fallback: string) {
    const { x, y, width } = target;
    ctx!.save();
    if (hovered === target) {
      ctx!.translate(x + width / 2, y + width / 2);
      ctx!.scale(1.07, 1.07);
      ctx!.translate(-x - width / 2, -y - width / 2);
    }
    rounded(x, y, width, width, 15, fallback);
    ctx!.clip();
    const image = images.get(src);
    if (image) ctx!.drawImage(image, x, y, width, width);
    ctx!.restore();
  }
  function draw() {
    if (disposed) return;
    ctx!.fillStyle = "#242044";
    ctx!.fillRect(0, 0, SCREEN_WIDTH, height);
    const wallpaper = images.get("/portfolio/icons/phoneBackground.jpg");
    if (wallpaper) {
      const scale = Math.max(SCREEN_WIDTH / wallpaper.width, height / wallpaper.height);
      const w = wallpaper.width * scale, h = wallpaper.height * scale;
      ctx!.drawImage(wallpaper, (SCREEN_WIDTH - w) / 2, (height - h) / 2, w, h);
    }
    ctx!.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx!.textAlign = "left";
    ctx!.fillStyle = "white";
    ctx!.fillText("9:41", 22, 34);
    rounded(90, 15, 120, 34, 18, "black");
    for (let i = 0; i < 4; i++) rounded(217 + i * 4, 34 - (i + 1) * 2.5, 2.5, (i + 1) * 2.5, 0.7, "white");
    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1.4;
    for (const r of [3, 6, 9]) {
      ctx!.beginPath(); ctx!.arc(242, 34, r, Math.PI * 1.23, Math.PI * 1.77); ctx!.stroke();
    }
    rounded(256, 24, 22, 11, 3, "rgba(255,255,255,.6)");
    rounded(258, 26, 18, 7, 1, "white");
    rounded(279, 27, 2, 5, 1, "rgba(255,255,255,.6)");
    apps.forEach((app, i) => {
      const target = targets[i];
      icon(app.icon, target, app.color);
      ctx!.font = "500 11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx!.textAlign = "center";
      ctx!.fillStyle = "white";
      ctx!.shadowColor = "rgba(0,0,0,.6)";
      ctx!.shadowBlur = 4;
      ctx!.fillText(app.name, target.x + 32, target.y + 81);
      ctx!.shadowBlur = 0;
    });
    rounded(14, height - 118, 272, 87, 23, "rgba(132,100,180,.38)");
    socials.forEach((social, i) => icon(social.icon, targets[apps.length + i], "#5d447d"));
    rounded(83, height - 22, 134, 5, 2.5, "rgba(255,255,255,.55)");
    texture.needsUpdate = true;
  }
  draw();
  for (const src of ["/portfolio/icons/phoneBackground.jpg", ...apps.map(a => a.icon), ...socials.map(s => s.icon)]) {
    const image = new Image();
    image.onload = () => { if (!disposed) { images.set(src, image); draw(); } };
    image.src = src;
  }
  return {
    texture, targets,
    hover(target: ScreenTarget | undefined) {
      if (hovered !== target) { hovered = target; draw(); }
    },
    dispose() { disposed = true; texture.dispose(); },
  };
}
