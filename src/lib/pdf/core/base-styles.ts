import { UserOptions } from "jspdf-autotable";

export const REPORT_COLORS = {
  PRIMARY: [17, 98, 174] as [number, number, number], // Pixel Perfect Blue
  TEXT_DARK_BLUE: [17, 98, 174] as [number, number, number],
  SECONDARY: [80, 80, 80] as [number, number, number], // Grey
  HEADER_BG: [255, 255, 255] as [number, number, number], // White header
  TEXT: [0, 0, 0] as [number, number, number],
  TITLE_RED: [180, 0, 0] as [number, number, number],
  LINE_GRAY: [180, 180, 180] as [number, number, number],
  STRIPE_GRAY: [248, 248, 248] as [number, number, number],
};

export const DEFAULT_TABLE_STYLES: UserOptions = {
  styles: {
    font: "helvetica",
    fontSize: 8,
    cellPadding: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 },
    textColor: [0, 0, 0],
    lineWidth: 0,
    valign: "middle",
    halign: "left",
    minCellHeight: 9.3,
  },
  headStyles: {
    fillColor: [255, 255, 255],
    textColor: [0, 0, 0],
    fontStyle: "bold",
    halign: "left",
    lineWidth: { top: 0, bottom: 0.1, left: 0, right: 0 },
    lineColor: [180, 180, 180],
  },
  alternateRowStyles: {
    fillColor: [248, 248, 248],
  },
  margin: { top: 25, bottom: 12, left: 10, right: 10 },
};
