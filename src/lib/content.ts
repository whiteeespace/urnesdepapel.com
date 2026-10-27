import type { Shape } from "@/payload/collections/Models";
import type { Media, Model } from "@/payload-types";

// Splits a textarea into paragraphs on blank lines.
export const toParagraphs = (text: string | null | undefined): string[] =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const asMedia = (value: number | Media | null | undefined): Media | undefined =>
  value && typeof value === "object" && value.url ? value : undefined;

export const asModel = (value: number | Model | null | undefined): Model | undefined =>
  value && typeof value === "object" ? value : undefined;

// Urn numbers are shown as two digits next to the collection name, e.g. "23 papillon".
export const padNumber = (number: number): string => String(number).padStart(2, "0");

export const shapeOf = (model: Model | undefined): Shape => model?.shape ?? "anemone";
