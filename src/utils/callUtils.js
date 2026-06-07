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
};

export function getActiveFilterCount(filters) {
  let count = 0;

  Object.keys(defaultFilters.callTypes).forEach((callType) => {
    if (filters.callTypes[callType] !== defaultFilters.callTypes[callType]) {
      count += 1;
    }
  });

  Object.keys(defaultFilters.directions).forEach((direction) => {
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

export function filterCalls(calls, filters) {
  return calls.filter((call) => {
    const matchesCallType = filters.callTypes[call.call_type];
    const matchesDirection = filters.directions[call.direction];

    const callDate = call.created_at.slice(0, 10);

    const matchesDateFrom =
      filters.dateFrom === "" || callDate >= filters.dateFrom;

    const matchesDateTo =
      filters.dateTo === "" || callDate <= filters.dateTo;

    const durationMin = Number(filters.durationMin);
    const durationMax = Number(filters.durationMax);

    const matchesDurationMin =
      filters.durationMin === "" || call.duration >= durationMin;

    const matchesDurationMax =
      filters.durationMax === "" || call.duration <= durationMax;

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

export function sortCallsNewestFirst(calls) {
  return [...calls].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

export function paginateCalls(calls, currentPage, pageSize) {
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

export function groupCallsByDate(calls) {
  return calls.reduce((groups, call) => {
    const dateKey = call.created_at.slice(0, 10);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(call);

    return groups;
  }, {});
}

export function searchCallsByPhoneNumber(calls, searchTerm) {
  const normalizedSearchTerm = searchTerm.replace(/\D/g, "");

  if (normalizedSearchTerm === "") {
    return calls;
  }

  return calls.filter((call) => {
    const normalizedFrom = call.from.replace(/\D/g, "");
    const normalizedTo = call.to.replace(/\D/g, "");

    return (
      normalizedFrom.includes(normalizedSearchTerm) ||
      normalizedTo.includes(normalizedSearchTerm)
    );
  });
}
