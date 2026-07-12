import React from 'react';
import { AlertTriangle, Newspaper, TrendingDown, TrendingUp } from 'lucide-react';
import { GameState } from '@/lib/game/types';
import { fmtMoney, fmtRate, fmtTeu } from '@/lib/game/format';

interface Props {
  state: GameState;
}

const toneStyles: Record<string, string> = {
  positive: 'border-green-500 bg-green-50',
  negative: 'border-red-500 bg-red-50',
  neutral: 'border-blue-400 bg-blue-50',
};

const MarketPanel: React.FC<Props> = ({ state }) => {
  const { market } = state;
  const prev = state.history[state.history.length - 2];
  const last = state.history[state.history.length - 1];
  const demandUp = last && prev ? last.demand >= prev.demand : true;
  const news = [...state.news].reverse().slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <h3 className="font-bold flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-ocean" /> Market intelligence
      </h3>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-md p-2">
          <div className="text-xs text-gray-500">Market rate</div>
          <div className="font-semibold text-sm">{fmtRate(market.marketRate)}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-2">
          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            Demand
            {demandUp ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
          </div>
          <div className="font-semibold text-sm">{fmtTeu(market.demand)}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-2">
          <div className="text-xs text-gray-500">Charter hire</div>
          <div className="font-semibold text-sm">{fmtMoney(market.charterRate)}/rd</div>
        </div>
      </div>

      {state.activeEffects.length > 0 && (
        <div className="space-y-1">
          {state.activeEffects.map((e) => (
            <div
              key={e.headline}
              className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-300 rounded-md px-2 py-1"
            >
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>
                {e.headline} — {e.roundsLeft} round{e.roundsLeft > 1 ? 's' : ''} left
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {news.map((n, i) => (
          <div
            key={`${n.round}-${n.headline}-${i}`}
            className={`border-l-4 rounded-r-md px-3 py-2 ${toneStyles[n.tone]}`}
          >
            <div className="text-xs text-gray-500">Round {n.round}</div>
            <div className="text-sm font-semibold">{n.headline}</div>
            <div className="text-xs text-gray-600">{n.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPanel;
