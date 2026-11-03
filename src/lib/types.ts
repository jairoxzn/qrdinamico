export type UserRole = "ADMIN" | "CLIENT";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type QRStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type NfcStatus = "UNASSIGNED" | "ASSIGNED" | "INACTIVE";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company?: string | null;
  phone?: string | null;
  maxQRs: number;
}

export interface QRCodeItem {
  id: string;
  shortCode: string;
  title: string;
  description?: string | null;
  category?: string | null;
  destinationUrl: string;
  status: QRStatus;
  scanCount: number;
  lastScannedAt?: string | null;
  fgColor: string;
  bgColor: string;
  dotStyle: string;
  cornerSquareStyle: string;
  logoUrl?: string | null;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  };
  nfcCards?: {
    id: string;
    uid: string;
    label: string;
    model: string;
    status: NfcStatus;
  }[];
  _count?: {
    scans: number;
    nfcCards: number;
    history: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NfcCardItem {
  id: string;
  uid: string;
  label: string;
  model: string;
  batch?: string | null;
  status: NfcStatus;
  qrCodeId?: string | null;
  qrCode?: {
    id: string;
    shortCode: string;
    title: string;
    destinationUrl: string;
    status: QRStatus;
  } | null;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  };
  lastTappedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScanLogItem {
  id: string;
  qrCodeId: string;
  ipHash?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  referer?: string | null;
  userAgent?: string | null;
  country?: string | null;
  city?: string | null;
  source?: string | null;
  scannedAt: string;
  qrCode?: {
    id: string;
    title: string;
    shortCode: string;
  };
}

export interface DestinationHistoryItem {
  id: string;
  qrCodeId: string;
  oldUrl: string;
  newUrl: string;
  changedById: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  reason?: string | null;
  createdAt: string;
  qrCode?: {
    id: string;
    title: string;
    shortCode: string;
  };
}

