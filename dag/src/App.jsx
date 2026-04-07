import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_W = 172;
const NODE_H = 88;
const LAYER_H = 200;
const SCATTER_NUDGE = 8;

const TOKEN_COLORS = { RBT:"#8b5cf6",FT:"#10b981",NFT:"#ec4899",SC:"#f97316",default:"#94a3b8" };
const STATUS_COLORS = { confirmed:"#e1b524ff",pending:"#f59e0b" };
const tc = s => TOKEN_COLORS[s] || TOKEN_COLORS.default;
const sc = s => STATUS_COLORS[s] || "#dcbd24ff";

const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.5;
const ZOOM_L1 = 0.55;
const ZOOM_L2 = 0.85;

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = "https://testnetexplorer.rubix.net/api";

// tokens field is {ft:[...], nft:[...], rbt:[...], smartContract:[...]}
// committedTokens field is a flat array of token objects
// Each token object: {data, tokenId, previousTransactionID}
const TOKEN_TYPE_MAP = { ft: "FT", nft: "NFT", rbt: "RBT", smartContract: "SC" };

function flattenTokensField(tokensField) {
  const result = [];
  if (!tokensField) return result;

  if (Array.isArray(tokensField)) {
    // committedTokens — flat array
    tokensField.forEach(item => {
      if (!item) return;
      result.push({
        tokenId: item.tokenId || "",
        prevTxId: item.previousTransactionID || null,
        symbol: "RBT", // committedTokens are always RBT
      });
    });
  } else if (typeof tokensField === "object") {
    // tokens — {ft, nft, rbt, smartContract} sub-arrays
    Object.entries(TOKEN_TYPE_MAP).forEach(([key, symbol]) => {
      const arr = tokensField[key];
      if (!Array.isArray(arr)) return;
      arr.forEach(item => {
        if (!item) return;
        result.push({
          tokenId: item.tokenId || "",
          prevTxId: item.previousTransactionID || null,
          symbol,
        });
      });
    });
  }
  return result;
}

