"use client";

import { useEffect, useRef } from "react";

interface TradingChartProps {
  klines: { time: number; open: number; high: number; low: number; close: number }[];
}

export default function TradingChart({ klines }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scriptId = "lightweight-charts-cdn";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initChart = () => {
      if (!containerRef.current) return;
      
      // Clean up previous chart
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {}
        chartRef.current = null;
      }

      const LWC = (window as any).LightweightCharts;
      if (!LWC) return;

      const chartOptions = {
        width: containerRef.current.clientWidth,
        height: 300,
        layout: {
          textColor: "#d1d5db",
          background: { type: "solid", color: "transparent" },
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.05)" },
          horzLines: { color: "rgba(255, 255, 255, 0.05)" },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "rgba(255, 255, 255, 0.1)",
        },
        rightPriceScale: {
          borderColor: "rgba(255, 255, 255, 0.1)",
        },
      };

      try {
        const chart = LWC.createChart(containerRef.current, chartOptions);
        chartRef.current = chart;

        const candleSeries = chart.addCandlestickSeries({
          upColor: "#34D399",
          downColor: "#FB7185",
          borderVisible: false,
          wickUpColor: "#34D399",
          wickDownColor: "#FB7185",
        });
        seriesRef.current = candleSeries;

        if (klines && klines.length > 0) {
          candleSeries.setData(klines);
        }
        chart.timeScale().fitContent();
      } catch (err) {
        console.error("Failed to initialize TradingView chart:", err);
      }
    };

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    if (!(window as any).LightweightCharts) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js";
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener("load", initChart);
    } else {
      initChart();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (script) {
        script.removeEventListener("load", initChart);
      }
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {}
        chartRef.current = null;
      }
    };
  }, [klines]);

  return (
    <div className="panel-card" style={{ height: "400px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "1.2rem" }}>Interactive Price Chart</h3>
        <span style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.2)", color: "var(--text-main)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
          TradingView Engine
        </span>
      </div>
      <div ref={containerRef} style={{ flexGrow: 1, width: "100%", position: "relative" }}></div>
    </div>
  );
}
