import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RoundRecord } from '@/lib/game/types';
import { BASE_MARKET_SHARE } from '@/lib/game/constants';

interface Props {
  history: RoundRecord[];
  /** Show the demand-vs-capacity comparison used in the debrief */
  showBullwhip?: boolean;
}

const HistoryCharts: React.FC<Props> = ({ history, showBullwhip = false }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500 text-sm">
        Charts appear here once you have sailed your first round.
      </div>
    );
  }

  const data = history.map((r) => ({
    round: r.round,
    'Your capacity (TEU)': Math.round(r.playerCapacity),
    'Your share of demand (TEU)': Math.round(r.demand * BASE_MARKET_SHARE),
    'Cargo lifted (TEU)': Math.round(r.liftedCargo),
    'Market rate': Math.round(r.marketRate),
    'Your rate': Math.round(r.playerRate),
    'Profit ($M)': Math.round(r.profit / 1e6),
    'Cash ($M)': Math.round(r.cash / 1e6),
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="text-sm font-bold mb-2">
          {showBullwhip ? 'The bullwhip: demand vs your capacity' : 'Capacity vs cargo'}
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" fontSize={11} />
            <YAxis fontSize={11} width={50} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="Your share of demand (TEU)"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Your capacity (TEU)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Cargo lifted (TEU)"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-bold mb-2">Freight rates ($/TEU)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" fontSize={11} />
              <YAxis fontSize={11} width={50} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="Market rate"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Your rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-bold mb-2">Profit & cash ($M)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" fontSize={11} />
              <YAxis fontSize={11} width={50} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="Cash ($M)"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="Profit ($M)"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoryCharts;
