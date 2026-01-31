export interface SearchFilter {
  field: string; // e.g., "systemId"
  operator: number; // backend enum code (configure in OP below)
  value: string | Array<string | number>; // use string payload (encode arrays/ranges if needed)
}

export type RequestPayload = {
  pageSize: number;
  pageIndex: number;
  searchFilters: SearchFilter[];
  sortBy: string | null;
} & Record<string, unknown>;

export interface FileDto {
  id: string;
  url: string;
  fileType: number;
  fullName: string;
}

export interface AllocationRequestItemDto {
  id: number;
  systemId: string;
  subject: string;
  month: number;
  allocatedBudgetActivityId: number;
  allocatedBudgetActivityTitle: string;
  costCenterId: number;
  costCenterTitle: string;
  consumptionPlaceId: number;
  consumptionPlaceTitle: string;
  requestedVolume: number;
  requestedCredit: number;
  requestedCapitaPerUnit: number;
  usedVolume: number;
  usedCredit: number;
  allocatedBudgetActivityVolume: number;
  allocatedBudgetActivityCredit: number;
  allocatedBudgetActivityCapitaPerUnit: number;
  remainingVolume: number;
  remainingCredit: number;
  sendForBudgetReviewRequired: boolean;
  expertProposedVolume: number;
  expertProposedCredit: number;
  approvedVolume: number;
  approvedCredit: number;
  paymentMethod: number;
  sendForBudgetReview: boolean;
  files: FileDto[];
  recentAllocationRequestItems: Array<{
    id: number;
    allocationRequestId: number;
    systemId: string;
    subject: string;
    requestedVolume: number;
    requestedCredit: number;
    approvedVolume: number;
    approvedCredit: number;
    status: number;
    flowStatus: number;
  }>;
}

export interface AllocationRequestDto {
  id: number;
  button: any;
  createdOn: string; // ISO
  sendToHeadOfBudgetDepartmentOn: string | null;
  createdById: number;
  createdByFullName: string;
  systemId: string;
  fiscalYearId: number;
  isCumulative: boolean;
  subject: string;
  costCenterOperatorPositionIds: string[];
  month: number;
  paymentMethod: number;
  files: FileDto[];
  excelFile: FileDto | null;
  priority: number;
  status: number;
  flowStatus: number;
  userFlowStatus: number;
  isCurrentUserFlowStatus: boolean;
  canEdit: boolean;
  canReturnForRevision: boolean;
  showExtraActionFields: boolean;
  allowedActions: number[];
  defaultAction: number;
  currentFlowHistoryId: number | null;
  costCenterId: number;
  costCenterTitle: string;
  requestedVolume: number;
  requestedCredit: number;
  expertProposedVolume: number;
  expertProposedCredit: number;
  approvedVolume: number;
  approvedCredit: number;
  items: AllocationRequestItemDto[];
  allocationRequestFlowsHistory: Array<{
    id: number;
    actionById: number;
    actionByFullName: string;
    flowStatus: number;
    currentFlowStatusUserFullName: string;
    action: number;
    receivedOn: string;
    viewOn: string | null;
    actionOn: string | null;
  }>;
  descriptions: Array<{
    id: number;
    systemId: string;
    createdOn: string;
    createdById: number;
    createdByFullName: string;
    description: string;
    canEdit: boolean;
    canDelete: boolean;
    files: FileDto[];
    allocationRequestItemId: number | null;
    allocationRequestFlowHistoryId: number | null;
  }>;
}

export interface ApiResponse<T> {
  failed: boolean;
  message: string | null;
  succeeded: boolean;
  code: number;
  data: T;
  metadata: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    parameters?: Record<string, string>;
  };
}
