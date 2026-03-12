export interface AddApplicationUserRequestDto {
  name?: string | null;
  email?: string | null;
  plan?: string | null;
}

export interface ApplicationPlanDto {
  name?: string | null;
  description?: string | null;
  billingPeriod?: string | null;
  price: number;
}

export interface ApplicationUserDto {
  id: string;
  applicationId: string;
  name?: string | null;
  email?: string | null;
  origin?: string | null;
  createdAt: string;
  plan?: string | null;
}

export interface ApplicationDto {
  id: string;
  name?: string | null;
  description?: string | null;
  format?: string | null;
  oneShotPrice?: number | null;
  plans?: ApplicationPlanDto[] | null;
  users?: ApplicationUserDto[] | null;
  createdAt: string;
}

export interface ApplicationUserPaymentIssueDto {
  applicationId: string;
  applicationUserId: string;
  applicationName?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  plan?: string | null;
  lastPaymentAt?: string | null;
  nextPaymentDueAt?: string | null;
}

export interface UserDto {
  id: string;
  email?: string | null;
  displayName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AuthResponseDto {
  accessToken?: string | null;
  expiresAtUtc: string;
  user: UserDto;
}

export interface CreateApplicationRequestDto {
  name?: string | null;
  description?: string | null;
  format?: string | null;
  oneShotPrice?: number | null;
  plans?: ApplicationPlanDto[] | null;
}

export interface CreatePaymentEventRequestDto {
  type?: string | null;
  amount: number;
  currency?: string | null;
  occurredAt: string;
  provider?: string | null;
  providerReference?: string | null;
  rawPayload?: string | null;
  nextPaymentDueAt?: string | null;
}

export interface LoginRequestDto {
  email?: string | null;
  password?: string | null;
}

export interface PaymentEventDto {
  id: string;
  applicationId: string;
  applicationUserId: string;
  type?: string | null;
  amount: number;
  currency?: string | null;
  occurredAt: string;
  provider?: string | null;
  providerReference?: string | null;
}

export interface ScheduledPaymentDto {
  applicationId: string;
  applicationUserId: string;
  nextPaymentDueAt: string;
  plan?: string | null;
  expectedAmount?: number | null;
  currency?: string | null;
}

export interface PaymentsOverviewDto {
  pastPayments?: PaymentEventDto[] | null;
  upcomingPayments?: ScheduledPaymentDto[] | null;
}

export interface UpdateApplicationRequestDto {
  name?: string | null;
  description?: string | null;
  format?: string | null;
  oneShotPrice?: number | null;
  plans?: ApplicationPlanDto[] | null;
}
