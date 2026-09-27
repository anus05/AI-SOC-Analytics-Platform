import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AlertsOverTimeChart = ({ dataPoints, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-end p-2 animate-pulse min-h-[140px]">
        <div className="flex-1 flex gap-2 items-end border-b border-l border-white/10 pb-2">
          <div className="w-full bg-white/5 h-[20%] rounded-sm"></div>
          <div className="w-full bg-white/5 h-[45%] rounded-sm"></div>
          <div className="w-full bg-white/5 h-[30%] rounded-sm"></div>
          <div className="w-full bg-white/5 h-[65%] rounded-sm"></div>
          <div className="w-full bg-white/5 h-[50%] rounded-sm"></div>
          <div className="w-full bg-white/5 h-[80%] rounded-sm"></div>
          <div className="w-full bg-white/5 h-[40%] rounded-sm"></div>
        </div>
        <div className="flex justify-between mt-1 text-[8px] font-mono text-slate-500">
          <span>00:00</span>
          <span>08:00</span>
          <span>16:00</span>
          <span>Now</span>
        </div>
      </div>
    );
  }

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 border border-dashed border-white/10 rounded-lg text-slate-400 font-mono text-[10px] min-h-[140px]">
        <span className="material-symbols-outlined text-[16px] mb-xs text-accent">show_chart</span>
        <span>NO TELEMETRY RECORDED</span>
      </div>
    );
  }

  const labels = dataPoints.map(d => d.time);
  const counts = dataPoints.map(d => d.count);

  const data = {
    labels,
    datasets: [
      {
        label: 'Detections',
        data: counts,
        borderColor: '#2dd4bf', // teal accent
        backgroundColor: 'rgba(45, 212, 191, 0.08)',
        fill: true,
        tension: 0.25,
        pointBackgroundColor: '#2dd4bf',
        pointBorderColor: '#090d16',
        pointHoverRadius: 5,
        borderWidth: 1.8,
      }
    ]
  };

  const options = {
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
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 9 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 9 },
          stepSize: 10
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[140px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default AlertsOverTimeChart;

