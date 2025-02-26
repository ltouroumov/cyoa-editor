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

export const bufferToHex = (buffer: ArrayBuffer): string => {
  const buf = new Uint8Array(buffer);
  const acc = [];
  for (let i = 0; i < buf.length; i++) {
    acc.push(buf[i].toString(16).padStart(2, '0'));
  }
  return acc.join('');
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

export const stringToBuffer = (value: string): Uint8Array => {
  return textEncoder.encode(value);
};
export const bufferToString = (buffer: ArrayBuffer) => {
  return textDecoder.decode(buffer);
};

export const readFileContents = (file: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', (event) => {
      event.preventDefault();
      reject(new Error('Reader Failed'));
    });

    try {
      reader.readAsText(file);
    } catch (e: unknown) {
      reject(e);
    }
  });
};
