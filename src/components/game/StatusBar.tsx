import React from 'react';
import { Anchor, Coins, Heart, TrendingUp, Users } from 'lucide-react';
import { GameState } from '@/lib/game/types';
import { activeCharters, playerNominalCapacity } from '@/lib/game/engine';
import { fmtMoney, fmtPct, fmtTeu } from '@/lib/game/format';

interface Props {
  state: GameState;
}

const StatusBar: React.FC<Props> = ({ state }) => {
  const lastRound = state.history[state.history.length - 1];
  const capacity = playerNominalCapacity(state, state.round);
  const chartered = activeCharters(state, state.round).length;

  const items = [
    {
      icon: Coins,
      label: 'Cash',
      value: fmtMoney(state.cash),
      accent: state.cash < 0 ? 'text-red-600' : 'text-gray-900',
    },
    {
      icon: TrendingUp,
      label: 'Last profit',
      value: lastRound ? fmtMoney(lastRound.profit) : '—',
      accent: lastRound && lastRound.profit < 0 ? 'text-red-600' : 'text-green-700',
    },
    {
      icon: Anchor,
      label: 'Fleet capacity',
      value: `${fmtTeu(capacity)} (${state.ownedShips} owned + ${chartered} chartered)`,
      accent: 'text-gray-900',
    },
    {
      icon: Users,
      label: 'Utilization',
      value: lastRound ? fmtPct(lastRound.utilization) : '—',
      accent: 'text-gray-900',
    },
    {
      icon: Heart,
      label: 'Customer loyalty',
      value: fmtPct(state.customerLoyalty),
      accent:
        state.customerLoyalty < 0.85
          ? 'text-red-600'
          : state.customerLoyalty > 1.05
            ? 'text-green-700'
            : 'text-gray-900',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">Blue Anchor Line</h2>
        <span className="text-sm font-semibold bg-ocean text-white px-3 py-1 rounded-full">
          Round {state.round} / {state.totalRounds}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <item.icon className="h-4 w-4 mt-1 text-ocean shrink-0" />
            <div>
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className={`text-sm font-semibold ${item.accent}`}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
