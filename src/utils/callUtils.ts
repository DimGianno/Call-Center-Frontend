import type { Call, CallDirection, CallFilters, CallType, PaginatedCalls } from "../types";
import { formatDateHeader } from "./formatters";

export interface AvailableCallDate {
  value: string;
  label: string;
}

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const defaultFilters = {
  callTypes: {
    answered: true,
    missed: true,
    voicemail: true,
  },
  directions: {
    inbound: true,
    outbound: true,
  },
  dateFrom: "",
  dateTo: "",
  durationMin: "",
  durationMax: "",
} satisfies CallFilters;

export function getActiveFilterCount(filters: CallFilters) {
  let count = 0;

  (Object.keys(defaultFilters.callTypes) as CallType[]).forEach((callType) => {
    if (filters.callTypes[callType] !== defaultFilters.callTypes[callType]) {
      count += 1;
    }
  });

  (Object.keys(defaultFilters.directions) as CallDirection[]).forEach((direction) => {
    if (filters.directions[direction] !== defaultFilters.directions[direction]) {
      count += 1;
    }
  });

  if (filters.dateFrom !== defaultFilters.dateFrom) {
    count += 1;
  }

  if (filters.dateTo !== defaultFilters.dateTo) {
    count += 1;
  }

  if (filters.durationMin !== defaultFilters.durationMin) {
    count += 1;
  }

  if (filters.durationMax !== defaultFilters.durationMax) {
    count += 1;
  }

  return count;
}

export function filterCalls(calls: Call[], filters: CallFilters) {
  return calls.filter((call) => {
    const matchesCallType = filters.callTypes[call.call_type];
    const matchesDirection = filters.directions[call.direction];

    const callDate = call.created_at.slice(0, 10);

    const matchesDateFrom = filters.dateFrom === "" || callDate >= filters.dateFrom;

    const matchesDateTo = filters.dateTo === "" || callDate <= filters.dateTo;

    const durationMin = Number(filters.durationMin);
    const durationMax = Number(filters.durationMax);

    const matchesDurationMin = filters.durationMin === "" || call.duration >= durationMin;

    const matchesDurationMax = filters.durationMax === "" || call.duration <= durationMax;

    return (
      matchesCallType &&
      matchesDirection &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesDurationMin &&
      matchesDurationMax
    );
  });
}

export function sortCallsNewestFirst(calls: Call[]) {
  return [...calls].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function paginateCalls(
  calls: Call[],
  currentPage: number,
  pageSize: number,
): PaginatedCalls {
  const totalPages = Math.max(1, Math.ceil(calls.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentPageCalls = calls.slice(startIndex, endIndex);

  return {
    totalPages,
    startIndex,
    endIndex,
    currentPageCalls,
  };
}

export function groupCallsByDate(calls: Call[]) {
  return calls.reduce<Record<string, Call[]>>((groups, call) => {
    const dateKey = call.created_at.slice(0, 10);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(call);

    return groups;
  }, {});
}

export function getAvailableCallDates(calls: Call[]): AvailableCallDate[] {
  const uniqueDates = new Set<string>();

  calls.forEach((call) => {
    const dateKey = call.created_at.slice(0, 10);

    if (dateKeyPattern.test(dateKey)) {
      uniqueDates.add(dateKey);
    }
  });

  return Array.from(uniqueDates)
    .sort((firstDate, secondDate) => secondDate.localeCompare(firstDate))
    .map((dateKey) => {
      return {
        value: dateKey,
        label: formatDateHeader(dateKey),
      };
    });
}

export function dateKeyToLocalDate(dateKey: string): Date | null {
  if (!dateKeyPattern.test(dateKey)) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function localDateToDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function searchCallsByPhoneNumber(calls: Call[], searchTerm: string) {
  const normalizedSearchTerm = searchTerm.replace(/\D/g, "");

  if (normalizedSearchTerm === "") {
    return calls;
  }

  return calls.filter((call) => {
    const normalizedFrom = call.from.replace(/\D/g, "");
    const normalizedTo = call.to.replace(/\D/g, "");

    return (
      normalizedFrom.includes(normalizedSearchTerm) || normalizedTo.includes(normalizedSearchTerm)
    );
  });
}
