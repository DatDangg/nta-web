/**
 * measure-frame.mjs — đo thông số khung cửa sổ macOS trên ảnh PNG đã có.
 *
 * Dùng trong Bước 1 khảo sát: đo ảnh cũ ở public/images/solutions/ để tái tạo
 * đúng khung khi chụp bộ ảnh mới. Không sửa ảnh gốc.
 *
 * Chạy: node scripts/screenshots/measure-frame.mjs <đường-dẫn-png> [--json]
 */
import sharp from "sharp";
import path from "node:path";

const file = process.argv[2];
const asJson = process.argv.includes("--json");

if (!file) {
  console.error("Dùng: node scripts/screenshots/measure-frame.mjs <png> [--json]");
  process.exit(1);
}

const img = sharp(path.resolve(file));
const meta = await img.metadata();
const { width, height } = meta;

const raw = await img.ensureAlpha().raw().toBuffer();
const px = (x, y) => {
  const i = (y * width + x) * (meta.channels || 4);
  return [raw[i], raw[i + 1], raw[i + 2]];
};
const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
const dist = (a, b) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

// 1. Nền ngoài: trung bình 4 góc
const corners = [px(4, 4), px(width - 5, 4), px(4, height - 5), px(width - 5, height - 5)];
const outerAvg = corners.reduce(
  (acc, c) => [acc[0] + c[0] / 4, acc[1] + c[1] / 4, acc[2] + c[2] / 4],
  [0, 0, 0],
);
const outerHex = hex(outerAvg.map(Math.round));

// 2. Biên cửa sổ
const differs = (c) => dist(c, outerAvg) > 24;
const findEdgeX = (fromLeft) => {
  const y = Math.floor(height / 2);
  if (fromLeft) {
    for (let x = 0; x < width; x++) if (differs(px(x, y))) return x;
  } else {
    for (let x = width - 1; x >= 0; x--) if (differs(px(x, y))) return x;
  }
  return -1;
};
const findEdgeY = (fromTop) => {
  const x = Math.floor(width / 2);
  if (fromTop) {
    for (let y = 0; y < height; y++) if (differs(px(x, y))) return y;
  } else {
    for (let y = height - 1; y >= 0; y--) if (differs(px(x, y))) return y;
  }
  return -1;
};
const win = {
  left: findEdgeX(true),
  right: findEdgeX(false),
  top: findEdgeY(true),
  bottom: findEdgeY(false),
};

// 3. Ba chấm: tìm pixel đỏ/vàng/xanh riêng biệt trong dải titlebar, lấy bounding box
const findDot = (test) => {
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, color = null;
  for (let y = win.top + 2; y < win.top + 60 && y < height; y++) {
    for (let x = win.left + 6; x < win.left + 120 && x < width; x++) {
      const p = px(x, y);
      if (test(p)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        color = p;
      }
    }
  }
  if (maxX < 0) return null;
  return {
    centerX: Math.round((minX + maxX) / 2) - win.left,
    centerY: Math.round((minY + maxY) / 2) - win.top,
    diameter: Math.max(maxX - minX + 1, maxY - minY + 1),
    color: hex(color),
  };
};
const dots = [
  { kind: "red", ...findDot((p) => p[0] > 170 && p[1] < 110 && p[2] < 110) },
  { kind: "yellow", ...findDot((p) => p[0] > 200 && p[1] > 155 && p[1] < 235 && p[2] < 120) },
  { kind: "green", ...findDot((p) => p[1] > 150 && p[0] < 120 && p[2] < 130) },
].filter(Boolean);

// 4. Đường phân cách titlebar: hàng ngang có >=70% chiều rộng cửa sổ lệch màu
//    so với hàng phía trên > 30 → ranh giới titlebar/nội dung
let titlebarHeight = -1;
let dividerColor = null;
{
  const yFrom = win.top + 20;
  const yTo = Math.min(win.top + 200, win.bottom - 40);
  for (let y = yFrom; y < yTo; y++) {
    const rowA = px(win.left + 200, y - 2);
    let count = 0;
    let total = 0;
    const sample = [];
    for (let x = win.left + 4; x <= win.right - 4; x += 4) {
      total++;
      if (differs(px(x, y)) !== differs(px(x, y))) continue;
      const diffHere = dist(px(x, y), px(x, y - 2));
      if (diffHere > 25) {
        count++;
        sample.push(px(x, y));
      }
    }
    if (count / total > 0.7) {
      titlebarHeight = y - win.top;
      dividerColor = hex(sample[0] || [0, 0, 0]);
      break;
    }
  }
}

// 5. Bo góc cửa sổ: đo bán kính bằng cách tìm rìa trên của cửa sổ theo từng cột
let cornerRadius = 0;
{
  // Cột gần trái nhất: tìm y đầu tiên pixel lệch nền khi quét từ trên xuống
  const colX = win.left + 2;
  for (let y = win.top - 40; y < win.top + 200; y++) {
    if (differs(px(colX, y))) {
      cornerRadius = Math.max(cornerRadius, y - win.top + 2);
      break;
    }
  }
}

const result = {
  file: path.basename(file),
  size: { width, height, ratio: +(height / width).toFixed(4) },
  outerBackground: outerHex,
  window: {
    x: win.left,
    y: win.top,
    width: win.right - win.left + 1,
    height: win.bottom - win.top + 1,
    padding: win.left, // đối xứng
    paddingBottom: height - 1 - win.bottom,
  },
  titlebar: { heightPx: titlebarHeight, dividerColor },
  trafficDots: dots,
  cornerRadiusApprox: cornerRadius,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`== ${result.file} — ${width}x${height} (tỷ lệ ${result.size.ratio}) ==`);
  console.log(`Nền ngoài: ${outerHex}`);
  console.log(
    `Cửa sổ: ${result.window.width}x${result.window.height} tại (${win.left},${win.top}), padding=${win.left} (trên) / ${result.window.paddingBottom} (dưới)`,
  );
  console.log(`Thanh tiêu đề: cao ${titlebarHeight}px, màu đường kẻ: ${dividerColor}`);
  console.log(
    `3 chấm: ${dots.map((d) => `${d.kind} ⌀${d.diameter} @(${d.centerX},${d.centerY}) ${d.color}`).join(" | ") || "không tìm thấy"}`,
  );
  console.log(`Bo góc ước lượng: ~${cornerRadius}px`);
}