function mapTransaction(t) {
  const tokenList = [
    ...flattenTokensField(t.tokens),
    ...flattenTokensField(t.committedTokens),
  ];
  // quorums is [{did, tokens:[...]}, ...] — extract DIDs as strings
  const quorumDids = Array.isArray(t.quorums)
    ? t.quorums.map(q => (typeof q === "object" ? q.did || "" : String(q))).filter(Boolean)
    : [];
  return {
    id: t.transaction_id,
    hash: t.transaction_id ? t.transaction_id.slice(0, 12) : "",
    timestamp: t.epoch || 0,
    tokens: tokenList,
    status: "confirmed",
    validator: quorumDids[0] || "",
    quorumDids,
    value: tokenList.length,
    initiator: typeof t.initiator === "string" ? t.initiator : "",
    owner: typeof t.owner === "string" ? t.owner : "",
    memo: t.memo ? String(t.memo) : "",
    network: t.network ? String(t.network) : "",
  };
}

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#030a1a",
    bgCard: "rgba(6,12,32,0.96)",
    bgPanel: "rgba(2,6,23,0.97)",
    bgPanelMid: "rgba(2,6,23,0.92)",
    bgHeader: "rgba(3,10,26,0.94)",
    bgBadge: "rgba(2,8,24,0.9)",
    bgInput: "rgba(255,255,255,0.03)",
    bgItem: "rgba(255,255,255,0.02)",
    bgBtn: "rgba(255,255,255,0.04)",
    border: "rgba(155, 173, 20, 0.07)",
    borderMuted: "rgba(212, 176, 18, 0.05)",
    borderBtn: "rgba(255,255,255,0.06)",
    t1: "#e2e8f0", t2: "#94a3b8", t3: "#696547ff", t4: "#334155", t5: "#1e293b",
    dot: "rgba(255,255,255,0.03)",
    gBg: "radial-gradient(ellipse at 50% -10%, rgba(34,211,238,0.05) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(99,102,241,0.04) 0%, transparent 50%)",
  },
  light: {
    bg: "#fffdf0",
    bgCard: "#fffef7",
    bgPanel: "#fffef7",
    bgPanelMid: "#fefce8",
    bgHeader: "#fffef7",
    bgBadge: "#fefce8",
    bgInput: "rgba(0,0,0,0.03)",
    bgItem: "rgba(234,179,8,0.06)",
    bgBtn: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.12)",
    borderMuted: "rgba(0,0,0,0.07)",
    borderBtn: "rgba(0,0,0,0.1)",
    t1: "#0a0a0a", t2: "#1a1a1a", t3: "#333333", t4: "#555555", t5: "#888888",
    dot: "rgba(0,0,0,0.06)",
    gBg: "radial-gradient(ellipse at 50% -10%, rgba(234,179,8,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(234,179,8,0.08) 0%, transparent 50%)",
  },
};

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function computeLayout(txns, apiEdges, viewW = 1440) {
  // Assign layers by epoch: newest = layer 0 (top), older = higher layers
  const sorted = [...txns].sort((a, b) => b.timestamp - a.timestamp);
  const LAYER_SIZE = 10;
  const layerOf = {};
  sorted.forEach((tx, i) => { layerOf[tx.id] = Math.floor(i / LAYER_SIZE); });

  const byLayer = {};
  txns.forEach(tx => { (byLayer[layerOf[tx.id] ?? 0] ??= []).push(tx); });

  // Fill ~75% of the viewport width at a comfortable zoom level (~0.85)
  const SCATTER_X = (viewW / 0.95) * 1;

  const positions = {};
  Object.entries(byLayer).forEach(([liStr, txs]) => {
    const li = Number(liStr);
    const rng = seededRand(li * 9999 + txs.length * 31);
    const count = txs.length;
    const visY = li * LAYER_H;
    txs.forEach((tx, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const baseX = (t - 0.5) * SCATTER_X;
      const jitterX = (rng() - 0.5) * (SCATTER_X / Math.max(count, 1)) * 1.1;
      const jitterY = (rng() - 0.5) * SCATTER_NUDGE * 2;
      positions[tx.id] = { x: baseX + jitterX - NODE_W / 2, y: visY + jitterY, layer: li };
    });
  });

  const ids = Object.keys(positions);
  const MIN_X = NODE_W + 20, MIN_Y = NODE_H + 16;
  const iters = Math.min(20, ids.length > 200 ? 5 : 20);
  for (let iter = 0; iter < iters; iter++) {
    for (let a = 0; a < ids.length; a++) {
      for (let b = a + 1; b < ids.length; b++) {
        const pa = positions[ids[a]], pb = positions[ids[b]];
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const ox = MIN_X - Math.abs(dx), oy = MIN_Y - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          const px = (ox / 2 + 4) * Math.sign(dx || 1);
          const py = (oy / 2 + 4) * Math.sign(dy || 1) * 0.5;
          pa.x -= px; pb.x += px; pa.y -= py; pb.y += py;
        }
      }
    }
  }

  // Use API-provided edges, filtered to nodes we have positions for
  const edges = (apiEdges || [])
    .filter(e => positions[e.from] && positions[e.to])
    .map(e => ({ ...e, token: e.token || "RBT" }));

  const xs = Object.values(positions).map(p => p.x);
  const ys = Object.values(positions).map(p => p.y);
  const bounds = xs.length ? {
    minX: Math.min(...xs) - 80, maxX: Math.max(...xs) + NODE_W + 80,
    minY: Math.min(...ys) - 80, maxY: Math.max(...ys) + NODE_H + 80,
  } : { minX: -400, maxX: 400, minY: -100, maxY: 400 };

  return { positions, edges, bounds };
}

// ─── Connected traversal (ancestors + descendants) ────────────────────────────
function getAllConnected(txId, forwardMap, reverseMap) {
  const visited = new Set(), queue = [txId];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    (forwardMap[id] || []).forEach(aid => queue.push(aid));
    (reverseMap[id] || []).forEach(did => queue.push(did));
  }
  return visited;
}

// Returns Map<id, depth> using shortest-path BFS from txId through forwardMap.
// Shortest path means a direct parent is always depth 1, even if it's also
// reachable via a longer chain through other ancestors.
function getAncestorDepths(txId, forwardMap) {
  const depths = new Map([[txId, 0]]);
  const queue = [[txId, 0]];
  while (queue.length) {
    const [id, depth] = queue.shift();
    (forwardMap[id] || []).forEach(aid => {
      if (!depths.has(aid)) {
        depths.set(aid, depth + 1);
        queue.push([aid, depth + 1]);
      }
    });
  }
  return depths;
}

