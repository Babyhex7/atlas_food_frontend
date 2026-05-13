export const exportFormats = {
  csv: "csv",
  json: "json",
} as const;

export type ExportFormat = (typeof exportFormats)[keyof typeof exportFormats];
