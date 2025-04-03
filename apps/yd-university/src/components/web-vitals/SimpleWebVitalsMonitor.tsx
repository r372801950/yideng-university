"use client";
import { useState, useEffect } from 'react';

// 定义正确的度量类型
interface WebVitalsMetrics {
  LCP: number | null;
  FID: number | null;
  CLS: number | null;
  TTFB: number | null;
  FCP: number | null;
  WhiteScreen: number | null;
}

export default function SimpleWebVitalsMonitor() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    FCP: null,
    WhiteScreen: null
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 如果不显示监控，直接返回
    const showMonitor = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_VITALS === 'true';
    if (!showMonitor) return;

    console.log('开始监控性能指标...');

    // 记录页面加载开始时间
    const pageLoadStart = performance.timeOrigin || Date.now();

    // 监听FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const fcpTime = entry.startTime;
        console.log(`FCP: ${fcpTime}ms`);
        setMetrics((prev) => ({
          ...prev,
          FCP: fcpTime,
          WhiteScreen: fcpTime // 白屏时间通常等同于FCP
        }));
      }
    });

    // 监听LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1]; // 取最后一个LCP事件
        const lcpTime = lastEntry.startTime;

        console.log(`LCP: ${lcpTime}ms`);
        setMetrics((prev) => ({
          ...prev,
          LCP: lcpTime
        }));
      }
    });

    // 监听CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      for (const entry of entries) {
        // 类型断言，因为TypeScript不知道layout-shift条目的具体属性
        const layoutShiftEntry = entry as unknown as {
          value: number;
          hadRecentInput: boolean;
        };

        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          console.log(`当前CLS: ${clsValue}`);
          setMetrics((prev) => ({
            ...prev,
            CLS: clsValue
          }));
        }
      }
    });

    // 监听TTFB (Time To First Byte)
    const navigationObserver = new PerformanceObserver((list) => {
      const navEntries = list.getEntries();
      for (const entry of navEntries) {
        // 类型断言，因为TypeScript不知道navigation条目的具体属性
        const navEntry = entry as unknown as {
          responseStart: number;
        };

        const ttfb = navEntry.responseStart;
        console.log(`TTFB: ${ttfb}ms`);
        setMetrics((prev) => ({
          ...prev,
          TTFB: ttfb
        }));
      }
    });

    // 监听FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        // 类型断言，因为TypeScript不知道first-input条目的具体属性
        const firstInputEntry = entry as unknown as {
          processingStart: number;
          startTime: number;
        };

        const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
        console.log(`FID: ${fid}ms`);
        setMetrics((prev) => ({
          ...prev,
          FID: fid
        }));
      }
    });

    // 开始观察各种性能指标
    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      navigationObserver.observe({ type: 'navigation', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });

      console.log('所有性能观察器已启动');
    } catch (e) {
      console.error('无法启动性能观察器:', e);
    }

    // 组件卸载时断开连接
    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      navigationObserver.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  // 检查环境变量和自定义开关
  const showMonitor = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_VITALS === 'true';
  if (!showMonitor) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '14px',
        maxWidth: '300px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>Web Vitals 监控</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          {isVisible ? '隐藏' : '显示'}
        </button>
      </div>

      {isVisible && (
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px' }}>
          <div>LCP:</div>
          <div>{metrics.LCP ? `${Math.round(metrics.LCP)}ms` : "等待中..."}</div>

          <div>FCP:</div>
          <div>{metrics.FCP ? `${Math.round(metrics.FCP)}ms` : "等待中..."}</div>

          <div>TTFB:</div>
          <div>{metrics.TTFB ? `${Math.round(metrics.TTFB)}ms` : "等待中..."}</div>

          <div>CLS:</div>
          <div>{metrics.CLS !== null ? metrics.CLS.toFixed(4) : "等待中..."}</div>

          <div>FID:</div>
          <div>{metrics.FID ? `${Math.round(metrics.FID)}ms` : "等待中..."}</div>

          <div style={{color: '#ffcc00'}}>白屏时间:</div>
          <div style={{color: '#ffcc00'}}>
            {metrics.WhiteScreen ? `${Math.round(metrics.WhiteScreen)}ms` : "等待中..."}
          </div>
        </div>
      )}

      <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
        注意: 开发环境下的指标可能不准确，生产环境更可靠。
      </div>
    </div>
  );
}