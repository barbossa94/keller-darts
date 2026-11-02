// X01 rules (used as 301). A game is a flat list of visits; all state is derived by replaying it,
// which makes undo trivial and keeps the stored data simple.
import { uid } from './db.js';

export const IMPOSSIBLE = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);
export const BOGEY_DO = new Set([159, 162, 163, 165, 166, 168, 169]);

export function newGame({ playerIds, start = 301, doubleOut = false, legsToWin = 1 }) {
  return { id: uid(), startedAt: Date.now(), finishedAt: null, start, doubleOut, legsToWin, playerIds, visits: [], winnerId: null };
}

// Replay all visits into the current state.
export function replay(game) {
  const ids = game.playerIds;
  const n = ids.length;
  const s = {
    leg: 0,
    legWins: Object.fromEntries(ids.map((id) => [id, 0])),
    remaining: Object.fromEntries(ids.map((id) => [id, game.start])),
    turn: 0,
    legs: [{ starter: 0, winnerId: null, visits: [] }],
    finished: false,
    winnerId: null,
  };
  for (const v of game.visits) {
    const leg = s.legs[s.leg];
    leg.visits.push(v);
    if (!v.bust) s.remaining[v.p] -= v.score;
    if (s.remaining[v.p] === 0) {
      leg.winnerId = v.p;
      s.legWins[v.p] += 1;
      if (s.legWins[v.p] >= game.legsToWin) {
        s.finished = true;
        s.winnerId = v.p;
        break;
      }
      s.leg += 1;
      const starter = s.leg % n;
      s.legs.push({ starter, winnerId: null, visits: [] });
      for (const id of ids) s.remaining[id] = game.start;
      s.turn = starter;
    } else {
      s.turn = (s.turn + 1) % n;
    }
  }
  s.current = ids[s.turn];
  return s;
}

export function isValidTotal(score) {
  return Number.isInteger(score) && score >= 0 && score <= 180 && !IMPOSSIBLE.has(score);
}

// Judge a 3-dart total against the remaining score.
// Returns { error } or { bust, checkout }.
export function judgeTotal(remaining, score, doubleOut) {
  if (!isValidTotal(score)) return { error: '{score} is not possible with 3 darts' };
  const after = remaining - score;
  if (after < 0 || (doubleOut && after === 1)) return { bust: true, checkout: false };
  if (after === 0) {
    if (doubleOut && (score > 170 || BOGEY_DO.has(score))) return { error: "{score} can't be finished on a double" };
    return { bust: false, checkout: true };
  }
  return { bust: false, checkout: false };
}

// Darts: { m: 1|2|3, n: 1..20 | 25 } (25 with m=2 is the bull).
export const dartValue = (d) => d.m * d.n;
export function dartLabel(d) {
  if (d.n === 0) return 'Miss';
  if (d.n === 25) return d.m === 2 ? 'Bull' : '25';
  return (d.m === 3 ? 'T' : d.m === 2 ? 'D' : '') + d.n;
}

// Judge a list of single darts (dart-by-dart input). Stops at bust or checkout.
export function judgeDarts(remaining, darts, doubleOut) {
  let rem = remaining;
  for (let i = 0; i < darts.length; i++) {
    const d = darts[i];
    rem -= dartValue(d);
    if (rem < 0 || (doubleOut && rem === 1)) return { bust: true, checkout: false, used: i + 1 };
    if (rem === 0) {
      if (doubleOut && d.m !== 2) return { bust: true, checkout: false, used: i + 1 };
      return { bust: false, checkout: true, used: i + 1 };
    }
  }
  return { bust: false, checkout: false, used: darts.length };
}

// Checkout suggestions.
const ALL = [];
for (let n = 20; n >= 1; n--) ALL.push({ m: 3, n });
ALL.push({ m: 1, n: 25 }, { m: 2, n: 25 });
for (let n = 20; n >= 1; n--) ALL.push({ m: 1, n });
for (let n = 20; n >= 1; n--) ALL.push({ m: 2, n });
const DOUBLE_PREF = [20, 16, 18, 12, 10, 8, 14, 19, 17, 15, 13, 11, 9, 6, 7, 5, 4, 3, 2, 1, 25].map((n) => ({ m: 2, n }));
const SETUP_RANK = new Map(ALL.map((d, i) => [dartLabel(d), i]));
const rank = (d) => SETUP_RANK.get(dartLabel(d)) ?? 99;
const memo = new Map();

export function suggest(remaining, dartsLeft = 3, doubleOut = false) {
  const key = `${remaining}|${dartsLeft}|${doubleOut}`;
  if (memo.has(key)) return memo.get(key);
  let best = null;
  const finals = doubleOut ? DOUBLE_PREF : ALL;
  const finalRank = (d) => (doubleOut ? DOUBLE_PREF.findIndex((x) => x.n === d.n) : rank(d));
  for (let k = 1; k <= dartsLeft && !best; k++) {
    let bestScore = Infinity;
    const visit = (prefix, sum, from) => {
      if (prefix.length === k - 1) {
        const need = remaining - sum;
        for (const f of finals) {
          if (dartValue(f) !== need) continue;
          const sc = prefix.reduce((a, d) => a + rank(d), 0) + finalRank(f);
          if (sc < bestScore) { bestScore = sc; best = [...prefix, f]; }
        }
        return;
      }
      for (let i = from; i < ALL.length; i++) {
        const d = ALL[i];
        if (sum + dartValue(d) >= remaining) continue;
        visit([...prefix, d], sum + dartValue(d), i);
      }
    };
    visit([], 0, 0);
  }
  memo.set(key, best);
  return best;
}

export const minDarts = (score, doubleOut) => (suggest(score, 3, doubleOut) || [0, 0, 0]).length;
