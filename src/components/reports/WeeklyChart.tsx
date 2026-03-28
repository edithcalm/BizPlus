import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface WeeklyChartProps {
  data: { day: string; sales: number; expenses: number }[];
  /** When true, show a placeholder instead of amounts/chart (e.g. no transactions yet). */
  empty?: boolean;
}

export function WeeklyChart({ data, empty }: WeeklyChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-xl p-3 shadow-elevated">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span className="text-muted-foreground">{entry.name}: </span>
              <span className={entry.dataKey === 'sales' ? 'text-income' : 'text-expense'}>
                KES {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (empty) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">This Week</h3>
        <div className="h-48 flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 px-4 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-foreground">No weekly activity yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Record sales or expenses and your chart will show here.
          </p>
        </div>
        <div className="flex justify-center gap-6 mt-4 opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-income" />
            <span className="text-sm text-muted-foreground">Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-expense" />
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <h3 className="font-semibold text-foreground mb-4">This Week</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <Bar 
              dataKey="sales" 
              name="Sales"
              radius={[4, 4, 0, 0]}
              fill="hsl(var(--income))"
            />
            <Bar 
              dataKey="expenses" 
              name="Expenses"
              radius={[4, 4, 0, 0]}
              fill="hsl(var(--expense))"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-income" />
          <span className="text-sm text-muted-foreground">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-expense" />
          <span className="text-sm text-muted-foreground">Expenses</span>
        </div>
      </div>
    </div>
  );
}
