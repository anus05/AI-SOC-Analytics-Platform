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
        const allItems = dataPoints || [];
        if (next.size < allItems.length - 1) {
          next.add(type);
        }
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-2 p-2 animate-pulse min-h-[110px]">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-20 h-3 bg-white/10 rounded"></div>
            <div className="flex-1 h-3 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const allItems = dataPoints || [];

  const visibleItems = allItems.filter(item => !hiddenCategories.has(item.type));

  const labels = visibleItems.map(d => d.type);
  const percentages = visibleItems.map(d => d.percentage);

  // Map colors consistently based on index in allItems
  const bgColors = visibleItems.map(item => {
    const origIdx = allItems.findIndex(i => i.type === item.type);
    return ['#2dd4bf', '#d29922', '#8b949e'][origIdx % 3];
  });

  const data = {
    labels,
    datasets: [
      {
        data: percentages,
        backgroundColor: bgColors,
        borderRadius: 3,
        borderSkipped: false,
        barThickness: 7
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
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 8,
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
          color: '#94a3b8',
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
          color: '#f1f5f9',
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[115px] flex flex-col justify-between">
      {/* Clickable Interactive Legend */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-2">
        {allItems.map((item, idx) => {
          const isHidden = hiddenCategories.has(item.type);
          const color = ['#2dd4bf', '#d29922', '#8b949e'][idx % 3];
          return (
            <button
              key={item.type}
              onClick={() => toggleCategory(item.type)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-mono text-[9px] font-bold uppercase transition-all select-none cursor-pointer backdrop-blur-sm ${
                isHidden 
                  ? 'border-white/5 bg-slate-950/40 text-slate-500 line-through' 
                  : 'border-white/10 text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 hover:text-white hover:border-white/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isHidden ? '#334155' : color }}></span>
              <span>{item.type}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-h-[80px]">
        {visibleItems.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-[10px]">
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

