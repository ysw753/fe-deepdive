declare module 'tti-polyfill' {
  const ttiPolyfill: {
    getFirstConsistentlyInteractive(): Promise<number>;
  };
  export default ttiPolyfill;
}
