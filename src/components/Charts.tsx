/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SubjectSummary, SectionSummary, DistributionBucket } from '../types';

interface SubjectAveragesChartProps {
  data: SubjectSummary[];
}

export const SubjectAveragesBarChart: React.FC<SubjectAveragesChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-slate-400 text-sm">No data available to plot</div>;
  }

  const chartHeight = 220;
  const chartWidth = 560;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = 100;
  const groupWidth = innerWidth / data.length;
  const barWidth = Math.min(28, groupWidth * 0.35);

  const getY = (val: number) => paddingTop + innerHeight - (val / maxVal) * innerHeight;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[480px]">
        {/* Y Axis Gridlines */}
        {[0, 20, 40, 60, 80, 100].map(val => {
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke={val === 40 ? '#f43f5e' : '#e2e8f0'}
                strokeWidth={val === 40 ? 1.5 : 1}
                strokeDasharray={val === 40 ? '4 3' : undefined}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className={`text-[10px] font-mono tabular-nums ${val === 40 ? 'fill-rose-600 font-semibold' : 'fill-slate-400'}`}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Pass Mark Label */}
        <text
          x={chartWidth - paddingRight}
          y={getY(40) - 5}
          textAnchor="end"
          className="text-[9px] fill-rose-600 font-medium font-sans"
        >
          Pass Benchmark (40)
        </text>

        {/* Bars */}
        {data.map((item, idx) => {
          const groupX = paddingLeft + idx * groupWidth;
          const centerX = groupX + groupWidth / 2;
          const meanBarX = centerX - barWidth - 2;
          const medianBarX = centerX + 2;

          const meanY = getY(item.mean);
          const medianY = getY(item.median);
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.subject_id}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-opacity"
            >
              {/* Highlight background on hover */}
              {isHovered && (
                <rect
                  x={groupX + 4}
                  y={paddingTop}
                  width={groupWidth - 8}
                  height={innerHeight}
                  fill="#f1f5f9"
                  rx={4}
                  opacity={0.6}
                />
              )}

              {/* Mean Bar */}
              <rect
                x={meanBarX}
                y={meanY}
                width={barWidth}
                height={innerHeight - (meanY - paddingTop)}
                fill="#3b82f6"
                rx={2}
                className="transition-all duration-300 hover:brightness-110"
              />

              {/* Median Bar */}
              <rect
                x={medianBarX}
                y={medianY}
                width={barWidth}
                height={innerHeight - (medianY - paddingTop)}
                fill="#8b5cf6"
                rx={2}
                className="transition-all duration-300 hover:brightness-110"
              />

              {/* Values above bars */}
              <text
                x={meanBarX + barWidth / 2}
                y={meanY - 5}
                textAnchor="middle"
                className="text-[9px] font-mono font-medium fill-slate-700"
              >
                {item.mean}
              </text>

              {/* Subject label at bottom */}
              <text
                x={centerX}
                y={chartHeight - 15}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-600"
              >
                {item.subject_name.length > 11 ? item.subject_name.slice(0, 9) + '…' : item.subject_name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-sm inline-block"></span>
          <span>Mean Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-sm inline-block"></span>
          <span>Median Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t border-rose-500 border-dashed inline-block"></span>
          <span className="text-rose-600">Pass Mark (40)</span>
        </div>
      </div>
    </div>
  );
};

interface PassRateChartProps {
  data: SubjectSummary[];
}

export const SubjectPassRateBarChart: React.FC<PassRateChartProps> = ({ data }) => {
  const chartHeight = 220;
  const chartWidth = 560;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const groupWidth = innerWidth / data.length;
  const barWidth = Math.min(36, groupWidth * 0.55);

  const getY = (val: number) => paddingTop + innerHeight - (val / 100) * innerHeight;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[480px]">
        {/* Y Axis Grid */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono tabular-nums fill-slate-400"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* 100% Target line */}
        <line
          x1={paddingLeft}
          y1={getY(100)}
          x2={chartWidth - paddingRight}
          y2={getY(100)}
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Bars */}
        {data.map((item, idx) => {
          const groupX = paddingLeft + idx * groupWidth;
          const centerX = groupX + groupWidth / 2;
          const barX = centerX - barWidth / 2;
          const y = getY(item.pass_percentage);
          const height = innerHeight - (y - paddingTop);

          // Color based on pass rate
          let barFill = '#10b981'; // Green for >= 90%
          if (item.pass_percentage < 75) barFill = '#f43f5e'; // Red
          else if (item.pass_percentage < 85) barFill = '#f59e0b'; // Amber

          return (
            <g key={item.subject_id}>
              <rect
                x={barX}
                y={y}
                width={barWidth}
                height={height}
                fill={barFill}
                rx={3}
                className="transition-all duration-300 hover:opacity-90"
              />

              {/* Percentage label */}
              <text
                x={centerX}
                y={y - 6}
                textAnchor="middle"
                className="text-[10px] font-mono font-semibold fill-slate-800 tabular-nums"
              >
                {item.pass_percentage}%
              </text>

              {/* Subject label */}
              <text
                x={centerX}
                y={chartHeight - 15}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-600"
              >
                {item.subject_name.length > 11 ? item.subject_name.slice(0, 9) + '…' : item.subject_name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block"></span>
          <span>High (≥ 85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-sm inline-block"></span>
          <span>Moderate (75 - 84%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-rose-500 rounded-sm inline-block"></span>
          <span>Low (&lt; 75%)</span>
        </div>
      </div>
    </div>
  );
};

interface DistributionProps {
  data: DistributionBucket[];
}

export const MarksDistributionHistogram: React.FC<DistributionProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 200;
  const chartWidth = 520;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const barWidth = innerWidth / data.length - 12;

  const getY = (val: number) => paddingTop + innerHeight - (val / (maxCount * 1.15)) * innerHeight;

  // Deduplicate grid values to prevent duplicate keys when maxCount is small
  const midPoint = Math.round(maxCount / 2);
  const gridValues = Array.from(new Set([0, midPoint, maxCount])).sort((a, b) => a - b);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[420px]">
        {/* Y Axis Gridlines */}
        {gridValues.map((val, idx) => {
          const y = getY(val);
          return (
            <g key={`hist-grid-${idx}-${val}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono tabular-nums fill-slate-400"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((bucket, idx) => {
          const x = paddingLeft + idx * (barWidth + 12) + 6;
          const y = getY(bucket.count);
          const height = innerHeight - (y - paddingTop);

          // Color palette for score brackets
          const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#6366f1', '#10b981'];
          const barColor = colors[idx] || '#64748b';

          return (
            <g key={bucket.rangeLabel}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={barColor}
                rx={3}
                className="transition-all duration-300 hover:opacity-90"
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="text-[10px] font-mono font-medium fill-slate-700 tabular-nums"
              >
                {bucket.count} ({bucket.percentage}%)
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight - 12}
                textAnchor="middle"
                className="text-[9px] font-medium fill-slate-500"
              >
                {bucket.rangeLabel.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface SectionSummaryChartProps {
  data: SectionSummary[];
}

export const SectionComparisonChart: React.FC<SectionSummaryChartProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {data.map((sec, idx) => (
        <div key={`sec-${sec.section}-${idx}`} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">SECTION</span>
            <span className="text-base font-bold text-slate-900 font-mono">Sec {sec.section}</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Class Average</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">{sec.avg_percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sec.avg_percentage)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Pass Rate</span>
                <span className="font-mono font-semibold tabular-nums text-emerald-700">{sec.pass_percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sec.pass_percentage)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Section Topper:</span>
              <span className="font-medium text-slate-800 truncate max-w-[120px]">{sec.topper_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
