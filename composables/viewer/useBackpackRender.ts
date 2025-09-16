import canvasSize from 'canvas-size';
import { elementToSVG, inlineResources } from 'dom-to-svg';
import type { RuntimeConfig } from 'nuxt/schema';
import { h, render } from 'vue';

import BackpackExportWrapper from '~/components/viewer/utils/BackpackExportWrapper.vue';

const copyStyles = (sourceDoc: Document, targetDoc: Document): void => {
  for (const styleSheet of Array.from(sourceDoc.styleSheets)) {
    if (styleSheet.cssRules) {
      // for <style> elements
      const nwStyleElement = sourceDoc.createElement('style');

      for (const cssRule of Array.from(styleSheet.cssRules)) {
        // write the text of each rule into the body of the style element
        nwStyleElement.append(sourceDoc.createTextNode(cssRule.cssText));
      }

      targetDoc.head.append(nwStyleElement);
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const nwLinkElement = sourceDoc.createElement('link');

      nwLinkElement.rel = 'stylesheet';
      nwLinkElement.href = styleSheet.href;
      targetDoc.head.append(nwLinkElement);
    }
  }
};

const createFrame = (config: RuntimeConfig): Promise<HTMLIFrameElement> =>
  new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.style.visibility = 'hidden';
    frame.loading = 'eager';
    frame.src = `${config.app.baseURL}export.html`;
    frame.addEventListener('load', () => {
      resolve(frame);
    });
    frame.addEventListener('error', (e) => {
      reject(e);
    });
    document.body.appendChild(frame);
  });

const createWindow = (config: RuntimeConfig): Promise<Window> =>
  new Promise((resolve, reject) => {
    const exportPage = `${config.app.baseURL}export.html`;
    const wRef = window.open(exportPage, '_blank');
    if (!wRef) {
      reject(new Error('Failed to create window'));
      return;
    }

    wRef.addEventListener('load', () => {
      resolve(wRef);
    });
  });

const maxCanvasSize = async (size: number) => {
  const { width, height } = await canvasSize.maxArea({
    max: size,
    usePromise: true,
  });
  return { width, height };
};

export function useBackpackRender() {
  const config = useRuntimeConfig();
  const $toast = useToast();

  const renderBackpack = (doc: Document): HTMLElement => {
    copyStyles(window.document, doc);
    doc.documentElement.classList.add('dark-theme');

    const vNode = h(BackpackExportWrapper, {});
    render(vNode, doc.body);
    return doc.getElementById('backpack')!;
  };

  const createSVG = async (node: HTMLElement): Promise<Blob> => {
    // Convert backpack to SVG
    const svgDocument = elementToSVG(node);
    // Inline external resources (fonts, images, etc) as data: URIs
    await inlineResources(svgDocument.documentElement);
    // Get SVG string
    const svgString = new XMLSerializer().serializeToString(svgDocument);
    // Create a Blob from the SVG string
    return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  };

  const createImage = async (url: string): Promise<HTMLImageElement> => {
    const img = new Image();
    // set the image src to the URL of the Blob
    img.src = url;
    // Wait until the image has loaded
    await img.decode();
    return img;
  };

  const renderImage = async (img: HTMLImageElement): Promise<string> => {
    // Create a canvas to draw the image to
    const canvas = document.createElement('canvas');
    // Ensure the image size is not too large for the canvas
    const { width, height } = await maxCanvasSize(
      Math.max(img.naturalWidth, img.naturalHeight),
    );
    // Set canvas dimensions to match the image
    canvas.width = Math.min(width, img.naturalWidth);
    canvas.height = Math.min(height, img.naturalHeight);
    const ctx = canvas.getContext('2d')!;
    // Draw the image to the canvas
    ctx.drawImage(img, 0, 0);
    // Get the image data as a PNG string
    const url = canvas.toDataURL('image/png');
    // Remove the canvas
    canvas.remove();

    return url;
  };

  const downloadImage = async (url: string) => {
    // Create a link element to download the image
    const element = document.createElement('a');
    // Set the download link href and download attribute
    element.href = url;
    element.download = `backpack-${new Date().toLocaleString()}.png`;

    // Click the link to download the image
    await nextTick(() => {
      element.click();
    });
    // Remove the element once downloaded
    element.remove();
  };

  const exportToImage = async () => {
    // const toastGenerateImage = $toast.info('Generating image...', {
    //   timeout: false,
    // });

    // Render the backpack inside a hidden iframe
    const frame = await createFrame(config);
    const node = renderBackpack(frame.contentDocument!);
    // Wait for the renderer to catch up
    await nextTick();

    // Render the frame body into an image using SVG and canvas
    const svg = await createSVG(node);
    // Create a data URL for the image blob
    const svgURL = URL.createObjectURL(svg);
    const img = await createImage(svgURL);
    const imgURL = await renderImage(img);

    // $toast.dismiss(toastGenerateImage);

    // Ensure the URL is valid before trying to download it
    if (!imgURL.startsWith('data:image/png')) {
      // $toast.error('Failed to generate backpack image.');
    } else {
      // $toast.success('Backpack image generated');
      await downloadImage(imgURL);
    }

    // Clean up the svg URL after download
    URL.revokeObjectURL(svgURL);
    frame.remove();
  };

  const exportToHtml = async () => {
    const win = await createWindow(config);
    renderBackpack(win.document);
  };

  return { exportToHtml, exportToImage };
}
