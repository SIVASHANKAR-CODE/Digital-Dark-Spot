// Core domain and frontend types for Digital Dark Spot

export interface ResearchSession {
  id: string;
  question: string;
  objective?: string;
  status: ResearchStatus;
  sources: Source[];
  analysis?: AnalysisResult;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  analyzedAt?: string;
}

export type ResearchStatus =
  | 'draft'
  | 'collecting_sources'
  | 'extracting'
  | 'analyzing'
  | 'completed'
  | 'failed'
  | 'partial';

export interface Source {
  id: string;
  url: string;
  title: string;
  domain: string;
  status: SourceStatus;
  publishedDate?: string;
  retrievedAt?: string;
  contentExcerpt?: string;
  contentLength?: number;
  error?: string;
  metadata?: SourceMetadata;
}

export type SourceStatus =
  | 'pending'
  | 'fetching'
  | 'extracted'
  | 'partial'
  | 'failed'
  | 'blocked';

export interface SourceMetadata {
  author?: string;
  description?: string;
  language?: string;
  wordCount?: number;
}

export interface AnalysisResult {
  id: string;
  researchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary: AnalysisSummary;
  findings: Finding[];
  gaps: InformationGap[];
  contradictions: Contradiction[];
  freshnessWarnings: FreshnessWarning[];
  verificationItems: VerificationItem[];
  limitations: string[];
  processedAt: string;
  sourceCount: number;
  modelUsed?: string;
}

export interface AnalysisSummary {
  overview: string;
  keyFacts: KeyFact[];
  totalFindings: number;
  totalGaps: number;
  totalContradictions: number;
  totalFreshnessWarnings: number;
  confidenceNote: string;
}

export interface KeyFact {
  id: string;
  statement: string;
  sourceIds: string[];
  confidence: ConfidenceLevel;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

export interface Finding {
  id: string;
  type: 'fact' | 'claim' | 'opinion' | 'statistic';
  title: string;
  description: string;
  sourceIds: string[];
  evidence: EvidenceExcerpt[];
  confidence: ConfidenceLevel;
}

export interface EvidenceExcerpt {
  sourceId: string;
  text: string;
  relevance: 'direct' | 'supporting' | 'contextual';
}

export interface InformationGap {
  id: string;
  title: string;
  description: string;
  importance: Priority;
  category: GapCategory;
  evidenceReviewed: string;
  confidence: ConfidenceLevel;
  suggestedAction: string;
  relatedSourceIds: string[];
}

export type GapCategory =
  | 'missing_detail'
  | 'unanswered_question'
  | 'insufficient_evidence'
  | 'missing_perspective'
  | 'missing_data'
  | 'unexplored_aspect';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Contradiction {
  id: string;
  title: string;
  description: string;
  claimA: ContradictionClaim;
  claimB: ContradictionClaim;
  severity: Priority;
  explanation: string;
  status: 'confirmed_conflict' | 'possible_conflict' | 'needs_investigation';
  suggestedResolution: string;
}

export interface ContradictionClaim {
  statement: string;
  sourceId: string;
  excerpt: string;
}

export interface FreshnessWarning {
  id: string;
  sourceId: string;
  title: string;
  reason: FreshnessReason;
  publishedDate?: string;
  explanation: string;
  severity: Priority;
}

export type FreshnessReason =
  | 'outdated_content'
  | 'missing_date'
  | 'rapidly_evolving_topic'
  | 'superseded_information';

export interface VerificationItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  sourceIds: string[];
  suggestedAction: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  sourceIds: string[];
  isCustom: boolean;
  createdAt: string;
}

export interface CreateResearchRequest {
  question: string;
  objective?: string;
  sourceUrls?: string[];
}

export interface AddSourceRequest {
  urls: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected' | 'not_configured';
    ai: 'configured' | 'not_configured';
    search: 'configured' | 'not_configured';
  };
}

export interface DemoIndicator {
  isDemo: boolean;
  reason?: string;
}

// Frontend specific types
export type DashboardTab =
  | 'overview'
  | 'gaps'
  | 'contradictions'
  | 'freshness'
  | 'evidence'
  | 'verification'
  | 'sources';

export interface DashboardTabItem {
  id: DashboardTab;
  label: string;
  icon?: string;
  count?: number;
}

// User & Authentication Types
export type UserRole = 'user' | 'admin' | 'researcher';
export type AuthProviderType = 'local' | 'google';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  authProvider: AuthProviderType;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
  expiresIn: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

