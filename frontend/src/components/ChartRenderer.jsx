import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6c63ff', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#f472b6', '#fb923c'];

const tooltipStyle = {
  background: '#18181f',
  border: '1px solid #2a2a35',
  borderRadius: '8px',
  color: '#e8e8f0',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.82rem',
};

export default function ChartRenderer({ chartType, data, xCol, yCol }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
        no chart data returned
      </div>
    );
  }

  const safeX = xCol || Object.keys(data[0])[0];
  const safeY = yCol || Object.keys(data[0]).find(k => k !== safeX) || Object.keys(data[0])[0];

  const tickStyle = { fill: '#5a5a70', fontSize: 11, fontFamily: "'Space Mono', monospace" };

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey={safeY}
            nameKey={safeX}
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={45}
            paddingAngle={3}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#3a3a48' }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#9090a8', fontFamily: "'DM Sans', sans-serif" }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" />
          <XAxis dataKey={safeX} tick={tickStyle} tickLine={false} axisLine={{ stroke: '#2a2a35' }}
            angle={-30} textAnchor="end" interval="preserveStartEnd" />
          <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={45} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey={safeY} stroke="#6c63ff" strokeWidth={2.5} dot={{ r: 3, fill: '#6c63ff' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // default: bar
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
        <XAxis dataKey={safeX} tick={tickStyle} tickLine={false} axisLine={{ stroke: '#2a2a35' }}
          angle={-30} textAnchor="end" interval="preserveStartEnd" />
        <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={45} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(108,99,255,0.07)' }} />
        <Bar dataKey={safeY} fill="#6c63ff" radius={[4, 4, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}