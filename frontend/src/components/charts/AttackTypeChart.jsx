import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttackTypeChart = ({ dataPoints, totalAlerts = 1284, loading }) => {
  const [hiddenCategories, setHiddenCategories] = useState(new Set());

  const toggleCategory = (type) => {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        // Prevent hiding all categories
        const allItems = dataPoints || [
          { type: 'Brute Force', percentage: 45 },
          { type: 'Password Spray', percentage: 30 },
          { type: 'Port Scan', percentage: 25 }
        ];
        if (next.size < allItems.length - 1) {
          next.add(type);
        }
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-sm p-2 animate-pulse min-h-[110px]">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-sm">
            <div className="w-20 h-3 bg-border/20 rounded"></div>
            <div className="flex-1 h-3 bg-border/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const allItems = dataPoints || [
    { type: 'Brute Force', percentage: 45 },
    { type: 'Password Spray', percentage: 30 },
    { type: 'Port Scan', percentage: 25 }
  ];

  const visibleItems = allItems.filter(item => !hiddenCategories.has(item.type));

  const labels = visibleItems.map(d => d.type);
  const percentages = visibleItems.map(d => d.percentage);

  // Map colors consistently based on index in allItems
  const bgColors = visibleItems.map(item => {
    const origIdx = allItems.findIndex(i => i.type === item.type);
    return ['#58a6ff', '#d29922', '#8b949e'][origIdx % 3];
  });

  const data = {
    labels,
    datasets: [
      {
        data: percentages,
        backgroundColor: bgColors,
        borderRadius: 2,
        borderSkipped: false,
        barThickness: 6
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#11151c',
        titleColor: '#c9d1d9',
        bodyColor: '#c9d1d9',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        borderColor: '#22262f',
        borderWidth: 1,
        padding: 6,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.parsed.x;
            const count = Math.round((val / 100) * totalAlerts);
            return ` ${context.label}: ${val}% (${count.toLocaleString()} hits)`;
          }
        }
      }
    },
    scales: {
      x: {
        max: 100,
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#8b949e',
          font: { family: 'JetBrains Mono', size: 9 },
          callback: (value) => `${value}%`
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#c9d1d9',
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[115px] flex flex-col justify-between">
      {/* Clickable Interactive Legend */}
      <div className="flex flex-wrap gap-xs justify-center mb-sm">
        {allItems.map((item, idx) => {
          const isHidden = hiddenCategories.has(item.type);
          const color = ['#58a6ff', '#d29922', '#8b949e'][idx % 3];
          return (
            <button
              key={item.type}
              onClick={() => toggleCategory(item.type)}
              className={`flex items-center gap-xs px-2 py-0.5 rounded border font-mono text-[9px] font-bold uppercase transition-all select-none cursor-pointer ${
                isHidden 
                  ? 'border-border/30 bg-background text-on-surface-variant/40 line-through' 
                  : 'border-border text-on-surface hover:bg-[#161b22] hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isHidden ? '#22262f' : color }}></span>
              <span>{item.type}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-h-[80px]">
        {visibleItems.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant font-mono text-[10px]">
            <span>NO ATTACK DATA SELECTED</span>
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default AttackTypeChart;
