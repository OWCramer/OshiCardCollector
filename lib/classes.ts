import { twMerge } from "tailwind-merge";

export function classes(...inputs: (string | false | null | undefined)[]) {
  return twMerge(...inputs);
}
