export async function downloadFile(
  fileURL: string,
  setProgress: (
    progress:
      | { type: 'stream'; bytes: number }
      | { type: 'decode'; bytes: number; total: number },
  ) => Promise<void>,
): Promise<
  { error: true; status: number } | { ok: true; data: Uint8Array<ArrayBuffer> }
> {
  const response = await fetch(fileURL);
  if (response.ok) {
    const reader = response.body!.getReader();

    let received = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;
      await setProgress({ type: 'stream', bytes: received });
    }

    await setProgress({ type: 'decode', bytes: 0, total: received });
    const bodyBytes = new Uint8Array(received);
    let pos = 0;
    for (const chunk of chunks) {
      bodyBytes.set(chunk, pos);
      pos += chunk.length;
      await setProgress({ type: 'decode', bytes: pos, total: received });
    }

    await setProgress({ type: 'decode', bytes: received, total: received });
    return { ok: true, data: bodyBytes };
  } else {
    console.log(
      `HTTP Request failed with ${response.status}: ${response.statusText}`,
    );
    return { error: true, status: response.status };
  }
}
