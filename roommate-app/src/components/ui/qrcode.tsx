import { useMemo } from 'react';

// Galois field tables for GF(256)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
let v = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = v;
  GF_LOG[v] = i;
  v <<= 1;
  if (v & 0x100) v ^= 0x11d;
}
for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];

function gfMul(x: number, y: number): number {
  return x === 0 || y === 0 ? 0 : GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGenPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], root);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): Uint8Array {
  const gen = rsGenPoly(ecLen);
  const res = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++) {
    const coef = data[i] ^ res[0];
    res.copyWithin(0, 1);
    res[ecLen - 1] = 0;
    for (let j = 0; j < ecLen; j++) {
      res[j] ^= gfMul(gen[j], coef);
    }
  }
  return res;
}

// Version table: [version, size, dataCapacityL, ecLenL, alignPos]
const VERSION_TABLE: [number, number, number, number, number[]][] = [
  [1, 21, 19, 7, []],
  [2, 25, 34, 10, [6, 18]],
  [3, 29, 55, 15, [6, 22]],
  [4, 33, 80, 20, [6, 26]],
  [5, 37, 108, 26, [6, 30]],
];

function generateQrMatrix(text: string): boolean[][] {
  const utf8 = new TextEncoder().encode(text);
  let vInfo = VERSION_TABLE.find((ver) => ver[2] >= utf8.length + 3);
  if (!vInfo) vInfo = VERSION_TABLE[VERSION_TABLE.length - 1];
  const [, size, dataCap, ecLen, alignPos] = vInfo;

  // Build bitstream
  const bits: number[] = [];
  function addBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  }
  addBits(0b0100, 4); // Byte mode
  addBits(utf8.length, 8); // Length
  for (const b of utf8) addBits(b, 8);
  addBits(0, 4); // Terminator
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    dataBytes.push(byte);
  }
  const pad = [0xec, 0x11];
  let pIdx = 0;
  while (dataBytes.length < dataCap) {
    dataBytes.push(pad[pIdx]);
    pIdx ^= 1;
  }

  const ecBytes = rsEncode(dataBytes, ecLen);
  const totalBytes = [...dataBytes, ...Array.from(ecBytes)];

  // Matrix creation: null = empty, true = black, false = white
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  function setFunction(r: number, c: number, val: boolean) {
    matrix[r][c] = val;
    isFunction[r][c] = true;
  }

  // Finder pattern
  function placeFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            setFunction(
              row,
              col,
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
            );
          } else {
            setFunction(row, col, false); // Separator
          }
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Alignment patterns
  if (alignPos.length > 0) {
    for (const r of alignPos) {
      for (const c of alignPos) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const val = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunction(r + dr, c + dc, val);
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setFunction(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setFunction(i, 6, i % 2 === 0);
  }

  // Dark module
  setFunction(size - 8, 8, true);

  // Format info placeholders
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[8][i]) setFunction(8, i, false);
    if (!isFunction[i][8]) setFunction(i, 8, false);
  }
  for (let i = size - 8; i < size; i++) {
    if (!isFunction[8][i]) setFunction(8, i, false);
    if (!isFunction[i][8]) setFunction(i, 8, false);
  }

  // Place data bits in zigzag
  let bitIdx = 0;
  const allBits: number[] = [];
  for (const byte of totalBytes) {
    for (let i = 7; i >= 0; i--) allBits.push((byte >> i) & 1);
  }

  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);
    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Mask 0: (r + c) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bit ^ (mask ? 1 : 0)) === 1;
        }
      }
    }
    upward = !upward;
  }

  // Format bits for Level L, Mask 0: 0b111011111000100 (BCH 15,5 with XOR 0x5412)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  matrix[8][0] = formatBits[0] === 1;
  matrix[8][1] = formatBits[1] === 1;
  matrix[8][2] = formatBits[2] === 1;
  matrix[8][3] = formatBits[3] === 1;
  matrix[8][4] = formatBits[4] === 1;
  matrix[8][5] = formatBits[5] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  matrix[5][8] = formatBits[9] === 1;
  matrix[4][8] = formatBits[10] === 1;
  matrix[3][8] = formatBits[11] === 1;
  matrix[2][8] = formatBits[12] === 1;
  matrix[1][8] = formatBits[13] === 1;
  matrix[0][8] = formatBits[14] === 1;

  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 0; i < 8; i++) matrix[8][size - 8 + i] = formatBits[7 + i] === 1;

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

export interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
  level?: string;
  includeMargin?: boolean;
}

export function QRCodeSVG({
  value,
  size = 150,
  className = '',
  includeMargin = false,
}: QRCodeSVGProps) {
  const matrix = useMemo(() => generateQrMatrix(value), [value]);
  const matrixSize = matrix.length;
  const margin = includeMargin ? 2 : 0;
  const totalSize = matrixSize + margin * 2;

  // Build SVG path
  const pathD = useMemo(() => {
    let d = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const x = c + margin;
          const y = r + margin;
          d += `M${x} ${y}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize, margin]);

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-label="QR Code"
    >
      <rect width={totalSize} height={totalSize} fill="#ffffff" />
      <path d={pathD} fill="#000000" />
    </svg>
  );
}
