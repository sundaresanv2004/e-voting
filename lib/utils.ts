import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyToClipboard(text: string): Promise<boolean> {
  // First try the modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("navigator.clipboard.writeText failed, falling back to document.execCommand", error);
    }
  }

  // Fallback for insecure contexts (HTTP) or when navigator.clipboard fails
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Prevent scrolling and ensure it's visually hidden
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (error) {
    console.error("Fallback clipboard copy failed", error);
    return false;
  }
}
