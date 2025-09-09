export function createMapper<Src, Dest, M extends Partial<Record<keyof Dest, keyof Src>>>(
  map: M,
  derive?: Partial<{ [K in keyof Dest]: (src: Src) => Dest[K] }>
) {
  return (src: Src): Dest => {
    const out: Partial<Dest> = {};
    (Object.keys(map) as Array<keyof Dest>).forEach((dk) => {
      const sk = map[dk];
      if (sk) (out as any)[dk] = (src as any)[sk];
    });
    if (derive) {
      (Object.keys(derive) as Array<keyof Dest>).forEach((dk) => {
        const fn = derive[dk]!;
        (out as any)[dk] = fn(src);
      });
    }
    return out as Dest;
  };
}
export const mapArray =
  <Src, Dest>(fn: (s: Src) => Dest) =>
  (list: Src[]) =>
    list.map(fn);
