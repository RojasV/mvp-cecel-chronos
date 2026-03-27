import { WATCH_STATUS, type WatchStatus } from "@/shared/constants";

const VALID_TRANSITIONS: Record<WatchStatus, WatchStatus[]> = {
  draft: ["available"],
  available: ["reserved", "sold", "draft", "consigned"],
  reserved: ["available", "sold"],
  sold: [],
  consigned: ["available", "sold", "draft"],
};

export function canTransition(
  from: WatchStatus,
  to: WatchStatus,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function getNextStatuses(current: WatchStatus): WatchStatus[] {
  return VALID_TRANSITIONS[current];
}

export function isPublishable(status: WatchStatus): boolean {
  return status === WATCH_STATUS.AVAILABLE;
}
