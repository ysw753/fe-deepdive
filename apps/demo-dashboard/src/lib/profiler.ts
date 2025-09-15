export function logRender(name: string, extra?: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] 🔄 Render: ${name}`, extra ?? '');
  }
}
