import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

export function initWebVitalsLogging() {
  if (typeof window === 'undefined') return;

  const log = (name: string) => (metric: Metric) => {
    console.log(`[WebVitals] ${name}:`, metric.value, metric);
  };

  onLCP(log('LCP')); // Largest Contentful Paint
  onFCP(log('FCP')); // First Contentful Paint
  onINP(log('INP')); // Interaction to Next Paint (대체 지표)
  onTTFB(log('TTFB')); // Time To First Byte
  onCLS(log('CLS')); // Cumulative Layout Shift
}
