// lib/mask-service.ts
import { WorkerInputMessage, WorkerOutputMessage } from "./segmentation-worker";

let workerInstance: Worker | null = null;
const pendingResolvers = new Map<
  string,
  { resolve: (url: string) => void; reject: (err: Error) => void }
>();

// A unique name for your cache storage
const CACHE_NAME = "holo-masks-v1";

/**
 * Checks the browser cache for an existing mask.
 * Returns a temporary local URL if found, or null if not.
 */
export async function getCachedMask(jobId: string): Promise<string | null> {
  if (typeof caches === "undefined") return null;

  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(jobId);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob); // Convert cached blob back to a usable UI string
    }
  } catch (error) {
    console.warn("Cache read failed", error);
  }
  return null;
}

function getWorker(): Worker {
  if (typeof window === "undefined") throw new Error("Cannot run worker on server");

  if (!workerInstance) {
    workerInstance = new Worker(new URL("./segmentation-worker.ts", import.meta.url), {
      type: "module",
    });

    workerInstance.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
      const data = e.data;

      if (data.type === "MASK_READY") {
        const callbacks = pendingResolvers.get(data.jobId);
        if (callbacks) {
          // --- NEW: Save the generated Blob to the browser cache silently ---
          if (typeof caches !== "undefined") {
            caches
              .open(CACHE_NAME)
              .then((cache) => {
                // Wrap the blob in a synthetic Response object to store it
                cache.put(data.jobId, new Response(data.blob));
              })
              .catch(console.warn);
          }

          // Resolve the promise back to React
          callbacks.resolve(URL.createObjectURL(data.blob));
          pendingResolvers.delete(data.jobId);
        }
      } else if (data.type === "ERROR") {
        const callbacks = pendingResolvers.get(data.jobId);
        if (callbacks) {
          callbacks.reject(new Error(data.error));
          pendingResolvers.delete(data.jobId);
        }
      }
    };
  }
  return workerInstance;
}

/**
 * Sends image data to the singleton worker and returns a Promise that resolves
 * when the worker finishes this specific job.
 */
export async function generateCardMask(jobId: string, imageData: ImageData): Promise<string> {
  return new Promise((resolve, reject) => {
    pendingResolvers.set(jobId, { resolve, reject });

    const worker = getWorker();
    const message: WorkerInputMessage = { type: "PROCESS_IMAGE", jobId, imageData };

    worker.postMessage(message);
  });
}
