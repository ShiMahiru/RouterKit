import { describe, it, expect } from "vitest";
import { formatDate } from "../src/utils/date";

describe("formatDate", () => {
  it("formats a valid date string to YYYY-MM-DD", () => {
    expect(formatDate("2026-01-15")).toBe("2026-01-15");
    expect(formatDate("2026-12-01")).toBe("2026-12-01");
  });

  it("returns input as-is for invalid dates", () => {
    expect(formatDate("not a date")).toBe("not a date");
  });

  it("handles ISO date strings", () => {
    expect(formatDate("2026-07-30T12:00:00Z")).toBe("2026-07-30");
  });
});
