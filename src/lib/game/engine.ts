import {
  ActiveEffect,
  Charter,
  Decisions,
  FinalReport,
  GameState,
  RoundRecord,
} from './types';
import * as C from './constants';

// Deterministic LCG so a game can be replayed from its seed.
function nextRng(state: number): { value: number; state: number } {
  const next = (state * 1664525 + 1013904223) % 4294967296;
  return { value: next / 4294967296, state: next };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

let idCounter = 0;
function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.floor(Math.random() * 1e6)}`;
}

/** Effective demand modifier from all active effects */
function demandModifier(effects: ActiveEffect[]): number {
  return effects.reduce((m, e) => m * e.demandEffect, 1);
}

/** Effective capacity modifier from all active effects */
function capacityModifier(effects: ActiveEffect[]): number {
  return effects.reduce((m, e) => m * e.capacityEffect, 1);
}

/** Ships available to carry cargo in a given round */
export function activeCharters(state: GameState, round: number): Charter[] {
  return state.charters.filter(
    (c) =>
      c.activeFromRound <= round &&
      (c.redeliverAfterRound === undefined || c.redeliverAfterRound >= round),
  );
}

/** Player nominal capacity in TEU for a round (before event modifiers) */
export function playerNominalCapacity(state: GameState, round: number): number {
  return (state.ownedShips + activeCharters(state, round).length) * C.SHIP_CAPACITY;
}

/** Charter market rate given how tight the industry is */
function charterRateFor(demand: number, industryCapacity: number): number {
  const tightness =
    demand / Math.max(industryCapacity, 1) / C.COMPETITOR_TARGET_UTILIZATION;
  // Charter hire reacts violently to tightness — the pain of chasing a boom.
  const rate = C.BASE_CHARTER_RATE * Math.pow(tightness, 3);
  return clamp(rate, C.BASE_CHARTER_RATE * 0.5, C.BASE_CHARTER_RATE * 3);
}

function marketRateFor(demand: number, industryCapacity: number): number {
  // Normalized so the rate sits at BASE_FREIGHT_RATE when the industry runs
  // at its target utilization, spiking when tight and collapsing when overbuilt.
  const balance =
    demand / Math.max(industryCapacity, 1) / C.COMPETITOR_TARGET_UTILIZATION;
  const rate = C.BASE_FREIGHT_RATE * Math.pow(balance, C.RATE_SUPPLY_ELASTICITY);
  return clamp(rate, C.MIN_FREIGHT_RATE, C.MAX_FREIGHT_RATE);
}

export function createInitialState(seed?: number): GameState {
  let rngState = seed ?? Math.floor(Math.random() * 4294967296);
  // burn a few values so small seeds diverge
  for (let i = 0; i < 3; i++) rngState = nextRng(rngState).state;

  const initialCharters: Charter[] = Array.from(
    { length: C.STARTING_CHARTERS },
    () => ({
      id: makeId('charter'),
      hirePerRound: C.BASE_CHARTER_RATE,
      activeFromRound: 1,
      minEndRound: C.CHARTER_MIN_COMMITMENT,
    }),
  );

  const playerCapacity =
    (C.STARTING_OWNED_SHIPS + C.STARTING_CHARTERS) * C.SHIP_CAPACITY;
  const competitorCapacity =
    C.BASE_DEMAND / C.COMPETITOR_TARGET_UTILIZATION - playerCapacity;

  const state: GameState = {
    status: 'playing',
    round: 1,
    totalRounds: C.TOTAL_ROUNDS,
    cash: C.STARTING_CASH,
    startingCash: C.STARTING_CASH,
    ownedShips: C.STARTING_OWNED_SHIPS,
    charters: initialCharters,
    newbuildOrders: [],
    customerLoyalty: 1,
    market: {
      baseDemand: C.BASE_DEMAND,
      demand: C.BASE_DEMAND,
      competitorCapacity,
      marketRate: C.BASE_FREIGHT_RATE,
      charterRate: C.BASE_CHARTER_RATE,
      demandMemory: Array(C.COMPETITOR_LAG).fill(C.BASE_DEMAND),
    },
    activeEffects: [],
    currentEvent: null,
    history: [],
    news: [
      {
        round: 1,
        headline: 'You take the helm of Blue Anchor Line',
        detail: `You run ${C.STARTING_OWNED_SHIPS} owned ships and ${C.STARTING_CHARTERS} chartered ships on the Asia–Europe trade. Set your rate, watch the market, and grow carefully — every capacity move takes time to arrive.`,
        tone: 'neutral',
      },
    ],
    rngState,
  };

  return state;
}

/**
 * Resolve one round: apply the player's decisions, simulate the market,
 * move cargo and money, then advance to the next round.
 */
export function playRound(state: GameState, decisions: Decisions): GameState {
  if (state.status !== 'playing') return state;

  const s: GameState = {
    ...state,
    charters: state.charters.map((c) => ({ ...c })),
    newbuildOrders: state.newbuildOrders.map((o) => ({ ...o })),
    activeEffects: state.activeEffects.map((e) => ({ ...e })),
    market: { ...state.market, demandMemory: [...state.market.demandMemory] },
    history: [...state.history],
    news: [...state.news],
  };
  const round = s.round;
  const news: GameState['news'] = [];

  // --- 1. Player capacity decisions (effects arrive with a delay) ---
  for (let i = 0; i < decisions.charterIn; i++) {
    s.charters.push({
      id: makeId('charter'),
      hirePerRound: s.market.charterRate,
      activeFromRound: round + C.CHARTER_ARRIVAL_DELAY,
      minEndRound: round + C.CHARTER_ARRIVAL_DELAY + C.CHARTER_MIN_COMMITMENT - 1,
    });
  }
  if (decisions.charterIn > 0) {
    news.push({
      round,
      headline: `Chartered in ${decisions.charterIn} ship${decisions.charterIn > 1 ? 's' : ''}`,
      detail: `Hire fixed at $${(s.market.charterRate / 1e6).toFixed(1)}M per ship per round. The tonnage phases in next round.`,
      tone: 'neutral',
    });
  }

  for (const id of decisions.redeliverIds) {
    const charter = s.charters.find((c) => c.id === id);
    if (charter && charter.redeliverAfterRound === undefined) {
      charter.redeliverAfterRound = Math.max(round, charter.minEndRound);
    }
  }

  for (let i = 0; i < decisions.orderNewbuilds; i++) {
    s.newbuildOrders.push({
      id: makeId('newbuild'),
      arrivesRound: round + C.NEWBUILD_DELAY,
      installmentsLeft: C.NEWBUILD_INSTALLMENTS,
      installmentAmount: C.NEWBUILD_PRICE / C.NEWBUILD_INSTALLMENTS,
    });
  }
  if (decisions.orderNewbuilds > 0) {
    news.push({
      round,
      headline: `Ordered ${decisions.orderNewbuilds} newbuild${decisions.orderNewbuilds > 1 ? 's' : ''}`,
      detail: `Delivery in ${C.NEWBUILD_DELAY} rounds. The yard price of $${(C.NEWBUILD_PRICE / 1e6).toFixed(0)}M per ship is paid over ${C.NEWBUILD_INSTALLMENTS} rounds.`,
      tone: 'neutral',
    });
  }

  // --- 2. Scripted event for this round ---
  const event = C.SCRIPTED_EVENTS.find((e) => e.round === round) ?? null;
  if (event) {
    s.activeEffects.push({
      demandEffect: event.demandEffect ?? 1,
      capacityEffect: event.capacityEffect ?? 1,
      roundsLeft: event.duration ?? 1,
      headline: event.headline,
    });
    news.push({
      round,
      headline: event.headline,
      detail: event.detail,
      tone: event.tone,
    });
  }

  // --- 3. Market demand: trend + season + noise + events ---
  let rng = nextRng(s.rngState);
  const noise = 1 + (rng.value - 0.5) * 0.08;
  rng = nextRng(rng.state);
  const season = 1 + 0.06 * Math.sin(((round - 2) / 12) * 2 * Math.PI);
  const trend = 1 + 0.012 * round; // structural trade growth, ~+30% over the game
  s.market.baseDemand = C.BASE_DEMAND * trend * season * noise;
  const demand = s.market.baseDemand * demandModifier(s.activeEffects);

  // --- 4. Competitors adjust capacity toward lagged demand (the systemic bullwhip) ---
  const laggedDemand = s.market.demandMemory[0];
  const playerNominal = playerNominalCapacity(s, round);
  const competitorTarget =
    laggedDemand / C.COMPETITOR_TARGET_UTILIZATION - playerNominal;
  s.market.competitorCapacity +=
    (competitorTarget - s.market.competitorCapacity) * C.COMPETITOR_ADJUST_SPEED;
  s.market.competitorCapacity = Math.max(s.market.competitorCapacity, C.BASE_DEMAND * 0.4);
  s.market.demandMemory = [...s.market.demandMemory.slice(1), demand];

  // --- 5. Effective capacities and market pricing ---
  const capMod = capacityModifier(s.activeEffects);
  const playerCapacity = playerNominal * capMod;
  const industryCapacity = (s.market.competitorCapacity + playerNominal) * capMod;
  const marketRate = marketRateFor(demand, industryCapacity);
  // smooth the published market rate so pricing a round ahead is a judgment
  // call, not a coin flip
  s.market.marketRate = s.market.marketRate * 0.6 + marketRate * 0.4;
  s.market.charterRate = charterRateFor(demand, industryCapacity);
  s.market.demand = demand;

  // --- 6. Player bookings: price and loyalty drive share ---
  const rate = clamp(decisions.freightRate, C.MIN_FREIGHT_RATE, C.MAX_FREIGHT_RATE);
  const priceFactor = clamp(
    Math.pow(s.market.marketRate / rate, C.PRICE_ELASTICITY),
    0.25,
    1.8,
  );
  const bookedCargo = demand * C.BASE_MARKET_SHARE * s.customerLoyalty * priceFactor;
  const liftedCargo = Math.min(bookedCargo, playerCapacity);
  const rolledCargo = Math.max(0, bookedCargo - liftedCargo);
  const utilization = playerCapacity > 0 ? liftedCargo / playerCapacity : 0;

  // --- 7. Loyalty: rolling cargo bleeds future bookings ---
  if (rolledCargo > 0 && bookedCargo > 0) {
    const rollShare = rolledCargo / bookedCargo;
    s.customerLoyalty -= Math.min(
      rollShare * C.LOYALTY_ROLL_SENSITIVITY,
      C.LOYALTY_MAX_HIT_PER_ROUND,
    );
    if (rollShare > 0.15) {
      news.push({
        round,
        headline: 'Customers are furious about rolled cargo',
        detail: `You turned away ${Math.round(rollShare * 100)}% of your bookings this round. Shippers are moving volumes to carriers who can actually lift them.`,
        tone: 'negative',
      });
    }
  } else {
    s.customerLoyalty += C.LOYALTY_RECOVERY;
  }
  s.customerLoyalty = clamp(s.customerLoyalty, C.MIN_LOYALTY, C.MAX_LOYALTY);

  // --- 8. Money ---
  const revenue = liftedCargo * rate;
  const charterCost = activeCharters(s, round).reduce((sum, c) => sum + c.hirePerRound, 0);
  const opexCost = s.ownedShips * C.OWNED_SHIP_OPEX;
  const handlingCost = liftedCargo * C.HANDLING_COST_PER_TEU;
  const rollPenalty = rolledCargo * C.ROLLED_CARGO_PENALTY_PER_TEU;
  let newbuildCost = 0;
  for (const order of s.newbuildOrders) {
    if (order.installmentsLeft > 0) {
      newbuildCost += order.installmentAmount;
      order.installmentsLeft -= 1;
    }
  }
  const costs = charterCost + opexCost + handlingCost + newbuildCost + rollPenalty;
  const profit = revenue - costs;
  s.cash += profit;

  // --- 9. Record history ---
  const record: RoundRecord = {
    round,
    demand,
    industryCapacity,
    marketRate: s.market.marketRate,
    playerRate: rate,
    playerCapacity,
    bookedCargo,
    liftedCargo,
    rolledCargo,
    utilization,
    revenue,
    costs,
    profit,
    cash: s.cash,
    customerLoyalty: s.customerLoyalty,
    charterMarketRate: s.market.charterRate,
    fleetOwned: s.ownedShips,
    fleetChartered: activeCharters(s, round).length,
  };
  s.history.push(record);

  // --- 10. Housekeeping: deliveries, redeliveries, effect expiry ---
  const deliveries = s.newbuildOrders.filter((o) => o.arrivesRound === round + 1);
  if (deliveries.length > 0) {
    s.ownedShips += deliveries.length;
    news.push({
      round: round + 1,
      headline: `${deliveries.length} newbuild${deliveries.length > 1 ? 's' : ''} delivered`,
      detail: 'Fresh tonnage joins your owned fleet and starts carrying cargo immediately.',
      tone: 'positive',
    });
  }
  s.newbuildOrders = s.newbuildOrders.filter(
    (o) => o.arrivesRound > round + 1 || o.installmentsLeft > 0,
  );
  s.charters = s.charters.filter(
    (c) => c.redeliverAfterRound === undefined || c.redeliverAfterRound > round,
  );
  s.activeEffects = s.activeEffects
    .map((e) => ({ ...e, roundsLeft: e.roundsLeft - 1 }))
    .filter((e) => e.roundsLeft > 0);

  s.news = [...s.news, ...news];
  s.rngState = rng.state;
  s.currentEvent = C.SCRIPTED_EVENTS.find((e) => e.round === round + 1) ?? null;

  // --- 11. End conditions ---
  if (s.cash < C.BANKRUPTCY_FLOOR) {
    s.status = 'bankrupt';
  } else if (round >= s.totalRounds) {
    s.status = 'finished';
  } else {
    s.round = round + 1;
  }

  return s;
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length,
  );
}

export function buildFinalReport(state: GameState): FinalReport {
  const h = state.history;
  const totalProfit = state.cash - state.startingCash;
  const avgUtilization =
    h.length > 0 ? h.reduce((s, r) => s + r.utilization, 0) / h.length : 0;
  const totalBooked = h.reduce((s, r) => s + r.bookedCargo, 0);
  const totalLifted = h.reduce((s, r) => s + r.liftedCargo, 0);
  const serviceLevel = totalBooked > 0 ? totalLifted / totalBooked : 1;

  // Bullwhip: how much more volatile were your capacity swings than demand swings?
  const demandChanges = h.slice(1).map((r, i) => (r.demand - h[i].demand) / h[i].demand);
  const capacityChanges = h
    .slice(1)
    .map((r, i) =>
      h[i].playerCapacity > 0
        ? (r.playerCapacity - h[i].playerCapacity) / h[i].playerCapacity
        : 0,
    );
  const demandVol = stddev(demandChanges);
  const bullwhipRatio = demandVol > 0 ? stddev(capacityChanges) / demandVol : 0;

  let grade: FinalReport['grade'];
  if (state.status === 'bankrupt') {
    grade = {
      label: 'Bankrupt',
      comment:
        'The line ran out of cash. In shipping, chasing a boom with expensive tonnage right before the bust is the classic way to go under.',
    };
  } else if (totalProfit > 500_000_000 && serviceLevel > 0.84) {
    grade = {
      label: 'Master of the Trade',
      comment:
        'Strong profits and reliable service — you rode the cycle instead of being ridden by it.',
    };
  } else if (totalProfit > 200_000_000) {
    grade = {
      label: 'Seasoned Operator',
      comment:
        'Solidly profitable. Check the charts: could smoother capacity moves have captured more of the boom or dodged more of the bust?',
    };
  } else if (totalProfit > 0) {
    grade = {
      label: 'Survivor',
      comment:
        'You kept the line afloat, which is more than many real carriers manage across a full cycle.',
    };
  } else {
    grade = {
      label: 'Cycle Casualty',
      comment:
        'The market cycle won this time. Look at where your capacity peaked versus where demand peaked — that gap is the bullwhip effect.',
    };
  }

  return { totalProfit, avgUtilization, serviceLevel, bullwhipRatio, grade };
}