// ─── Pan Joystick ─────────────────────────────────────────────────────────────
function PanJoystick({ onPan, isDark }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const knobRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const MAX_DIST = 16;
  const SPEED = 1;

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    const animate = () => {
      if (!dragging.current) return;
      const { x, y } = knobRef.current;
      if (x !== 0 || y !== 0) onPan(x * SPEED, y * SPEED);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [onPan]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.min(dist, MAX_DIST) / (dist || 1);
      const kx = dx * scale;
      const ky = dy * scale;
      knobRef.current = { x: kx, y: ky };
      setKnob({ x: kx, y: ky });
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      knobRef.current = { x: 0, y: 0 };
      setKnob({ x: 0, y: 0 });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isActive = knob.x !== 0 || knob.y !== 0;

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={e => e.stopPropagation()}
      style={{
        width: 56, height: 56, borderRadius: "50%", cursor: "grab", position: "relative",
        userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center",
        background: isDark
          ? "radial-gradient(circle at 38% 32%, #5a8dc4 0%, #2a5080 40%, #1a3a60 100%)"
          : "radial-gradient(circle at 38% 32%, #fffde7 0%, #fef08a 45%, #fde68a 100%)",
        boxShadow: isDark
          ? "0 6px 20px rgba(0,0,0,0.55), inset 0 1px 3px rgba(255,255,255,0.18), inset 0 -2px 4px rgba(0,0,0,0.4)"
          : "0 6px 20px rgba(0,0,0,0.18), inset 0 1px 3px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Inner knob bubble */}
      <div style={{
        width: 22, height: 22, borderRadius: "50%", position: "absolute", pointerEvents: "none",
        transform: `translate(${knob.x}px, ${knob.y}px)`,
        transition: isActive ? "none" : "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        background: isDark
          ? "radial-gradient(circle at 35% 30%, #a8d0f0 0%, #4a88c0 55%, #2a5890 100%)"
          : "radial-gradient(circle at 35% 30%, #ffffff 0%, #fef3c7 55%, #fbbf24 100%)",
        boxShadow: isDark
          ? "0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)"
          : "0 3px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,1)",
      }} />
    </div>
  );
}


// ─── Colors ───────────────────────────────────────────────────────────────────
const LEVEL_COLORS = [
  "#22d3ee", // 0 cyan
  "#818cf8", // 1 indigo
  "#34d399", // 2 emerald
  "#fb923c", // 3 orange
  "#f472b6", // 4 pink
  "#2d2d2d", // 5 blackish (and beyond)
];

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Edges ────────────────────────────────────────────────────────────────────
function getEdgePoints(f, t) {
  const fcx = f.x + NODE_W / 2, fcy = f.y + NODE_H / 2;
  const tcx = t.x + NODE_W / 2, tcy = t.y + NODE_H / 2;
  const dx = tcx - fcx, dy = tcy - fcy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { fx: fcx, fy: fcy + NODE_H / 2, tx: tcx, ty: tcy - NODE_H / 2 };
  const nx = dx / dist, ny = dy / dist;
  const hw = NODE_W / 2, hh = NODE_H / 2;
  const tSrcX = nx !== 0 ? hw / Math.abs(nx) : Infinity;
  const tSrcY = ny !== 0 ? hh / Math.abs(ny) : Infinity;
  const tSrc = Math.min(tSrcX, tSrcY);
  const tDstX = nx !== 0 ? hw / Math.abs(nx) : Infinity;
  const tDstY = ny !== 0 ? hh / Math.abs(ny) : Infinity;
  const tDst = Math.min(tDstX, tDstY);
  return {
    fx: fcx + nx * tSrc, fy: fcy + ny * tSrc,
    tx: tcx - nx * tDst, ty: tcy - ny * tDst,
  };
}

const NEUTRAL_EDGE_COLOR = "#94a3b8";

function EdgesLayer({ edges, positions, ancestorIds, hoveredAncestors, transform }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        {/* Single black arrowhead marker for all edges */}
        <marker id="arr" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
          <path d="M0,1 L10,6 L0,11 L3,6 Z" fill="#000000" opacity={0.95} />
        </marker>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="glow-strong"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
        {edges.map((e, i) => {
          const f = positions[e.from], t = positions[e.to]; if (!f || !t) return null;
          const { fx, fy, tx: tx2, ty: ty2 } = getEdgePoints(f, t);
          const dx = tx2 - fx, dy = ty2 - fy;
          const len = Math.sqrt(dx * dx + dy * dy);
          const curve = Math.min(len * 0.25, 40);
          const cx1 = fx + dx * 0.25 - dy / len * curve;
          const cy1 = fy + dy * 0.25 + dx / len * curve;
          const cx2 = tx2 - dx * 0.25 - dy / len * curve;
          const cy2 = ty2 - dy * 0.25 + dx / len * curve;
          const isHoverEdge = hoveredAncestors?.has(e.from) && hoveredAncestors?.has(e.to);
          const isSelectEdge = ancestorIds?.has(e.from) && ancestorIds?.has(e.to);
          const isGlowing = isHoverEdge || isSelectEdge;
          // Color based on target (destination) block depth
          const targetDepth = ancestorIds?.get(e.to);
          const hasColor = targetDepth !== undefined;
          const colorIdx = hasColor ? Math.min(targetDepth, LEVEL_COLORS.length - 1) : -1;
          const edgeCol = hasColor ? LEVEL_COLORS[colorIdx] : NEUTRAL_EDGE_COLOR;
          return (
            <path key={i}
              d={`M${fx},${fy} C${cx1},${cy1} ${cx2},${cy2} ${tx2},${ty2}`}
              fill="none" stroke={edgeCol}
              strokeWidth={isGlowing ? 1.4 : 0.9}
              strokeDasharray={isGlowing ? "none" : "5 4"}
              opacity={isGlowing ? 0.9 : (hasColor ? 0.6 : 0.28)}
              markerEnd="url(#arr)"
              filter={isHoverEdge ? "url(#glow-strong)" : isSelectEdge ? "url(#glow)" : "none"}
            />
          );
        })}
      </g>
    </svg>
  );
}

// ─── Time ago helper ──────────────────────────────────────────────────────────
function truncateAddr(addr) {
  if (!addr || addr.length <= 10) return addr || "—";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(value || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: copied ? "#10b981" : "#9ca3af", transition: "color 0.15s, background 0.15s" }}
      title={copied ? "Copied!" : `Copy ${value}`}
      onMouseEnter={e => { if (!copied) { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "rgba(156,163,175,0.15)"; }}}
      onMouseLeave={e => { e.currentTarget.style.color = copied ? "#10b981" : "#9ca3af"; e.currentTarget.style.background = "none"; }}
    >
      {copied
        ? <Check style={{ width: 14, height: 14 }} />
        : <Copy style={{ width: 14, height: 14 }} />}
    </button>
  );
}

