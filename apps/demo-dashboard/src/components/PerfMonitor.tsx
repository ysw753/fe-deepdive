'use client';

import { useEffect } from 'react';
import { initWebVitalsLogging } from '@/lib/metrics';
import { startFPSMeter, stopFPSMeter } from '@/lib/fpsMeter';
import { reportTTI } from '@/lib/tti';

export function PerfMonitor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initWebVitalsLogging();
    startFPSMeter();
    reportTTI();
    return () => stopFPSMeter();
  }, []);

  return <>{children}</>;
}
