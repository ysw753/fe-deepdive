export function pick<T, K extends readonly (keyof T)[]>(obj: T, keys: K): Pick<T, K[number]> {
  const out = {} as any;
  keys.forEach((k) => {
    if (k in obj) out[k] = (obj as any)[k];
  });
  return out;
}
