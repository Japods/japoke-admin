import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white border border-gris-border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-heading font-bold text-negro mb-1">{label}</p>
      <div className="space-y-0.5">
        <p className="text-naranja font-semibold">{formatCurrency(data.revenue)}</p>
        <p className="text-gris text-xs">{data.orders} pedido{data.orders !== 1 ? 's' : ''} — {data.bowls} bowl{data.bowls !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default function SalesChart({ sales }) {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gris-border p-6">
        <h3 className="font-heading font-semibold text-negro mb-4">Ventas por Dia</h3>
        <p className="text-sm text-gris text-center py-8">No hay datos de ventas aun</p>
      </div>
    );
  }

  const chartData = sales.map((day) => ({
    ...day,
    dateLabel: day.date.slice(5),
  }));

  return (
    <div className="bg-white rounded-xl border border-gris-border p-6">
      <h3 className="font-heading font-semibold text-negro mb-4">Ventas por Dia</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF6B35"
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
              dot={{ r: 4, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
