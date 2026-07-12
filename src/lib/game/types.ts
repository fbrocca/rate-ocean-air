// Core types for Box & Bust — a turn-based container shipping game about
// making capacity and pricing decisions under lead times and volatile demand.

export type ShipSource = 'owned' | 'charter';

export interface Charter {
  id: string;
  /** Hire cost in USD per round, locked in at signing */
  hirePerRound: number;
  /** Round the ship becomes available to carry cargo */
  activeFromRound: number;
  /** Earliest round the charter can be redelivered (minimum commitment) */
  minEndRound: number;
  /** Set when the player has requested redelivery; ship leaves after this round */
  redeliverAfterRound?: number;
}

export interface NewbuildOrder {
  id: string;
  /** Round the vessel delivers and joins the owned fleet */
  arrivesRound: number;
  /** Remaining installments of the purchase price, paid one per round */
  installmentsLeft: number;
  installmentAmount: number;
}

export interface GameEvent {
  round: number;
  headline: string;
  detail: string;
  /** Multiplier applied to market demand while active */
  demandEffect?: number;
  /** Multiplier applied to everyone's effective capacity while active */
  capacityEffect?: number;
  /** How many rounds the effect lasts */
  duration?: number;
  tone: 'positive' | 'negative' | 'neutral';
}

export interface RoundRecord {
  round: number;
  demand: number; // total market demand, TEU
  industryCapacity: number; // total industry effective capacity, TEU
  marketRate: number; // $/TEU
  playerRate: number; // $/TEU
  playerCapacity: number; // TEU
  bookedCargo: number; // TEU customers wanted to ship with the player
  liftedCargo: number; // TEU actually carried
  rolledCargo: number; // TEU turned away
  utilization: number; // 0..1
  revenue: number;
  costs: number;
  profit: number;
  cash: number;
  customerLoyalty: number; // 0..1.25 demand-share multiplier
  charterMarketRate: number; // $/round for a new charter this round
  fleetOwned: number;
  fleetChartered: number;
}

export interface MarketState {
  /** Demand before event modifiers, follows the underlying trend */
  baseDemand: number;
  demand: number;
  /** Competitors' capacity (excludes player) */
  competitorCapacity: number;
  marketRate: number;
  /** Cost per round to charter in one ship right now */
  charterRate: number;
  /** Demand levels competitors observed (they react with a lag) */
  demandMemory: number[];
}

export interface ActiveEffect {
  demandEffect: number;
  capacityEffect: number;
  roundsLeft: number;
  headline: string;
}

export interface GameState {
  status: 'setup' | 'playing' | 'finished' | 'bankrupt';
  round: number;
  totalRounds: number;
  cash: number;
  startingCash: number;
  ownedShips: number;
  charters: Charter[];
  newbuildOrders: NewbuildOrder[];
  customerLoyalty: number;
  market: MarketState;
  activeEffects: ActiveEffect[];
  /** Event revealed at the start of the current round, if any */
  currentEvent: GameEvent | null;
  history: RoundRecord[];
  news: { round: number; headline: string; detail: string; tone: GameEvent['tone'] }[];
  rngState: number;
}

export interface Decisions {
  /** Player freight rate for the round, $/TEU */
  freightRate: number;
  /** Ships to charter in (arrive next round) */
  charterIn: number;
  /** Charter IDs to redeliver at the end of their commitment */
  redeliverIds: string[];
  /** Newbuild vessels to order (arrive after the construction delay) */
  orderNewbuilds: number;
}

export interface FinalReport {
  totalProfit: number;
  avgUtilization: number;
  serviceLevel: number; // share of booked cargo actually lifted
  bullwhipRatio: number; // volatility of player capacity vs volatility of demand
  grade: { label: string; comment: string };
}
