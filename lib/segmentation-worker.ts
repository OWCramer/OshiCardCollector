// lib/segmentation-worker.ts
import { FilesetResolver, InteractiveSegmenter } from "@mediapipe/tasks-vision";

export type WorkerInputMessage = {
  type: "PROCESS_IMAGE";
  jobId: string;
  imageData: ImageData;
};

export type WorkerOutputMessage =
  | { type: "READY" }
  | { type: "MASK_READY"; jobId: string; blob: Blob }
  | { type: "ERROR"; jobId: string; error: string };

let segmenter: InteractiveSegmenter | null = null;
let pendingJobs: Array<{ jobId: string; imageData: ImageData }> = [];

async function initSegmenter() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    segmenter = await InteractiveSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/magic_touch.tflite",
        delegate: "GPU",
      },
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });

    postMessage({ type: "READY" } satisfies WorkerOutputMessage);

    if (pendingJobs.length > 0) {
      for (const job of pendingJobs) {
        await processImage(job.jobId, job.imageData);
      }
      pendingJobs = [];
    }
  } catch (error: any) {
    console.error("Worker initialization failed:", error);
  }
}

initSegmenter();

self.onmessage = async (e: MessageEvent<WorkerInputMessage>) => {
  if (e.data.type === "PROCESS_IMAGE") {
    if (!segmenter) {
      pendingJobs.push({ jobId: e.data.jobId, imageData: e.data.imageData });
      return;
    }
    await processImage(e.data.jobId, e.data.imageData);
  }
};

async function processImage(jobId: string, imageData: ImageData) {
  if (!segmenter) return;

  try {
    const result = segmenter.segment(imageData, {
      scribble: [
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.35 },
        { x: 0.5, y: 0.65 },
        { x: 0.35, y: 0.5 },
        { x: 0.65, y: 0.5 },
      ],
    });

    if (!result.confidenceMasks || result.confidenceMasks.length === 0) {
      throw new Error("No mask generated");
    }

    const mask = result.confidenceMasks[0].getAsFloat32Array();
    const width = imageData.width;
    const height = imageData.height;

    const offscreen = new OffscreenCanvas(width, height);
    const ctx = offscreen.getContext("2d");
    if (!ctx) throw new Error("No canvas context");

    const newImageData = ctx.createImageData(width, height);

    for (let i = 0; i < mask.length; ++i) {
      const confidence = mask[i];
      const index = i * 4;

      const isSubject = confidence > 0.1;

      // RGB set to BLACK (0, 0, 0)
      newImageData.data[index] = 0;
      newImageData.data[index + 1] = 0;
      newImageData.data[index + 2] = 0;

      // ALPHA LOGIC:
      // Subject (The Character) -> Transparent (0)
      // Background (Not the character) -> Opaque (255)
      newImageData.data[index + 3] = isSubject ? 0 : 255;
    }

    ctx.putImageData(newImageData, 0, 0);

    // Final clean-up filter to keep edges tight and fill small background noise
    ctx.globalCompositeOperation = "copy";
    ctx.filter = "blur(1.2px) contrast(300%)";
    ctx.drawImage(offscreen, 0, 0);

    const blob = await offscreen.convertToBlob({ type: "image/webp" });
    postMessage({ type: "MASK_READY", jobId, blob } satisfies WorkerOutputMessage);
  } catch (error: any) {
    postMessage({ type: "ERROR", jobId, error: error.message } satisfies WorkerOutputMessage);
  }
}