function AddrField({ label, value, color, th }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ flex: 1, padding: "8px 10px", background: th.bgItem, borderRadius: 6, minWidth: 0, position: "relative" }}>
      <div style={{ color: th.t4, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ color: th.t1, fontSize: 11, cursor: "default", flex: 1, minWidth: 0 }}
        >
          {truncateAddr(value)}
        </div>
        {value && <CopyBtn value={value} />}
      </div>
      {hovered && value && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: 0, right: 0,
          background: color + "18", border: `1px solid ${color}55`,
          borderRadius: 6, padding: "6px 8px", color: color, fontSize: 9,
          wordBreak: "break-all", zIndex: 300, backdropFilter: "blur(8px)",
          boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 12px ${color}22`, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif",
        }}>
          {value}
        </div>
      )}
    </div>
  );
}

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Card Node ────────────────────────────────────────────────────────────────
function TxNode({ tx, x, y, selected, isAncestor, dimmed, ancestorDepth, onSelect, th }) {
  const isActive = selected;
  const hasDepth = ancestorDepth !== undefined;
  // Color only when selected or is an ancestor of selected
  const accentCol = hasDepth ? LEVEL_COLORS[Math.min(ancestorDepth, LEVEL_COLORS.length - 1)] : null;

  const borderCol = accentCol ? (isActive ? accentCol : hexAlpha(accentCol, 0.6)) : th.border;
  const bgGradient = accentCol
    ? `linear-gradient(135deg, ${hexAlpha(accentCol, isActive ? 0.15 : 0.08)} 0%, ${th.bgCard} 100%)`
    : th.bgCard;
  const boxShadow = accentCol
    ? (isActive
        ? `0 0 0 1.5px ${hexAlpha(accentCol, 0.45)}, 0 0 28px ${hexAlpha(accentCol, 0.22)}`
        : `0 0 0 1px ${hexAlpha(accentCol, 0.3)}, 0 0 14px ${hexAlpha(accentCol, 0.15)}`)
    : `0 2px 10px rgba(0,0,0,0.15)`;

  return (
    <div data-node="true"
      onClick={e => { e.stopPropagation(); onSelect(tx.id); }}
      style={{
        position: "absolute", left: x, top: y, width: NODE_W, height: NODE_H,
        background: bgGradient,
        border: `1.5px solid ${borderCol}`,
        borderTop: accentCol ? `2.5px solid ${accentCol}` : `1.5px solid ${th.border}`,
        borderRadius: 8, cursor: "pointer", overflow: "hidden",
        boxShadow,
        opacity: dimmed ? 0.18 : 1,
        transition: "box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s, opacity 0.2s",
        transform: isActive ? "scale(1.07)" : isAncestor ? "scale(1.03)" : "scale(1)",
        userSelect: "none", zIndex: isActive ? 20 : isAncestor ? 10 : 1,
      }}>
      {accentCol && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${hexAlpha(accentCol, 0.1)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}
      <div style={{ padding: "8px 10px 7px", position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ color: accentCol ? (isActive ? accentCol : th.t1) : th.t1, fontSize: 11, fontWeight: 700, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", textShadow: (isActive && accentCol) ? `0 0 14px ${hexAlpha(accentCol, 0.5)}` : "none", letterSpacing: "0.5px" }}>
          {tx.id ? `${tx.id.slice(0, 8)}......${tx.id.slice(-8)}` : "—"}
        </div>
        <div style={{ color: accentCol ?? th.t4, fontSize: 10, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", opacity: 0.85 }}>
          {timeAgo(tx.timestamp)}
        </div>
      </div>
    </div>
  );
}

const TOKEN_PAGE_SIZE = 4;

const TOKEN_STYLES = {
  RBT:     { bg: "rgba(139,92,246,0.08)",  border: "#8b5cf6", color: "#8b5cf6" },
  FT:      { bg: "rgba(16,185,129,0.08)",  border: "#10b981", color: "#10b981" },
  NFT:     { bg: "rgba(236,72,153,0.08)",  border: "#ec4899", color: "#ec4899" },
  SC:      { bg: "rgba(249,115,22,0.08)",  border: "#f97316", color: "#f97316" },
  default: { bg: "rgba(148,163,184,0.08)", border: "#94a3b8", color: "#94a3b8" },
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ tx, onClose, th }) {
  const [tokenPage, setTokenPage] = useState(0);
  useEffect(() => { setTokenPage(0); }, [tx?.id]);

  if (!tx) return null;
  const totalPages = Math.ceil(tx.tokens.length / TOKEN_PAGE_SIZE);
  const pagedTokens = tx.tokens.slice(tokenPage * TOKEN_PAGE_SIZE, (tokenPage + 1) * TOKEN_PAGE_SIZE);

  const S = { fontFamily: "'Heebo', 'Inter', system-ui, sans-serif" };
  const labelStyle = { ...S, color: th.t4, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 };

  return (
    <div style={{ position: "absolute", right: 20, top: 88, width: 300, maxHeight: "calc(100vh - 100px)", background: th.bgPanel, border: `1px solid ${th.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 100, ...S, boxShadow: "0 12px 40px rgba(0,0,0,0.22)", backdropFilter: "blur(20px)" }}>

      {/* Scrollable body */}
      <div style={{ overflowY: "auto", flex: 1 }}>

        {/* Transaction Hash */}
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${th.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={labelStyle}>Transaction Hash</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: th.t3, cursor: "pointer", padding: 4, display: "flex", borderRadius: 6 }}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>
          <div style={{ background: th.bgItem, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <code style={{ fontSize: 11, fontFamily: "monospace", color: th.t1, wordBreak: "break-all", flex: 1, lineHeight: 1.6 }}>{tx.id}</code>
            <CopyBtn value={tx.id} />
          </div>
        </div>

        {/* Initiator + Owner */}
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${th.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ label: "Initiator", value: tx.initiator }, { label: "Owner", value: tx.owner }].map(({ label, value }) => (
            <div key={label}>
              <div style={{ ...labelStyle, marginBottom: 5 }}>{label}</div>
              <div style={{ background: th.bgItem, borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${th.border}` }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: th.t1, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
                {value && value !== "N/A" && <CopyBtn value={value} />}
              </div>
            </div>
          ))}
        </div>

        {/* Assets */}
        <div style={{ padding: "12px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={labelStyle}>Assets Involved</div>
            <span style={{ background: th.bgItem, color: th.t2, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, ...S }}>
              Total: {tx.tokens.length}
            </span>
          </div>

          {tx.tokens.length === 0 ? (
            <div style={{ color: th.t5, fontSize: 11, padding: "6px 0" }}>No assets</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {pagedTokens.map((tok, i) => {
                const ts = TOKEN_STYLES[tok.symbol] || TOKEN_STYLES.default;
                return (
                  <div key={tokenPage * TOKEN_PAGE_SIZE + i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: ts.bg, borderLeft: `3px solid ${ts.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: ts.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 9, fontWeight: 800, ...S }}>{tok.symbol}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: th.t1, fontSize: 11, fontWeight: 700, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{tok.tokenId || "—"}</div>
                      </div>
                    </div>                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 10 }}>
              <button onClick={() => setTokenPage(p => Math.max(0, p - 1))} disabled={tokenPage === 0}
                style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${th.border}`, background: "none", color: tokenPage === 0 ? th.t5 : th.t1, cursor: tokenPage === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <span style={{ color: th.t4, fontSize: 10, ...S }}>{tokenPage + 1} / {totalPages}</span>
              <button onClick={() => setTokenPage(p => Math.min(totalPages - 1, p + 1))} disabled={tokenPage === totalPages - 1}
                style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${th.border}`, background: "none", color: tokenPage === totalPages - 1 ? th.t5 : th.t1, cursor: tokenPage === totalPages - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer — Clear Selection only, no New Transaction */}
      <div style={{ padding: "12px 18px", borderTop: `1px solid ${th.border}`, background: th.bgItem }}>
        <button onClick={onClose} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "2px solid rgba(34,211,238,0.25)", background: "rgba(34,211,238,0.05)", color: "#22d3ee", fontSize: 11, fontWeight: 700, cursor: "pointer", ...S, letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <X style={{ width: 13, height: 13 }} />
          CLEAR SELECTION
        </button>
      </div>
    </div>
  );
}

