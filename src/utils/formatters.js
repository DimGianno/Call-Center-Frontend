export function formatDateHeader(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatCallTime(createdAt) {
  return new Date(createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCallDateTime(createdAt) {
  return new Date(createdAt).toLocaleString("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
