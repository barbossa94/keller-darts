// All statistics are computed from finished games, so new stats never need a data migration.
import { replay } from './x01.js';

// Bayesian weight: how many legs of "house average" a new player starts with.
export const PRIOR_LEGS = 5;
export const ROOKIE_LEGS = 3;

const avg3 = (points, darts) => (darts ? (points / darts) * 3 : 0);

function blank(id) {
  return {
    id, games: 0, wins: 0, legs: 0, legWins: 0, points: 0, darts: 0,
    bestVisit: 0, bestVisitAt: 0, bestCheckout: 0, bestCheckoutAt: 0,
    bestGameAvg: 0, bestGameAvgAt: 0,
    ton: 0, ton40: 0, max: 0, busts: 0,
    streak: 0, bestStreak: 0,
    history: [], // [{ at, avg, won }]
    vs: {}, // opponentId -> { played, won }
  };
}

export function compute(games, { since = 0 } = {}) {
  const per = new Map();
  const get = (id) => per.get(id) || (per.set(id, blank(id)), per.get(id));
  let housePoints = 0;
  let houseDarts = 0;

  for (const g of games) {
    if (!g.finishedAt || g.startedAt < since) continue;
    const state = replay(g);
    const gp = {};
    for (const id of g.playerIds) gp[id] = { points: 0, darts: 0 };

    state.legs.forEach((leg) => {
      for (const id of g.playerIds) if (leg.visits.length) get(id).legs += 1;
      if (leg.winnerId) get(leg.winnerId).legWins += 1;
      for (const v of leg.visits) {
        const s = get(v.p);
        const pts = v.bust ? 0 : v.score;
        s.points += pts; s.darts += v.darts;
        gp[v.p].points += pts; gp[v.p].darts += v.darts;
        housePoints += pts; houseDarts += v.darts;
        if (v.bust) s.busts += 1;
        if (pts >= 100) s.ton += 1;
        if (pts >= 140) s.ton40 += 1;
        if (pts === 180) s.max += 1;
        if (pts > s.bestVisit) { s.bestVisit = pts; s.bestVisitAt = v.t || g.startedAt; }
        if (v.checkout && pts > s.bestCheckout) { s.bestCheckout = pts; s.bestCheckoutAt = v.t || g.startedAt; }
      }
    });

    for (const id of g.playerIds) {
      const s = get(id);
      const won = g.winnerId === id;
      const a = avg3(gp[id].points, gp[id].darts);
      s.games += 1;
      if (won) { s.wins += 1; s.streak += 1; s.bestStreak = Math.max(s.bestStreak, s.streak); }
      else if (g.playerIds.length > 1) s.streak = 0;
      if (gp[id].darts >= 9 && a > s.bestGameAvg) { s.bestGameAvg = a; s.bestGameAvgAt = g.finishedAt; }
      s.history.push({ at: g.finishedAt, avg: a, won });
      for (const o of g.playerIds) {
        if (o === id) continue;
        const r = s.vs[o] || (s.vs[o] = { played: 0, won: 0 });
        r.played += 1;
        if (won) r.won += 1;
      }
    }
  }

  const houseAvg = avg3(housePoints, houseDarts);
  for (const s of per.values()) {
    s.avg = avg3(s.points, s.darts);
    s.winRate = s.games ? s.wins / s.games : 0;
    // Fair rating: blend the player's average with the house average, weighted by legs played.
    s.rating = s.legs ? (s.legs * s.avg + PRIOR_LEGS * houseAvg) / (s.legs + PRIOR_LEGS) : 0;
    s.rookie = s.legs < ROOKIE_LEGS;
  }
  return { per, houseAvg, totalDarts: houseDarts, totalGames: games.filter((g) => g.finishedAt && g.startedAt >= since).length };
}

// Ranking order: established players first, rookies after them, each by rating.
export const byRanking = (a, b) => a.rookie - b.rookie || b.rating - a.rating;

// All-time records across everybody.
export function records(per) {
  const list = [...per.values()];
  const top = (key, atKey) => {
    let best = null;
    for (const s of list) if (s[key] > 0 && (!best || s[key] > best[key])) best = s;
    return best ? { id: best.id, value: best[key], at: atKey ? best[atKey] : 0 } : null;
  };
  return {
    bestVisit: top('bestVisit', 'bestVisitAt'),
    bestCheckout: top('bestCheckout', 'bestCheckoutAt'),
    bestGameAvg: top('bestGameAvg', 'bestGameAvgAt'),
    most180: top('max'),
    bestStreak: top('bestStreak'),
    mostGames: top('games'),
  };
}

// Live per-game numbers for the scoring screen.
export function gameLive(game, state, id) {
  let points = 0, darts = 0;
  for (const v of game.visits) if (v.p === id) { points += v.bust ? 0 : v.score; darts += v.darts; }
  const legVisits = state.legs[state.leg]?.visits.filter((v) => v.p === id) || [];
  return { avg: avg3(points, darts), darts, last: legVisits.slice(-3) };
}

export const fmt1 = (x) => (x ? x.toFixed(1) : '0.0');
