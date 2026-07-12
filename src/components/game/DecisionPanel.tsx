import React from 'react';
import { Minus, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { GameState, Decisions } from '@/lib/game/types';
import { activeCharters } from '@/lib/game/engine';
import {
  MIN_FREIGHT_RATE,
  MAX_FREIGHT_RATE,
  CHARTER_MIN_COMMITMENT,
  NEWBUILD_DELAY,
  NEWBUILD_PRICE,
  SHIP_CAPACITY,
} from '@/lib/game/constants';
import { fmtMoney, fmtRate } from '@/lib/game/format';

interface Props {
  state: GameState;
  decisions: Decisions;
  onChange: (d: Decisions) => void;
  onCommit: () => void;
}

const Counter: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ value, min, max, onChange }) => (
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      className="h-7 w-7"
      disabled={value <= min}
      onClick={() => onChange(value - 1)}
    >
      <Minus className="h-3 w-3" />
    </Button>
    <span className="w-6 text-center font-semibold">{value}</span>
    <Button
      variant="outline"
      size="icon"
      className="h-7 w-7"
      disabled={value >= max}
      onClick={() => onChange(value + 1)}
    >
      <Plus className="h-3 w-3" />
    </Button>
  </div>
);

const DecisionPanel: React.FC<Props> = ({ state, decisions, onChange, onCommit }) => {
  const charters = activeCharters(state, state.round);
  const rateVsMarket = decisions.freightRate / state.market.marketRate;

  const toggleRedeliver = (id: string, checked: boolean) => {
    const ids = checked
      ? [...decisions.redeliverIds, id]
      : decisions.redeliverIds.filter((x) => x !== id);
    onChange({ ...decisions, redeliverIds: ids });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-5">
      <h3 className="font-bold">Your decisions this round</h3>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-sm font-medium">Freight rate</label>
          <span className="text-sm font-semibold text-ocean">
            {fmtRate(decisions.freightRate)}
          </span>
        </div>
        <Slider
          value={[decisions.freightRate]}
          min={MIN_FREIGHT_RATE}
          max={MAX_FREIGHT_RATE}
          step={50}
          onValueChange={([v]) => onChange({ ...decisions, freightRate: v })}
        />
        <p className="text-xs text-gray-500 mt-1">
          {rateVsMarket < 0.95
            ? 'Below market — you will win extra cargo, but can you carry it?'
            : rateVsMarket > 1.05
              ? 'Above market — bookings will shrink, margins will grow.'
              : 'Roughly at market rate.'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Charter in ships</div>
          <p className="text-xs text-gray-500">
            {fmtMoney(state.market.charterRate)}/round each, arrives next round,{' '}
            {CHARTER_MIN_COMMITMENT}-round commitment
          </p>
        </div>
        <Counter
          value={decisions.charterIn}
          min={0}
          max={5}
          onChange={(v) => onChange({ ...decisions, charterIn: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Order newbuilds</div>
          <p className="text-xs text-gray-500">
            {fmtMoney(NEWBUILD_PRICE)} each ({(SHIP_CAPACITY / 1000).toFixed(0)}K TEU),
            delivers in {NEWBUILD_DELAY} rounds
          </p>
        </div>
        <Counter
          value={decisions.orderNewbuilds}
          min={0}
          max={3}
          onChange={(v) => onChange({ ...decisions, orderNewbuilds: v })}
        />
      </div>

      {charters.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-1">Redeliver charters</div>
          <div className="space-y-1">
            {charters.map((c, i) => {
              const locked = c.minEndRound > state.round;
              const leaving = c.redeliverAfterRound !== undefined;
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 text-xs rounded-md px-2 py-1 ${
                    locked || leaving ? 'text-gray-400' : 'text-gray-700'
                  } bg-gray-50`}
                >
                  <Checkbox
                    checked={leaving || decisions.redeliverIds.includes(c.id)}
                    disabled={locked || leaving}
                    onCheckedChange={(checked) => toggleRedeliver(c.id, checked === true)}
                  />
                  <span>
                    Charter #{i + 1} — {fmtMoney(c.hirePerRound)}/round
                    {leaving
                      ? ' (redelivering)'
                      : locked
                        ? ` (committed until round ${c.minEndRound})`
                        : ''}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <Button className="w-full bg-ocean hover:bg-ocean-dark" onClick={onCommit}>
        <Play className="h-4 w-4 mr-2" /> Sail round {state.round}
      </Button>
    </div>
  );
};

export default DecisionPanel;
