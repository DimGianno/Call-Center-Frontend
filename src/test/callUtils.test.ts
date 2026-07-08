import { describe, expect, it } from "vitest";
import type { Call } from "../types";
import { dateKeyToLocalDate, getAvailableCallDates, localDateToDateKey } from "../utils/callUtils";

function createCall(overrides: Partial<Call> = {}): Call {
  return {
    id: "call",
    direction: "inbound",
    from: "+1 555-0000",
    to: "+1 555-9999",
    call_type: "answered",
    duration: 60,
    created_at: "2026-06-07T08:30:00.000Z",
    is_archived: false,
    notes: [],
    ...overrides,
  };
}

describe("getAvailableCallDates", () => {
  it("returns unique call dates sorted newest first with readable labels", () => {
    const availableCallDates = getAvailableCallDates([
      createCall({ id: "call-1", created_at: "2026-06-07T08:30:00.000Z" }),
      createCall({ id: "call-2", created_at: "2026-06-08T09:15:00.000Z" }),
      createCall({ id: "call-3", created_at: "2026-06-07T12:45:00.000Z" }),
      createCall({ id: "call-4", created_at: "2026-06-06T10:00:00.000Z" }),
    ]);

    expect(availableCallDates.map((callDate) => callDate.value)).toEqual([
      "2026-06-08",
      "2026-06-07",
      "2026-06-06",
    ]);
    expect(availableCallDates[0].label).toContain("2026");
    expect(availableCallDates[0].label).not.toBe(availableCallDates[0].value);
  });

  it("returns no date options for an empty call list", () => {
    expect(getAvailableCallDates([])).toEqual([]);
  });

  it("ignores malformed call dates", () => {
    expect(
      getAvailableCallDates([
        createCall({ id: "call-1", created_at: "not-a-date" }),
        createCall({ id: "call-2", created_at: "2026-06-07T08:30:00.000Z" }),
      ]).map((callDate) => callDate.value),
    ).toEqual(["2026-06-07"]);
  });
});

describe("date key conversion helpers", () => {
  it("converts date keys to local Date objects without shifting the calendar day", () => {
    const date = dateKeyToLocalDate("2026-06-07");

    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(7);
  });

  it("converts local Date objects back to date keys", () => {
    expect(localDateToDateKey(new Date(2026, 5, 7))).toBe("2026-06-07");
  });

  it("rejects malformed date keys", () => {
    expect(dateKeyToLocalDate("not-a-date")).toBeNull();
  });
});
