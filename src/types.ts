export type Theme = "dark" | "light";

export type AuthMode = "login" | "signup";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export type DemoUser = SignupCredentials;

export interface AuthSession {
  name: string;
  email: string;
  startedAt: number;
}

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
