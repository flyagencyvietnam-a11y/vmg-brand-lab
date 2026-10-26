// Hình học đường nối trên bản đồ toàn cảnh. Toạ độ theo khung vẽ (chưa nhân tỷ lệ phóng).

export type Rect = { x: number; y: number; w: number; h: number };

const GAP = 10;

/**
 * Đường cong Bézier từ ô A tới ô B. B nằm dưới A thì đi từ đáy A tới đỉnh B (và ngược lại);
 * hai ô ngang hàng thì đi từ cạnh bên của A tới cạnh đối diện của B. Trả về lệnh `d` của SVG path.
 */
export function edgePath(a: Rect, b: Rect): string {
  const acx = a.x + a.w / 2;
  const bcx = b.x + b.w / 2;
  const aBottom = a.y + a.h;
  const bBottom = b.y + b.h;

  if (b.y - aBottom >= GAP) {
    const my = (aBottom + b.y) / 2;
    return `M${acx},${aBottom} C${acx},${my} ${bcx},${my} ${bcx},${b.y}`;
  }
  if (a.y - bBottom >= GAP) {
    const my = (a.y + bBottom) / 2;
    return `M${acx},${a.y} C${acx},${my} ${bcx},${my} ${bcx},${bBottom}`;
  }
  const right = bcx >= acx;
  const x1 = right ? a.x + a.w : a.x;
  const x2 = right ? b.x : b.x + b.w;
  const y1 = a.y + a.h / 2;
  const y2 = b.y + b.h / 2;
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}
