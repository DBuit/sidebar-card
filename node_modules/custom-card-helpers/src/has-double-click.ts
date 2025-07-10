import { ActionConfig } from "./types";

// Check if config or Entity changed
export function hasDoubleClick(config?: ActionConfig): boolean {
  return config !== undefined && config.action !== "none";
}