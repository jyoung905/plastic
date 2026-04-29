import type { ContentItem, VisualCheckStatus } from "@/lib/types";

export interface VisualCheckResult {
  status: VisualCheckStatus;
  warnings: string[];
}

function getLineCountNote(titlePlacement: string) {
  const match = titlePlacement.match(/(\d+)\s*lines?/i);
  return match ? Number(match[1]) : null;
}

export function checkVisualTitlePlacement(
  coverTitle: string,
  titlePlacement: string,
): VisualCheckResult {
  const warnings: string[] = [];
  const normalized = titlePlacement.trim().toLowerCase();
  const titleLength = coverTitle.trim().length;
  const lineCount = getLineCountNote(titlePlacement);

  if (titleLength > 36) {
    warnings.push("Cover title is over 36 characters.");
  }

  if (normalized.includes("top 15%")) {
    warnings.push("Placement enters the top 15 percent of the frame.");
  }

  if (normalized.includes("bottom 20%")) {
    warnings.push("Placement enters the bottom 20 percent where UI overlap is likely.");
  }

  if (normalized.includes("center face")) {
    warnings.push("Placement should avoid center-face coverage.");
  }

  if (
    !normalized.includes("contrast") &&
    !normalized.includes("shadow") &&
    !normalized.includes("outline")
  ) {
    warnings.push("Add a contrast note for text readability.");
  }

  if (lineCount !== null && lineCount > 2) {
    warnings.push("Keep the title to two lines or fewer.");
  }

  const safePlacement =
    normalized.includes("upper third") ||
    normalized.includes("lower third above ui") ||
    (normalized.includes("side") && !normalized.includes("face"));

  if (!safePlacement) {
    warnings.push(
      "Recommended placement is upper third, lower third above UI, or side placement away from the face.",
    );
  }

  const severe =
    normalized.includes("center face") ||
    (normalized.includes("top 15%") && normalized.includes("bottom 20%")) ||
    warnings.length >= 4;

  return {
    status: severe ? "fail" : warnings.length > 0 ? "warning" : "pass",
    warnings,
  };
}

export function applyVisualCheck(item: ContentItem): ContentItem {
  const result = checkVisualTitlePlacement(item.coverTitle, item.titlePlacement);

  return {
    ...item,
    visualCheckStatus: result.status,
    visualWarnings: result.warnings,
  };
}
