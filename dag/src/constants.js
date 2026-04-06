export const NODE_W = 172;
export const NODE_H = 88;

export const TOKENS = ["RBT", "FT", "NFT", "SC"];
export const TOKEN_COLORS = {
  RBT: "#8b5cf6", FT: "#10b981", NFT: "#ec4899", SC: "#f97316", default: "#94a3b8",
};
export const STATUS_COLORS = { confirmed: "#22d3ee", pending: "#f59e0b" };
export const VALIDATORS = [
  "val_0xa1f3","val_0xb7e2","val_0xc9d4","val_0xd0f5",
  "val_0xe3a1","val_0xf2b8","val_0x1c9e","val_0x2d7f",
];

export const tc = s => TOKEN_COLORS[s] || TOKEN_COLORS.default;
export const sc = s => STATUS_COLORS[s] || "#64748b";

export const THEMES = {
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
    border: "rgba(255,255,255,0.07)",
    borderMuted: "rgba(255,255,255,0.05)",
    borderBtn: "rgba(255,255,255,0.06)",
    t1: "#e2e8f0", t2: "#94a3b8", t3: "#475569", t4: "#334155", t5: "#1e293b",
    dot: "rgba(255,255,255,0.03)",
    rfBg: "#030a1a",
    rfDot: "#1e293b",
    gBg: "radial-gradient(ellipse at 50% -10%, rgba(34,211,238,0.05) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(99,102,241,0.04) 0%, transparent 50%)",
  },
  light: {
    bg: "#f1f5f9",
    bgCard: "rgba(255,255,255,0.97)",
    bgPanel: "rgba(255,255,255,0.98)",
    bgPanelMid: "rgba(248,250,252,0.96)",
    bgHeader: "rgba(248,250,252,0.97)",
    bgBadge: "rgba(241,245,249,0.95)",
    bgInput: "rgba(0,0,0,0.04)",
    bgItem: "rgba(0,0,0,0.02)",
    bgBtn: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.1)",
    borderMuted: "rgba(0,0,0,0.06)",
    borderBtn: "rgba(0,0,0,0.08)",
    t1: "#0f172a", t2: "#334155", t3: "#475569", t4: "#64748b", t5: "#94a3b8",
    dot: "rgba(0,0,0,0.05)",
    rfBg: "#f1f5f9",
    rfDot: "#cbd5e1",
    gBg: "radial-gradient(ellipse at 50% -10%, rgba(34,211,238,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(99,102,241,0.08) 0%, transparent 50%)",
  },
};
