import React, { useCallback, useEffect, useState } from 'react';
import { Ship } from 'lucide-react';
import Header from '@/components/Header';
import StatusBar from '@/components/game/StatusBar';
import MarketPanel from '@/components/game/MarketPanel';
import DecisionPanel from '@/components/game/DecisionPanel';
import HistoryCharts from '@/components/game/HistoryCharts';
import GameOverPanel from '@/components/game/GameOverPanel';
import HowToPlay from '@/components/game/HowToPlay';
import { createInitialState, playRound } from '@/lib/game/engine';
import { Decisions, GameState } from '@/lib/game/types';
import { fmtMoney, fmtTeu } from '@/lib/game/format';

const STORAGE_KEY = 'box-and-bust-state-v1';

function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed && typeof parsed.round === 'number' && Array.isArray(parsed.history)) {
      return parsed;
    }
  } catch {
    // corrupted save — start fresh
  }
  return null;
}

function defaultDecisions(state: GameState): Decisions {
  return {
    freightRate: Math.round(state.market.marketRate / 50) * 50,
    charterIn: 0,
    redeliverIds: [],
    orderNewbuilds: 0,
  };
}

const GamePage: React.FC = () => {
  const [state, setState] = useState<GameState>(() => loadSavedState() ?? createInitialState());
  const [decisions, setDecisions] = useState<Decisions>(() => defaultDecisions(state));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — game still playable, just not persisted
    }
  }, [state]);

  const handleCommit = useCallback(() => {
    const next = playRound(state, decisions);
    setState(next);
    setDecisions(defaultDecisions(next));
  }, [state, decisions]);

  const handleRestart = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    setDecisions(defaultDecisions(fresh));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const last = state.history[state.history.length - 1];
  const gameOver = state.status === 'finished' || state.status === 'bankrupt';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Ship className="h-6 w-6 text-ocean" /> Box & Bust
            </h1>
            <p className="text-sm text-gray-600">
              Take the helm of a container line and steer it through a full
              boom-and-bust market cycle.
            </p>
          </div>
          <HowToPlay />
        </div>

        {gameOver ? (
          <GameOverPanel state={state} onRestart={handleRestart} />
        ) : (
          <>
            <StatusBar state={state} />

            {last && (
              <div className="bg-white rounded-lg shadow-md p-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span className="font-semibold text-gray-500">
                  Round {last.round} result:
                </span>
                <span>
                  Lifted <strong>{fmtTeu(last.liftedCargo)}</strong>
                </span>
                {last.rolledCargo > 0 && (
                  <span className="text-red-600">
                    Rolled <strong>{fmtTeu(last.rolledCargo)}</strong>
                  </span>
                )}
                <span>
                  Revenue <strong>{fmtMoney(last.revenue)}</strong>
                </span>
                <span>
                  Costs <strong>{fmtMoney(last.costs)}</strong>
                </span>
                <span className={last.profit < 0 ? 'text-red-600' : 'text-green-700'}>
                  Profit <strong>{fmtMoney(last.profit)}</strong>
                </span>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-4 items-start">
              <DecisionPanel
                state={state}
                decisions={decisions}
                onChange={setDecisions}
                onCommit={handleCommit}
              />
              <MarketPanel state={state} />
              <div className="lg:col-span-1">
                <HistoryCharts history={state.history} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default GamePage;
