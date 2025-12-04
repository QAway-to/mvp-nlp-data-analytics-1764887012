import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function ChartPanel({ data }) {
  if (!data || !data.data || data.data.length === 0) {
    return <p style={{ color: '#94a3b8' }}>Нет данных для графика</p>;
  }

  const ChartComponent = data.type === 'line' ? LineChart : BarChart;
  const DataComponent = data.type === 'line' ? Line : Bar;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <ChartComponent data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey={data.xKey || 'date'} 
            stroke="#94a3b8"
            style={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#f8fafc'
            }}
          />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey={data.yKey || 'value'}
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.6}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

