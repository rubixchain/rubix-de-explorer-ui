import { useTheme } from "../ThemeContext";

export default function Header({ transactions, confirmed, pending, selectedId, ancestorCount, onResetView }) {
  const { isDark, setIsDark, th } = useTheme();

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 54,
      background: th.bgHeader,
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${th.borderMuted}`,
      display: "flex", alignItems: "center", gap: 18,
      padding: "0 18px", zIndex: 10,
      transition: "background 0.3s",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 26, height: 26,
          background: "linear-gradient(135deg,#22d3ee,#0284c7)",
          borderRadius: 7, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 13,
          boxShadow: "0 0 12px rgba(34,211,238,0.4)",
        }}>◈</div>
        <div>
          <div style={{ color: th.t1, fontSize: 12, fontWeight: 700 }}>DAG Explorer</div>
        </div>
      </div>

      {/* Status pills */}
      {/* <div style={{ display: "flex", gap: 12 }}>
        {[["confirmed", "#22d3ee", confirmed], ["pending", "#f59e0b", pending]].map(([l, c, n]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}66` }} />
            <span style={{ color: th.t4, fontSize: 8 }}>{l}</span>
            <span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{n}</span>
          </div>
        ))}
      </div> */}

      {/* Selected indicator */}
      {selectedId && (
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 20, padding: "4px 14px",
        }}> 
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }} />
          {/* <span style={{ color: "#a78bfa", fontSize: 9 }}>{ancestorCount} ancestors · {selectedId.toUpperCase()}</span> */}
        </div>
      )}

      {/* Spacer */}
      <div style={{ marginLeft: "auto" }} />

      {/* Controls */}
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        <button onClick={onResetView} style={{ padding: "4px 10px", background: th.bgBtn, border: `1px solid ${th.borderBtn}`, borderRadius: 20, color: th.t3, fontSize: 13, cursor: "pointer", fontFamily: "monospace" }}>⌂</button>
        <button onClick={() => setIsDark(d => !d)} style={{ padding: "4px 10px", background: th.bgBtn, border: `1px solid ${th.borderBtn}`, borderRadius: 20, color: th.t3, fontSize: 13, cursor: "pointer", fontFamily: "monospace" }}>
          {isDark ? "☀" : "☾"}
        </button>
      </div>
    </div>
  );
}
