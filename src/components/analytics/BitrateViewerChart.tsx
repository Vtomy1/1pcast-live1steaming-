import React, { useRef, useEffect } from 'react';
import { AnalyticsHistoryPoint } from '../../types';

interface BitrateViewerChartProps {
  data: AnalyticsHistoryPoint[];
  metric: 'both' | 'viewers' | 'bitrate';
  height?: number;
}

export const BitrateViewerChart: React.FC<BitrateViewerChartProps> = ({
  data,
  metric = 'both',
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const h = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, h);

    if (data.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Accumulating real-time telemetry points...', width / 2, h / 2);
      return;
    }

    const padding = { top: 20, right: 40, bottom: 25, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartH / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Min & Max calculations
    const viewersArr = data.map((d) => d.viewers);
    const bitrateArr = data.map((d) => d.bitrate);

    const minV = Math.floor(Math.min(...viewersArr) * 0.9);
    const maxV = Math.ceil(Math.max(...viewersArr) * 1.05);

    const minB = Math.floor(Math.min(...bitrateArr) * 0.85);
    const maxB = Math.ceil(Math.max(...bitrateArr) * 1.1);

    // Left Y-axis labels (Viewers)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridSteps; i++) {
      const val = Math.round(maxV - ((maxV - minV) / gridSteps) * i);
      const y = padding.top + (chartH / gridSteps) * i + 3;
      ctx.fillText(val.toLocaleString(), padding.left - 8, y);
    }

    // Right Y-axis labels (Bitrate in kbps)
    if (metric === 'both' || metric === 'bitrate') {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#10b981';
      for (let i = 0; i <= gridSteps; i++) {
        const val = Math.round(maxB - ((maxB - minB) / gridSteps) * i);
        const y = padding.top + (chartH / gridSteps) * i + 3;
        ctx.fillText(`${val}k`, width - padding.right + 8, y);
      }
    }

    // Draw Viewers Curve
    if (metric === 'both' || metric === 'viewers') {
      const stepX = chartW / (data.length - 1);

      // Gradient Fill
      const gradV = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
      gradV.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
      gradV.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

      ctx.beginPath();
      data.forEach((pt, i) => {
        const x = padding.left + i * stepX;
        const normY = (pt.viewers - minV) / (maxV - minV || 1);
        const y = padding.top + chartH * (1 - normY);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // Close path for area
      ctx.lineTo(padding.left + (data.length - 1) * stepX, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradV;
      ctx.fill();

      // Line
      ctx.beginPath();
      data.forEach((pt, i) => {
        const x = padding.left + i * stepX;
        const normY = (pt.viewers - minV) / (maxV - minV || 1);
        const y = padding.top + chartH * (1 - normY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Bitrate Curve
    if (metric === 'both' || metric === 'bitrate') {
      const stepX = chartW / (data.length - 1);

      ctx.beginPath();
      data.forEach((pt, i) => {
        const x = padding.left + i * stepX;
        const normY = (pt.bitrate - minB) / (maxB - minB || 1);
        const y = padding.top + chartH * (1 - normY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Time ticks at bottom
    ctx.fillStyle = '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    const timeTickInterval = Math.max(1, Math.floor(data.length / 4));
    data.forEach((pt, i) => {
      if (i % timeTickInterval === 0 || i === data.length - 1) {
        const x = padding.left + i * (chartW / (data.length - 1));
        ctx.fillText(pt.timeLabel || '', x, h - 8);
      }
    });
  }, [data, metric, height]);

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-neutral-300 font-medium">Live Viewers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-neutral-300 font-medium">Bitrate (kbps)</span>
          </div>
        </div>
        <span className="text-[11px] text-neutral-500 font-mono">Rolling 60s Telemetry</span>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg bg-neutral-950/70 border border-neutral-800/80"
      />
    </div>
  );
};
