import { twMerge } from "tailwind-merge";

globalThis.classes = function (...inputs) {
  return twMerge(...inputs);
};
