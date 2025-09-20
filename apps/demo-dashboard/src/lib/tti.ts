import ttiPolyfill from 'tti-polyfill';

export function reportTTI() {
  ttiPolyfill.getFirstConsistentlyInteractive().then((tti) => {
    console.log('[TTI]', tti, 'ms');
  });
}
