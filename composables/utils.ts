export const timeIt =
  (name: string) =>
  <T>(blk: () => T): T => {
    const start = Date.now();
    try {
      return blk();
    } finally {
      const end = Date.now();
      console.log(`[TIME] ${name}: ${end - start}ms`);
    }
  };
