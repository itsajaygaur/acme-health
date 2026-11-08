export interface DashboardSummary {
  totalUsers: number;
  revenue: number;
  orders: number;
  growthRate: number;
  jobsReviewed: number;
  inProgress: number;
  notStarted: number;
  completed: number;
  submittedToHr: number;
}

export interface DashboardJobFamily {
  id: number;
  jobFamily: string;
  totalJobs: number;
  jobsReviewed: number;
  jobsInProgress: number;
  jobsNotStarted: number;
  jobsCompleted: number;
  jobsSubmittedToHr: number;
  description: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  reviewers?: string;
}

export interface DashboardReviewer {
  id: number;
  username: string;
  fullName: string;
  email: string;
  jobFamily: string;
  completed: number;
  inProgress: number;
  responsible: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}