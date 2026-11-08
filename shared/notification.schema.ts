export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  jobType: string;
}