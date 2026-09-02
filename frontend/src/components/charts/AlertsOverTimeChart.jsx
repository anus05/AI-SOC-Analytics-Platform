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
        <div className="flex-1 flex gap-2 items-end border-b border-l border-border/40 pb-2">
          <div className="w-full bg-border/20 h-[20%] rounded-sm"></div>
          <div className="w-full bg-border/20 h-[45%] rounded-sm"></div>
          <div className="w-full bg-border/20 h-[30%] rounded-sm"></div>
          <div className="w-full bg-border/20 h-[65%] rounded-sm"></div>
          <div className="w-full bg-border/20 h-[50%] rounded-sm"></div>
          <div className="w-full bg-border/20 h-[80%] rounded-sm"></div>
          <div className="w-full bg-border/20 h-[40%] rounded-sm"></div>
        </div>
        <div className="flex justify-between mt-1 text-[8px] font-mono text-on-surface-variant/40">
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
      <div className="w-full h-full flex flex-col items-center justify-center p-4 border border-dashed border-border rounded text-on-surface-variant font-mono text-[10px] min-h-[140px]">
        <span className="material-symbols-outlined text-[16px] mb-xs">show_chart</span>
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
        borderColor: '#58a6ff', // desaturated blue accent
        backgroundColor: 'rgba(88, 166, 255, 0.05)',
        fill: true,
        tension: 0.2, // flatter tension for a real SIEM look
        pointBackgroundColor: '#58a6ff',
        pointBorderColor: '#0d1117',
        pointHoverRadius: 4,
        borderWidth: 1.5,
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
        backgroundColor: '#11151c',
        titleColor: '#c9d1d9',
        bodyColor: '#c9d1d9',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        borderColor: '#22262f',
        borderWidth: 1,
        padding: 6,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(34, 38, 47, 0.4)',
          drawBorder: false
        },
        ticks: {
          color: '#8b949e',
          font: { family: 'JetBrains Mono', size: 9 }
        }
      },
      y: {
        grid: {
          color: 'rgba(34, 38, 47, 0.4)',
          drawBorder: false
        },
        ticks: {
          color: '#8b949e',
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