// ─── Zoom Badge ───────────────────────────────────────────────────────────────
function ZoomBadge({ scale, nodeCount, th }) {
  const zoomLevel = scale < ZOOM_L1 ? 1 : scale < ZOOM_L2 ? 2 : 3;
  const colors = { 1: "#f59e0b", 2: "#22d3ee", 3: "#a78bfa" };
  const labels = { 1: "Overview", 2: "Graph", 3: "Detail" };
  return (
    <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10, zIndex: 70, background: th.bgBadge, border: `1px solid ${th.border}`, borderRadius: 20, padding: "5px 16px", backdropFilter: "blur(8px)" }}>
      {[1, 2, 3].map(l => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: l === zoomLevel ? colors[l] : th.bgBtn, boxShadow: l === zoomLevel ? `0 0 8px ${colors[l]}88` : "" }} />
          {l === zoomLevel && <span style={{ color: colors[l], fontSize: 9, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif" }}>{labels[l]}</span>}
        </div>
      ))}
      <div style={{ width: 1, height: 12, background: th.border }} />
      <span style={{ color: th.t4, fontSize: 8, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif" }}>{(scale * 100).toFixed(0)}% · {nodeCount} nodes</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DAGVisualizer() {
  const containerRef = useRef(null);
  const isDark = false;
  const th = THEMES.light;

  const [viewSize, setViewSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [transform, setTransform] = useState({ x: window.innerWidth / 2, y: 96, scale: 0.9 });
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [transactions, setTransactions] = useState([]);
  const [apiEdges, setApiEdges] = useState([]);
  const [visibleCount, setVisibleCount] = useState(500);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const visibleTxns = useMemo(() => transactions.slice(0, visibleCount), [transactions, visibleCount]);

  const txMap = useMemo(() => Object.fromEntries(transactions.map(t => [t.id, t])), [transactions]);

  // Forward: from → [to] (ancestors), Reverse: to → [from] (descendants)
  const edgesMap = useMemo(() => {
    const map = {};
    apiEdges.forEach(e => { (map[e.from] ??= []).push(e.to); });
    return map;
  }, [apiEdges]);


  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch(`${API_BASE}/api/dagtxns`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        // Support both { transactions, edges } (new API) and flat array (old API)
        const txns = Array.isArray(data) ? data : (Array.isArray(data.transactions) ? data.transactions : []);
        if (txns.length === 0) throw new Error("No transactions found");

        const mappedTxns = txns.map(mapTransaction);
        setTransactions(mappedTxns);

        // Deduplicate edges, supplementing API edges with token-derived ones
        const edgeSeen = new Set();
        const edges = [];
        (Array.isArray(data.edges) ? data.edges : []).forEach(e => {
          const key = `${e.from}:${e.to}`;
          if (!edgeSeen.has(key)) { edgeSeen.add(key); edges.push(e); }
        });
        mappedTxns.forEach(tx => {
          tx.tokens.forEach(tok => {
            if (!tok.prevTxId) return;
            const key = `${tx.id}:${tok.prevTxId}`;
            if (!edgeSeen.has(key)) { edgeSeen.add(key); edges.push({ from: tx.id, to: tok.prevTxId }); }
          });
        });
        setApiEdges(edges);
      })
      .catch(e => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = () => setViewSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);


  const { positions, edges } = useMemo(
    () => computeLayout(visibleTxns, apiEdges, viewSize.w),
    [visibleTxns, apiEdges, viewSize.w]
  );

  const ancestorIds = useMemo(() => {
    if (!selectedId) return null;
    return getAncestorDepths(selectedId, edgesMap); // Map<id, depth>
  }, [selectedId, edgesMap]);

  const hoveredAncestors = useMemo(() => {
    if (!hoveredId) return null;
    return getAllConnected(hoveredId, edgesMap, {});
  }, [hoveredId, edgesMap]);

  const handleSelect = useCallback((id) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const onMouseDown = useCallback(e => {
    if (e.target.closest("[data-node]")) return;
    isDragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback(e => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x, dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);
  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const handler = e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.18 : 0.85;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      setTransform(t => {
        const ns = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, t.scale * factor));
        const r = ns / t.scale;
        return { x: mx - r * (mx - t.x), y: my - r * (my - t.y), scale: ns };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => t.id.toLowerCase().includes(q) || t.initiator.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery, transactions]);

  return (
    <div ref={containerRef}
      style={{ width: "100vw", height: "100vh", background: th.bg, overflow: "hidden", position: "relative", fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", transition: "background 0.3s" }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onDoubleClick={e => { if (!e.target.closest("[data-node]") && !e.target.closest("button")) setSelectedId(null); }}>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: th.gBg, pointerEvents: "none", transition: "background 0.3s" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx={15} cy={15} r={0.5} fill={th.dot} /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Loading overlay */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,10,26,0.7)", backdropFilter: "blur(4px)" }}>
          <div style={{ color: "#22d3ee", fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", fontSize: 13, letterSpacing: 2 }}>LOADING NETWORK DATA...</div>
        </div>
      )}

      {/* Error overlay */}
      {fetchError && !loading && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,10,26,0.7)", backdropFilter: "blur(4px)" }}>
          <div style={{ color: "#f87171", fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", fontSize: 12, textAlign: "center" }}>
            <div style={{ fontSize: 14, marginBottom: 6 }}>FAILED TO LOAD</div>
            <div style={{ opacity: 0.7 }}>{fetchError}</div>
          </div>
        </div>
      )}

      {/* Edges */}
      <EdgesLayer edges={edges} positions={positions} ancestorIds={ancestorIds} hoveredAncestors={hoveredAncestors} transform={transform} />

      {/* Nodes */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", transformOrigin: "0 0", pointerEvents: "auto", transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})` }}>
          {visibleTxns.map(tx => {
            const pos = positions[tx.id]; if (!pos) return null;
            const isAncestor = ancestorIds ? ancestorIds.has(tx.id) && tx.id !== selectedId : false;
            const isHoverAncestor = hoveredAncestors ? hoveredAncestors.has(tx.id) : false;
            const dimmed = ancestorIds ? !ancestorIds.has(tx.id) : false;
            const ancestorDepth = ancestorIds ? ancestorIds.get(tx.id) : undefined;
            return (
              <TxNode key={tx.id} tx={tx} x={pos.x} y={pos.y}
                selected={selectedId === tx.id} isAncestor={isAncestor}
                isHoverAncestor={isHoverAncestor} dimmed={dimmed}
                ancestorDepth={ancestorDepth}
                onSelect={handleSelect} onHover={setHoveredId} onLeave={() => setHoveredId(null)}
                th={th} isDark={isDark} />
            );
          })}
        </div>
      </div>

      {/* Show More */}
      {visibleCount < transactions.length && (
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 90 }}>
          <button
            onClick={() => setVisibleCount(c => Math.min(c + 500, transactions.length))}
            style={{ padding: "10px 28px", background: "#1c1917", color: "#fbbf24", border: "1px solid #78716c", borderRadius: 999, fontSize: 13, fontWeight: 600, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", cursor: "pointer", letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
          >
            Show More ({transactions.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Ancestor banner */}
      {hoveredId && hoveredAncestors && (
        <div style={{ position: "absolute", top: 72, left: "50%", transform: "translateX(-50%)", background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.22)", borderRadius: 20, padding: "5px 16px", zIndex: 80, display: "flex", alignItems: "center", gap: 7, backdropFilter: "blur(8px)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
          {/* <span style={{ color: "#a78bfa", fontSize: 9 }}>{(hoveredAncestors.size - 1)} ancestors visible on this page · click to highlight</span> */}
        </div>
      )}

      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 76, background: isDark ? "rgba(3,10,26,0.94)" : "#ffffff", backdropFilter: "blur(16px)", borderBottom: `1px solid ${th.borderMuted}`, display: "flex", alignItems: "center", gap: 16, padding: "0 24px", zIndex: 80, boxShadow: "0 1px 12px rgba(0,0,0,0.1)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <img src="/rubix-icon.png" alt="Rubix" style={{ height: 36, width: "auto" }} />
          <span style={{ color: th.t1, fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Rubix Explorer</span>
        </div>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 700, margin: "0 auto", position: "relative", display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
            {/* Input wrapper */}
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: th.t4, pointerEvents: "none" }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && searchResults.length > 0) { handleSelect(searchResults[0].id); setSearchQuery(""); } }}
                placeholder="Search by transaction ID or DID..."
                style={{ width: "100%", padding: "13px 44px 13px 42px", background: th.bgInput, border: "1px solid #fef3c7", borderRight: "none", borderRadius: "999px 0 0 999px", color: th.t1, fontSize: 14, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#fef3c7"}
                onBlur={e => e.target.style.borderColor = "#fef3c7"}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", color: th.t4 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Search button */}
            <button
              onClick={() => { if (searchResults.length > 0) { handleSelect(searchResults[0].id); setSearchQuery(""); } }}
              style={{ padding: "13px 26px", background: "#fefce8", color: "#090909ff", border: "1px solid #fef3c7", borderLeft: "none", borderRadius: "0 999px 999px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#ffc907f8"}
              onMouseLeave={e => e.currentTarget.style.background = "#ffc907f8"}
            >
              Search
            </button>
          </div>

          {/* Dropdown results */}
          {searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: th.bgPanel, border: `1px solid ${th.border}`, borderRadius: 10, overflow: "hidden", zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              {searchResults.map(tx => (
                <div key={tx.id} onClick={() => { handleSelect(tx.id); setSearchQuery(""); }}
                  style={{ padding: "9px 14px", cursor: "pointer", borderBottom: `1px solid ${th.borderMuted}`, display: "flex", alignItems: "center", gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,211,238,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc(tx.status), flexShrink: 0, boxShadow: `0 0 6px ${sc(tx.status)}` }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: th.t1, fontSize: 11, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.id}</div>
                    <div style={{ color: th.t5, fontSize: 9, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif", marginTop: 1 }}>{tx.initiator ? tx.initiator.slice(0, 20) + "…" : tx.network || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status pills */}
        {/* <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {[["confirmed", "#22d3ee", confirmed], ["pending", "#f59e0b", pending]].map(([l, c, n]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: c + "12", border: `1px solid ${c}30` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 5px ${c}88` }} />
              <span style={{ color: th.t4, fontSize: 9, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif" }}>{l}</span>
              <span style={{ color: c, fontSize: 10, fontWeight: 700, fontFamily: "'Heebo', 'Inter', system-ui, sans-serif" }}>{n}</span>
            </div>
          ))}
        </div> */}

        {/* Selected ancestor pill */}
    

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: "auto", alignItems: "center" }}></div>
      </div>

      {/* Floating zoom controls — bottom left */}
      <div style={{ position: "fixed", bottom: 28, left: 28, zIndex: 90, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        {/* Pan joystick */}
        <PanJoystick isDark={isDark} onPan={(dx, dy) => setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))} />
        {/* Zoom pill (vertical) */}
        <div style={{ width: 36, height: 72, borderRadius: 999, background: isDark ? "#1e3a5f" : "#fde68a", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
          {/* Plus */}
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(ZOOM_MAX, t.scale * 1.2) }))} aria-label="Zoom in" style={{ flex: 1, width: "100%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#c4d9f8" : "#b45309"} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          {/* Divider */}
          <div style={{ width: 18, height: 1, background: isDark ? "rgba(196,217,248,0.2)" : "rgba(180,83,9,0.2)", flexShrink: 0 }} />
          {/* Minus */}
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(ZOOM_MIN, t.scale * 0.8) }))} aria-label="Zoom out" style={{ flex: 1, width: "100%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#c4d9f8" : "#b45309"} strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>

      {selectedId && <DetailPanel tx={txMap[selectedId]} onClose={() => setSelectedId(null)} th={th} />}


      {/* <ZoomBadge scale={transform.scale} nodeCount={transactions.length} th={th} /> */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap');
        [data-node] { will-change: transform; }
        button { font-family: monospace; }
      `}</style>
    </div>
  );

}
