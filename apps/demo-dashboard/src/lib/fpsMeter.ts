let running = false;
let frame = 0;
let lastTime = performance.now();
let fps = 0;

export function startFPSMeter() {
  if (running) return;
  running = true;
  frame = 0;
  lastTime = performance.now();

  function loop() {
    if (!running) return;
    frame++;
    const now = performance.now();
    const diff = now - lastTime;
    if (diff >= 1000) {
      fps = Math.round((frame * 1000) / diff);
      console.log('[FPS]', fps);
      frame = 0;
      lastTime = now;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

export function stopFPSMeter() {
  running = false;
}
