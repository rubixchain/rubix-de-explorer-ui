import { TOKENS, VALIDATORS } from "./constants";

const MAX_PER_LAYER = 10;

const randTokens = n => [...TOKENS].sort(() => Math.random() - 0.5).slice(0, n);

export function generateDAG(target = 200) {
  let ctr = 0;
  const mkId = () => `tx_${String(++ctr).padStart(4, "0")}`;
  const mkHash = () => "0x" + Math.random().toString(16).slice(2, 10);

  const layerSizes = [1, 5];
  let total = 6, prev = 5;
  while (total < target) {
    const raw = Math.min(Math.ceil(prev * 1.8), MAX_PER_LAYER);
    const next = Math.min(raw, target - total);
    if (next <= 0) break;
    layerSizes.push(next); total += next; prev = next;
  }

  const layerTxns = layerSizes.map((size, li) =>
    Array.from({ length: size }, () => ({
      id: mkId(), hash: mkHash(),
      timestamp: Date.now() / 1000 - li * 30 - Math.random() * 20,
      tokens: [], status: li === 0 ? "pending" : "confirmed",
      validator: VALIDATORS[Math.floor(Math.random() * VALIDATORS.length)],
      layer: li,
    }))
  );

  for (let li = 0; li < layerTxns.length - 1; li++) {
    const cur = layerTxns[li], nxt = layerTxns[li + 1];
    cur.forEach(tx => {
      const np = Math.min(li === 0 ? 5 : li === 1 ? 4 : Math.floor(Math.random() * 3) + 1, nxt.length);
      const parents = [...nxt].sort(() => Math.random() - 0.5).slice(0, np);
      const toks = randTokens(np);
      tx.tokens = parents.map((p, i) => ({ symbol: toks[i], amount: +(Math.random() * 10).toFixed(3), prevTxId: p.id }));
    });
  }

  layerTxns[layerTxns.length - 1].forEach(tx => {
    if (!tx.tokens.length)
      tx.tokens = randTokens(Math.floor(Math.random() * 2) + 1).map(s => ({
        symbol: s, amount: +(Math.random() * 100).toFixed(2), prevTxId: null,
      }));
  });

  return layerTxns.flat();
}

export function getAllAncestors(txId, txMap) {
  const visited = new Set(), queue = [txId];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const tx = txMap[id]; if (!tx) continue;
    tx.tokens.forEach(tok => { if (tok.prevTxId) queue.push(tok.prevTxId); });
  }
  return visited;
}
