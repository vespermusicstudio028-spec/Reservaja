import React, { useMemo } from "react";
import { Goal, Profile } from "../types";
import { formatCurrency } from "../utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsProps {
  goals: Goal[];
  profile: Profile;
}

export function Stats({ goals, profile }: StatsProps) {
  const stats = useMemo(() => {
    let totalSaved = 0;
    let totalTarget = 0;
    let completedCount = 0;
    let largestGoal = goals[0];
    let smallestGoal = goals[0];

    goals.forEach((goal) => {
      totalSaved += goal.savedAmount;
      totalTarget += goal.targetAmount;
      if (goal.savedAmount >= goal.targetAmount) {
        completedCount++;
      }
      if (!largestGoal || goal.targetAmount > largestGoal.targetAmount) {
        largestGoal = goal;
      }
      if (!smallestGoal || goal.targetAmount < smallestGoal.targetAmount) {
        smallestGoal = goal;
      }
    });

    const percentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    // Generate timeline data
    let allHistory: { date: string; amount: number }[] = [];
    goals.forEach(g => {
       if (g.history) {
         allHistory = allHistory.concat(g.history);
       }
    });
    
    // Sort by date
    allHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulative = 0;
    const chartDataMap = new Map<string, number>();
    
    allHistory.forEach(h => {
      cumulative += h.amount;
      const dateKey = new Date(h.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      chartDataMap.set(dateKey, cumulative);
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    // If no history, just show current total as a single point, or empty
    if (chartData.length === 0 && totalSaved > 0) {
      chartData.push({
         date: new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
         amount: totalSaved
      });
    }

    return {
      totalSaved,
      totalTarget,
      goalsCount: goals.length,
      completedCount,
      largestGoal,
      smallestGoal,
      percentage: Math.min(100, Math.round(percentage)),
      chartData
    };
  }, [goals]);

  return (
    <div className="mx-auto max-w-4xl pb-24 md:pb-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          📊 Estatísticas
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Acompanhe seu progresso geral.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#00C853] p-6 text-white shadow-sm">
          <div className="text-sm font-medium opacity-90">
            Total Economizado
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight">
            {formatCurrency(stats.totalSaved, profile.currency)}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm opacity-90">
            <span>Progresso Geral</span>
            <span className="font-semibold">{stats.percentage}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Total de Metas" value={stats.goalsCount} icon="🎯" />
          <StatCard title="Concluídas" value={stats.completedCount} icon="🏆" />
          <div className="col-span-2">
            <StatCard
              title="Valor Total das Metas"
              value={formatCurrency(stats.totalTarget, profile.currency)}
              icon="💳"
            />
          </div>
        </div>
      </div>

      {stats.chartData.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evolução das Economias</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Seu progresso ao longo do tempo</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(val) => `R$ ${val}`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value, profile.currency), 'Economizado']}
                  labelStyle={{ color: '#374151', fontWeight: 500, marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#00C853" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00C853', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#00C853', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(stats.largestGoal || stats.smallestGoal) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {stats.largestGoal && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Maior Meta
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white truncate">
                {stats.largestGoal.name}
              </div>
              <div className="mt-1 font-mono text-sm text-[#00C853]">
                {formatCurrency(
                  stats.largestGoal.targetAmount,
                  profile.currency,
                )}
              </div>
            </div>
          )}
          {stats.smallestGoal && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Menor Meta
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white truncate">
                {stats.smallestGoal.name}
              </div>
              <div className="mt-1 font-mono text-sm text-[#00C853]">
                {formatCurrency(
                  stats.smallestGoal.targetAmount,
                  profile.currency,
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>{icon}</span> {title}
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
