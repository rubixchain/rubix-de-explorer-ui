import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { tc, sc, NODE_W, NODE_H } from "../constants";
import { useTheme } from "../ThemeContext";

function TxNode({ data, selected }) {
  const { isDark, th } = useTheme();
  const { tx, isAncestor, dimmed } = data;
  const statusCol = sc(tx.status);
  const tokenCol = tx.tokens[0] ? tc(tx.tokens[0].symbol) : "#22d3ee";
  const isActive = selected || data.isHoverAncestor;

  const borderCol = selected
    ? statusCol
    : isAncestor
    ? "rgba(34,211,238,0.5)"
    : th.border;

  const shadow = selected
    ? `0 0 0 1.5px ${statusCol}55, 0 0 24px ${statusCol}33, 0 0 44px ${tokenCol}18`
    : isAncestor
    ? `0 0 0 1px rgba(34,211,238,0.4), 0 0 14px rgba(34,211,238,0.2)`
    : `0 2px 8px rgba(0,0,0,0.18)`;

  return (
    <div style={{ width: NODE_W, height: NODE_H, position: "relative" }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />

      <div style={{
        width: "100%", height: "100%",
        background: isActive
          ? `linear-gradient(135deg, ${tokenCol}12 0%, ${th.bgCard} 100%)`
          : th.bgCard,
        border: `1px solid ${borderCol}`,
        borderTop: `2.5px solid ${statusCol}`,
        borderRadius: 8,
        overflow: "hidden",
        opacity: dimmed ? 0.1 : 1,
        boxShadow: shadow,
        transition: "opacity 0.2s, box-shadow 0.2s, border-color 0.2s",
        cursor: "pointer",
        position: "relative",
      }}>
        {isActive && (
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${tokenCol}18 0%, transparent 65%)`,
            pointerEvents: "none",
          }} />
        )}
        <div style={{ padding: "8px 10px 7px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: th.t5, fontSize: 9, fontFamily: "monospace" }}>{tx.hash}</span>
            <span style={{ color: statusCol, fontSize: 8, fontFamily: "monospace" }}>● {tx.status}</span>
          </div>
          <div style={{
            color: isActive ? (isDark ? "#fff" : "#0f172a") : th.t1,
            fontSize: 11, fontWeight: 700, fontFamily: "monospace",
            textShadow: isActive ? `0 0 14px ${tokenCol}88` : "none",
          }}>
            {tx.id.toUpperCase()}
          </div>
          {tx.tokens.length > 0 && (
            <div style={{ display: "flex", gap: 3, marginTop: 5, flexWrap: "wrap" }}>
              {tx.tokens.slice(0, 4).map((tok, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: tc(tok.symbol),
                  boxShadow: isActive ? `0 0 4px ${tc(tok.symbol)}` : "none",
                }} />
              ))}
              {tx.tokens.length > 4 && (
                <span style={{ color: th.t4, fontSize: 7, lineHeight: "6px" }}>+{tx.tokens.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

export default memo(TxNode);
