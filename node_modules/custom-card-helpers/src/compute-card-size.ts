import { LovelaceCard } from "./types";

export const computeCardSize = (card: LovelaceCard): number | Promise<number> => {
  return typeof card.getCardSize === "function" ? card.getCardSize() : 4;
};