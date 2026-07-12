export type Theme = "dark" | "light";

export type AuthMode = "login" | "signup";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  email_verification_required_at: string | null;
  email_verification_sent_at: string | null;
  created_at?: string;
}

export interface EmailVerificationStatus {
  verified: boolean;
  verifiedAt: string | null;
  requiredAt: string | null;
  gracePeriodExpired: boolean;
}

export interface AuthSession {
  user: AuthUser;
  name: string;
  email: string;
  emailVerification: EmailVerificationStatus;
  sessionExpiresAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken?: string;
  emailVerification: EmailVerificationStatus;
  sessionExpiresAt: string;
}

export type TutorialTopicId = "full" | "seeding" | "ui" | "call-feed" | "call-item";

export type TutorialTargetId =
  | "dashboard-layout"
  | "seed-calls"
  | "stats-cards"
  | "call-feed"
  | "search-control"
  | "page-size-control"
  | "view-toggle-button"
  | "bulk-action-button"
  | "pagination-controls"
  | "call-card"
  | "call-details"
  | "call-details-summary"
  | "note-delete-actions"
  | "call-update-actions"
  | "note-field"
  | "filters-button"
  | "filter-modal"
  | "filter-close-button"
  | "session-timer"
  | "account-button"
  | "account-drawer"
  | "account-close-button"
  | "call-date-groups"
  | "reset-data-button";

export type TutorialEventId =
  | "account-closed"
  | "account-opened"
  | "archived-view-opened"
  | "call-details-opened"
  | "filters-closed"
  | "filters-opened"
  | "note-typed"
  | "page-size-changed"
  | "search-typed";

export interface TutorialState {
  version: number;
  hasSeenWelcome: boolean;
  completedAt: string | null;
  skippedAt: string | null;
  completedTopics: string[];
  newTopics: string[];
}

export type TutorialStateUpdate = Partial<TutorialState>;

export type CallDirection = "inbound" | "outbound";

export type CallType = "answered" | "missed" | "voicemail";

export type CallView = "active" | "archived";

export interface CallNote {
  id: string;
  content: string;
}

export interface Call {
  id: string;
  direction: CallDirection;
  from: string;
  to: string;
  call_type: CallType;
  duration: number;
  created_at: string;
  is_archived: boolean;
  notes?: CallNote[];
}

export interface CallFilters {
  callTypes: Record<CallType, boolean>;
  directions: Record<CallDirection, boolean>;
  dateFrom: string;
  dateTo: string;
  durationMin: string;
  durationMax: string;
}

export interface PaginatedCalls {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentPageCalls: Call[];
}

export interface CallsPageResponse {
  calls: Call[];
  pagination?: {
    totalPages?: number;
  };
}

export interface ResetCallsResult {
  message?: string;
  deletedCount?: number;
  insertedCount?: number;
}

export type ToastType = "success" | "error";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export type ShowToast = (message: string, type?: ToastType) => void;

export type OpenConfirmDialog = (dialogConfig: ConfirmDialogConfig) => void;
