export type AffiliateStatus = 'active' | 'inactive';

export interface AffiliateMetrics {
  visits: number;
  uniqueVisitors: number;
  signups: number;
  logins: number;
  checkoutsStarted: number;
  subscriptions: number;
  totalRevenue: number;
  totalCommission: number;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  status: AffiliateStatus;
  commissionRate: number; // percentage (e.g. 30 = 30%)
  createdAt: string;
  updatedAt: string;
  metrics: AffiliateMetrics;
}

export type AttributionStatus = 'active' | 'converted' | 'expired';

export interface AffiliateAttribution {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  visitorId: string;
  userId?: string | null;
  firstVisitAt: string;
  lastVisitAt: string;
  attributionExpiresAt?: string | null;
  device?: string;
  browser?: string;
  landingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  status: AttributionStatus;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateEventType = 
  | 'visit'
  | 'signup'
  | 'login'
  | 'checkout_started'
  | 'subscription_created'
  | 'payment_confirmed'
  | 'subscription_renewed'
  | 'payment_failed'
  | 'subscription_cancelled';

export interface AffiliateEvent {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  visitorId: string;
  userId?: string | null;
  eventType: AffiliateEventType;
  eventDate: string;
  metadata?: Record<string, any>;
  createdAt: string;
  timestamp: number;
}

export interface AffiliateSubscription {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string; // 'mensal' | 'anual' | 'flashcards' | etc.
  amount: number;
  commission: number;
  currency: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSessionId?: string;
  status: 'active' | 'paid' | 'cancelled' | 'renewed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export type AttributionModel = 'first_touch' | 'last_touch';

export interface AffiliateConfig {
  attributionWindowDays: number; // 30, 60, 90, 180, or 0 (unlimited)
  attributionModel: AttributionModel;
  defaultCommissionRate: number; // e.g. 30%
  updatedAt?: string;
}

export interface AttributedUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  affiliateId: string;
  affiliateCode: string;
  affiliateAttributedAt?: string;
  createdAt: string;
  lastLogin?: string;
  planStatus: 'free' | 'premium';
  hasActiveSubscription: boolean;
  subscriptionPlan?: string;
  subscriptionDate?: string;
  totalPaid?: number;
  totalCommission?: number;
  stripeCustomerId?: string;
  eventsCount?: number;
}

export interface AffiliateDashboardStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalVisits: number;
  totalUniqueVisitors: number;
  totalSignups: number;
  totalLogins: number;
  totalCheckoutsStarted: number;
  totalSubscriptions: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRateSignup: number; // signups / unique visitors %
  conversionRateSubscription: number; // subscriptions / signups %
  globalConversionRate: number; // subscriptions / unique visitors %
}
