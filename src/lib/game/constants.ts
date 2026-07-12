import { GameEvent } from './types';

export const TOTAL_ROUNDS = 24;

/** TEU one ship can carry per round */
export const SHIP_CAPACITY = 10000;

export const STARTING_CASH = 150_000_000;
export const STARTING_OWNED_SHIPS = 4;
export const STARTING_CHARTERS = 2;

/** Base market demand, TEU per round */
export const BASE_DEMAND = 400_000;
/** Player's fair share of the market at market rate with neutral loyalty */
export const BASE_MARKET_SHARE = 0.15;

export const BASE_FREIGHT_RATE = 1500; // $/TEU
export const MIN_FREIGHT_RATE = 500;
export const MAX_FREIGHT_RATE = 6000;

/** How strongly the supply/demand balance moves the market rate */
export const RATE_SUPPLY_ELASTICITY = 2.2;
/** How strongly the player's price vs market moves their cargo share */
export const PRICE_ELASTICITY = 2.2;

export const OWNED_SHIP_OPEX = 7_000_000; // $/round, crew + fuel + port calls
export const HANDLING_COST_PER_TEU = 300; // terminal handling both ends
/** Compensation and re-booking cost for every TEU you accept but cannot lift */
export const ROLLED_CARGO_PENALTY_PER_TEU = 500;

export const BASE_CHARTER_RATE = 8_500_000; // $/round in a balanced market
export const CHARTER_MIN_COMMITMENT = 4; // rounds
export const CHARTER_ARRIVAL_DELAY = 1; // rounds until a chartered ship carries cargo

// Kept low enough that a well-timed order pays back within the game horizon
// (think of it as the residual value staying with the line after round 24).
export const NEWBUILD_PRICE = 60_000_000;
export const NEWBUILD_DELAY = 6; // rounds until delivery
export const NEWBUILD_INSTALLMENTS = 10; // price is spread over this many rounds

/** Competitors adjust capacity toward demand observed this many rounds ago */
export const COMPETITOR_LAG = 3;
/** Fraction of the capacity gap competitors close each round */
export const COMPETITOR_ADJUST_SPEED = 0.25;
/** Competitors aim for this utilization */
export const COMPETITOR_TARGET_UTILIZATION = 0.92;

/** Loyalty lost per 100% of booked cargo rolled */
export const LOYALTY_ROLL_SENSITIVITY = 0.5;
/** Worst loyalty hit a single round can inflict */
export const LOYALTY_MAX_HIT_PER_ROUND = 0.12;
/** Loyalty recovered per clean round */
export const LOYALTY_RECOVERY = 0.04;
export const MIN_LOYALTY = 0.5;
export const MAX_LOYALTY = 1.25;

/** Game over if cash drops below this */
export const BANKRUPTCY_FLOOR = -50_000_000;

/**
 * Scripted market shocks. Rounds are 1-based. Between these, demand also
 * carries seasonal swing and random noise, so no two games play identically.
 */
export const SCRIPTED_EVENTS: GameEvent[] = [
  {
    round: 3,
    headline: 'Peak season starts early',
    detail:
      'Retailers frontload inventory ahead of the holidays. Spot demand jumps across the lane.',
    demandEffect: 1.18,
    duration: 3,
    tone: 'positive',
  },
  {
    round: 7,
    headline: 'Consumer boom lifts imports',
    detail:
      'A stimulus-fuelled buying spree sends container demand to record highs. Every carrier is scrambling for tonnage — charter rates are exploding.',
    demandEffect: 1.35,
    duration: 4,
    tone: 'positive',
  },
  {
    round: 11,
    headline: 'Port congestion snarls the network',
    detail:
      'Ships queue for berths at both ends of the trade. Effective capacity drops for everyone while the backlog clears.',
    capacityEffect: 0.8,
    duration: 3,
    tone: 'negative',
  },
  {
    round: 15,
    headline: 'Demand cools sharply',
    detail:
      'Warehouses are full and consumers shift spending to services. Bookings fall off a cliff just as new tonnage floods the market.',
    demandEffect: 0.75,
    duration: 4,
    tone: 'negative',
  },
  {
    round: 20,
    headline: 'Canal disruption reroutes services',
    detail:
      'A major waterway closes to traffic. Diversions soak up capacity industry-wide and rates firm.',
    capacityEffect: 0.85,
    duration: 3,
    tone: 'neutral',
  },
];
