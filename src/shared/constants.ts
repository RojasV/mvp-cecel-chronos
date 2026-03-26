export const WATCH_STATUS = {
  DRAFT: "draft",
  AVAILABLE: "available",
  RESERVED: "reserved",
  SOLD: "sold",
  CONSIGNED: "consigned",
} as const;
export type WatchStatus = (typeof WATCH_STATUS)[keyof typeof WATCH_STATUS];

export const WATCH_CONDITION = {
  NEW: "new",
  UNWORN: "unworn",
  EXCELLENT: "excellent",
  VERY_GOOD: "very_good",
  GOOD: "good",
  FAIR: "fair",
} as const;
export type WatchCondition =
  (typeof WATCH_CONDITION)[keyof typeof WATCH_CONDITION];

export const USER_ROLE = {
  OWNER: "owner",
  OPERATOR: "operator",
  READONLY: "readonly",
  FINANCE: "finance",
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const ACQUISITION_TYPE = {
  DIRECT_PURCHASE: "direct_purchase",
  CONSIGNMENT: "consignment",
  TRADE: "trade",
} as const;
export type AcquisitionType =
  (typeof ACQUISITION_TYPE)[keyof typeof ACQUISITION_TYPE];

export const CLIENT_STATUS = {
  LEAD: "lead",
  ACTIVE: "active",
  RECURRING: "recurring",
  INACTIVE: "inactive",
} as const;
export type ClientStatus =
  (typeof CLIENT_STATUS)[keyof typeof CLIENT_STATUS];

export const FINANCIAL_DIRECTION = {
  INFLOW: "inflow",
  OUTFLOW: "outflow",
} as const;
export type FinancialDirection =
  (typeof FINANCIAL_DIRECTION)[keyof typeof FINANCIAL_DIRECTION];

export const FINANCIAL_CATEGORY = {
  REVENUE_SALE: "revenue_sale",
  REVENUE_COMMISSION: "revenue_commission",
  COGS_PURCHASE: "cogs_purchase",
  COGS_REFURBISHMENT: "cogs_refurbishment",
  COGS_SHIPPING: "cogs_shipping",
  OPEX_MARKETING: "opex_marketing",
  OPEX_PLATFORM: "opex_platform",
  OPEX_STAFF: "opex_staff",
  OPEX_OFFICE: "opex_office",
  OPEX_OTHER: "opex_other",
  TAX_INCOME: "tax_income",
  TAX_SALES: "tax_sales",
  TAX_OTHER: "tax_other",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
} as const;
export type FinancialCategory =
  (typeof FINANCIAL_CATEGORY)[keyof typeof FINANCIAL_CATEGORY];

export const MARKETING_FORMAT = {
  PHOTO_DESCRIPTION: "photo_description",
  PREMIUM_CARD: "premium_card",
  VISUAL_ART: "visual_art",
} as const;
export type MarketingFormat =
  (typeof MARKETING_FORMAT)[keyof typeof MARKETING_FORMAT];

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  draft: "Rascunho",
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
  consigned: "Consignado",
};

export const WATCH_CONDITION_LABELS: Record<WatchCondition, string> = {
  new: "Novo",
  unworn: "Nunca Usado",
  excellent: "Excelente",
  very_good: "Muito Bom",
  good: "Bom",
  fair: "Regular",
};
