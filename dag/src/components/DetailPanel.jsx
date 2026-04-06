import { tc, sc } from "../constants";
import { useTheme } from "../ThemeContext";

export default function DetailPanel({ tx, ancestorCount, onClose }) {
  const { th } = useTheme();
  if (!tx) return null;
  const statusCol = sc(tx.status);

  return (
    <div style={{
      position: "absolute", right: 16, top: 70, width: 260,
      maxHeight: "calc(100vh - 90px)",
      background: th.bgPanel,
      border: `1px solid ${th.border}`,
      borderRadius: 12, padding: 18,
      backdropFilter: "blur(20px)",
      overflowY: "auto", zIndex: 100,
      fontFamily: "monospace",
      boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
      transition: "background 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ color: th.t4, fontSize: 8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Transaction</div>
          <div style={{ color: th.t1, fontSize: 13, fontWeight: 700 }}>{tx.id.toUpperCase()}</div>
          <div style={{ color: th.t5, fontSize: 9, marginTop: 2 }}>{tx.hash}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: th.t3, cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: statusCol + "15", border: `1px solid ${statusCol}35`, color: statusCol, fontSize: 9 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
          {tx.status}
        </div>
      </div>

      <div style={{ color: th.t4, fontSize: 8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>Assets</div>
      {tx.tokens.map((tok, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 10px", marginBottom: 4,
          background: th.bgItem,
          borderLeft: `2px solid ${tc(tok.symbol)}`,
          borderRadius: "0 6px 6px 0",
        }}>
          <div>
            <div style={{ color: tc(tok.symbol), fontSize: 10, fontWeight: 700 }}>{tok.symbol}</div>
            <div style={{ color: th.t5, fontSize: 8, marginTop: 1 }}>{tok.prevTxId ? `↓ ${tok.prevTxId}` : "genesis"}</div>
          </div>
          <div style={{ color: th.t2, fontSize: 10 }}>{tok.amount}</div>
        </div>
      ))}

      <div style={{ marginTop: 10, padding: "7px 10px", background: th.bgItem, borderRadius: 6 }}>
        <div style={{ color: th.t4, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }}>Validator</div>
        <div style={{ color: "#22d3ee", fontSize: 10, marginTop: 2 }}>{tx.validator}</div>
      </div>

      <button onClick={onClose} style={{
        width: "100%", marginTop: 14, padding: "8px",
        background: "rgba(34,211,238,0.06)",
        border: "1px solid rgba(34,211,238,0.2)",
        borderRadius: 7, color: "#22d3ee",
        fontSize: 10, cursor: "pointer",
        fontFamily: "monospace", letterSpacing: 1,
      }}>
        CLEAR SELECTION
      </button>
    </div>
  );
}

