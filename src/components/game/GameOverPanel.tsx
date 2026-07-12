import React from 'react';
import { Award, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameState } from '@/lib/game/types';
import { buildFinalReport } from '@/lib/game/engine';
import { fmtMoney, fmtPct } from '@/lib/game/format';
import HistoryCharts from './HistoryCharts';

interface Props {
  state: GameState;
  onRestart: () => void;
}

const GameOverPanel: React.FC<Props> = ({ state, onRestart }) => {
  const report = buildFinalReport(state);
  const bankrupt = state.status === 'bankrupt';

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg shadow-md p-6 text-white ${
          bankrupt ? 'bg-red-700' : 'bg-ocean'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-8 w-8" />
          <h2 className="text-2xl font-bold">{report.grade.label}</h2>
        </div>
        <p className="opacity-90">{report.grade.comment}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-xs text-gray-500">Total profit</div>
          <div
            className={`text-xl font-bold ${
              report.totalProfit < 0 ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {fmtMoney(report.totalProfit)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-xs text-gray-500">Avg utilization</div>
          <div className="text-xl font-bold">{fmtPct(report.avgUtilization)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-xs text-gray-500">Service level</div>
          <div className="text-xl font-bold">{fmtPct(report.serviceLevel)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-xs text-gray-500">Bullwhip ratio</div>
          <div
            className={`text-xl font-bold ${
              report.bullwhipRatio > 1.5 ? 'text-amber-600' : 'text-gray-900'
            }`}
          >
            {report.bullwhipRatio.toFixed(2)}×
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 text-sm text-gray-700 space-y-2">
        <h3 className="font-bold">Debrief: did you crack the whip?</h3>
        <p>
          The <strong>bullwhip ratio</strong> compares how volatile your capacity was
          against how volatile demand actually was.{' '}
          {report.bullwhipRatio > 1.5 ? (
            <>
              At <strong>{report.bullwhipRatio.toFixed(2)}×</strong>, your fleet swung
              far more than demand did — the classic bullwhip. Because charters and
              newbuilds arrive with a delay, decisions made at the peak land in the
              trough. This is exactly what real carriers do with ships across every
              shipping cycle.
            </>
          ) : (
            <>
              At <strong>{report.bullwhipRatio.toFixed(2)}×</strong>, you kept your
              capacity moves proportionate to real demand swings — the discipline most
              players (and most real carriers) never manage. Well sailed.
            </>
          )}
        </p>
        <p>
          Look at the top chart: wherever the orange capacity line peaks{' '}
          <em>after</em> the blue demand line has already turned down, you paid boom
          prices for bust cargo.
        </p>
      </div>

      <HistoryCharts history={state.history} showBullwhip />

      <div className="text-center">
        <Button size="lg" className="bg-ocean hover:bg-ocean-dark" onClick={onRestart}>
          <RotateCcw className="h-4 w-4 mr-2" /> Play again
        </Button>
      </div>
    </div>
  );
};

export default GameOverPanel;
