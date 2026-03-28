import { TrendingUp, TrendingDown, Minus, Calendar, LineChart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export interface SalesForecastData {
  predictedMin: number;
  predictedMax: number;
  trend: 'up' | 'down' | 'stable';
  busyDays: string[];
  slowDays: string[];
}

interface SalesForecastProps {
  /** When null, show a no-data state (e.g. new user or not enough history). */
  forecast: SalesForecastData | null;
}

export function SalesForecast({ forecast }: SalesForecastProps) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up stagger-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Tomorrow's Forecast</h3>
          <p className="text-xs text-muted-foreground">Based on your sales history</p>
        </div>
      </div>

      {forecast === null ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center">
          <LineChart className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Not enough data yet</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            After you have sales on more than one day, we will estimate a range and highlight your
            busier and slower days.
          </p>
        </div>
      ) : (
        <SalesForecastInner {...forecast} />
      )}
    </div>
  );
}

function SalesForecastInner({
  predictedMin,
  predictedMax,
  trend,
  busyDays,
  slowDays,
}: SalesForecastData) {
  return (
    <>
      {/* Predicted Range */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-2">Expected Sales Range</p>
        <div className="flex items-baseline gap-2">
          <span className="text-amount-sm text-foreground tabular-nums">
            KES {formatCurrency(predictedMin)}
          </span>
          <span className="text-muted-foreground">–</span>
          <span className="text-amount-sm text-foreground tabular-nums">
            KES {formatCurrency(predictedMax)}
          </span>
        </div>
        
        {/* Trend Indicator */}
        <div className={cn(
          'flex items-center gap-1 mt-2',
          trend === 'up' && 'text-income',
          trend === 'down' && 'text-expense',
          trend === 'stable' && 'text-muted-foreground'
        )}>
          {trend === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4" />}
          {trend === 'stable' && <Minus className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {trend === 'up' && 'Trending up'}
            {trend === 'down' && 'Trending down'}
            {trend === 'stable' && 'Stable'}
          </span>
        </div>
      </div>
      
      {/* Busy/Slow Days */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">🔥 Usually Busy</p>
          <div className="flex flex-wrap gap-1">
            {busyDays.map((day, i) => (
              <span 
                key={`${day}-${i}`}
                className="px-2 py-1 bg-income/10 text-income text-xs font-medium rounded-full"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">😴 Usually Slow</p>
          <div className="flex flex-wrap gap-1">
            {slowDays.map((day, i) => (
              <span 
                key={`${day}-${i}`}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
