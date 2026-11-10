import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Search,
  Bell,
  X,
  Trash2,
  LayoutDashboard,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SummaryCards } from "@/components/summary-cards";
import { DataGrid } from "@/components/data-grid";
import { MiniBarChart } from "@/components/mini-bar-chart";

// import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import {
  DashboardJobFamily,
  DashboardReviewer,
  DashboardSummary,
} from "@shared/dashboard.schema";
import NotificationBell from "./notification-bell";
import { fetchWithCredentials, getLoggedInUser } from "@/lib/utils";

export default function Dashboard() {
  const queryClient = useQueryClient();
  // const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [jobFamiliesPage, setJobFamiliesPage] = useState(1);
  const [reviewersPage, setReviewersPage] = useState(1);
  const [reviewersPageSortDirection, setReviewersPageSortDirection] =
    useState("asc");
  const [reviewersPageSortColumn, setReviewersPageSortColumn] = useState("full_name");
  const [selectedJobFamily, setSelectedJobFamily] =
    useState<DashboardJobFamily | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [jobFamilySearch, setJobFamilySearch] = useState("");
  const [jobFamilySortDirection, setJobFamilySortDirection] = useState("asc");
  const [jobFamilySortColumn, setJobFamilySortColumn] = useState("job_family");
  const [reviewerSearch, setReviewerSearch] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sample notifications
  // const [notifications, setNotifications] = useState([
  //   "Review deadline approaching",
  //   "New job submitted",
  //   "Status update required",
  //   "Feedback pending approval",
  // ]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);



  // Handle dialog close - redirect to Jobs Family page
  const handleDialogClose = () => {
    setLocation("/jobs");
  };

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const {
    data: jobFamiliesData,
    isLoading: jobFamiliesLoading,
    error: jobFamiliesError,
  } = useQuery<{
    jobFamilies: DashboardJobFamily[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>({
    queryKey: [
      "/api/dashboard/job-families",
      jobFamiliesPage,
      jobFamilySearch,
      jobFamilySortDirection,
      jobFamilySortColumn,
    ],
    queryFn: () =>
      fetchWithCredentials(
        `/api/dashboard/job-families?page=${jobFamiliesPage}&limit=4&sortDir=${jobFamilySortDirection}&sortCol=${jobFamilySortColumn}&searchTerm=${jobFamilySearch}`
      ).then((res) => res.json()),
    // select: (data) => ({
    //   ...data,
    //   jobFamilies: data.jobFamilies.sort((a, b) =>
    //     a.jobFamily.localeCompare(b.jobFamily)
    //   ),
    // }),
  });

  const {
    data: reviewersData,
    isLoading: reviewersLoading,
    error: reviewersError,
  } = useQuery<{
    reviewers: DashboardReviewer[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>({
    queryKey: ["/api/dashboard/reviewers", reviewersPage, reviewerSearch, reviewersPageSortColumn, reviewersPageSortDirection],
    queryFn: () =>
      fetchWithCredentials(
        `/api/dashboard/reviewers?page=${reviewersPage}&limit=4&sortDir=${reviewersPageSortDirection}&sortCol=${reviewersPageSortColumn}&searchTerm=${reviewerSearch}`
      ).then((res) => res.json()),
    // select: (data) => ({
    //   ...data,
    //   reviewers: data.reviewers.sort((a, b) => b.completed - a.completed),
    // }),
  });

  const {data: bannerConfig} = useQuery({
    queryKey: ["bannerConfig"],
    queryFn: () => fetchWithCredentials("/api/config/banner").then((res) => res.json()),
  });
  // console.log('bannerConfig ==> ', bannerConfig);
  const bannerData = bannerConfig?.[0]?.json_text ? JSON.parse(bannerConfig[0].json_text): null

  // Filter data based on search terms
  const filteredJobFamilies =
    jobFamiliesData?.jobFamilies?.filter((jobFamily: DashboardJobFamily) => {
      if (jobFamilySearch === "") return true;
      return (
        jobFamily.jobFamily
          .toLowerCase()
          .includes(jobFamilySearch.toLowerCase()) ||
        (jobFamily.description &&
          jobFamily.description
            .toLowerCase()
            .includes(jobFamilySearch.toLowerCase()))
      );
    }) || [];

  const filteredReviewers =
    reviewersData?.reviewers?.filter((reviewer: DashboardReviewer) => {
      if (reviewerSearch === "") return true;
      return (
        (reviewer.fullName &&
          reviewer.fullName
            .toLowerCase()
            .includes(reviewerSearch.toLowerCase())) ||
        (reviewer.email &&
          reviewer.email
            .toLowerCase()
            .includes(reviewerSearch.toLowerCase())) ||
        (reviewer.username &&
          reviewer.username
            .toLowerCase()
            .includes(reviewerSearch.toLowerCase())) ||
        (reviewer.jobFamily &&
          reviewer.jobFamily
            .toLowerCase()
            .includes(reviewerSearch.toLowerCase())) ||
        (reviewer.responsible &&
          reviewer.responsible
            .toLowerCase()
            .includes(reviewerSearch.toLowerCase()))
      );
    }) || [];

  const handleJobFamilyClick = (jobFamily: DashboardJobFamily) => {
    setSelectedJobFamily(jobFamily);
  };

  const clearFilter = () => {
    setSelectedJobFamily(null);
  };

  const getFilteredSummary = (): DashboardSummary | undefined => {
    if (!summaryData || !selectedJobFamily) return summaryData;
    // Calculate filtered totals based on selected job family
    const filteredSummary: DashboardSummary = {
      ...summaryData,
      totalUsers: selectedJobFamily.totalJobs,
      jobsReviewed: selectedJobFamily.jobsReviewed,
      inProgress: selectedJobFamily.jobsInProgress,
      notStarted: selectedJobFamily.jobsNotStarted,
      submittedToHr: selectedJobFamily.jobsSubmittedToHr,
      completed: selectedJobFamily.jobsCompleted,
      //orders: selectedJobFamily.totalJobs - selectedJobFamily.jobsReviewed, // In progress jobs
    };

    return filteredSummary;
  };

  const refreshDashboard = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] }),
        queryClient.invalidateQueries({
          queryKey: ["/api/dashboard/transactions", transactionsPage],
        }),
        queryClient.invalidateQueries({
          queryKey: ["/api/dashboard/job-families", jobFamiliesPage],
        }),
        queryClient.invalidateQueries({
          queryKey: ["/api/dashboard/reviewers", reviewersPage],
        }),
      ]);
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // if(!getLoggedInUser().IsHRLeader) {
  //   // window.location.href = "/jobs" 
  //   setLocation("/jobs")
  //   return
  // }

  // Show error messages
  if (summaryError || jobFamiliesError || reviewersError) {
    const errorMessage =
      summaryError?.message ||
      jobFamiliesError?.message ||
      reviewersError?.message;
    toast({
      title: "Error loading data",
      description: errorMessage || "Failed to load dashboard data.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

        <main className="flex-1 p-6">
          {/* Beta Banner */}
          {
            bannerData && bannerData.isVisible &&
            <div className="mb-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="font-semibold text-sm">
                {/* ⚠️ PRE-PROD RELEASE BETA 1.0 */}
                {bannerData.displayValue}
              </span>
            </div>
          </div>
          }

          {/* Top Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">
                  Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>

          {/* Filter indicator and clear button */}
          {selectedJobFamily && (
            <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">
                  Filtered by: {selectedJobFamily.jobFamily}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            </div>
          )}

          {/* Summary Cards */}
          <SummaryCards
            data={getFilteredSummary()}
            isLoading={summaryLoading}
            variant="default"
          />

          {/* Second Row of Summary Cards with Mini Chart */}
          <div className="mt-6 grid grid-cols-4 gap-6">
            <div className="col-span-2">
              <SummaryCards
                data={getFilteredSummary()}
                isLoading={summaryLoading}
                variant="second"
              />
            </div>
            <div className="col-span-1">
              <MiniBarChart
                data={getFilteredSummary()}
                isLoading={summaryLoading}
              />
            </div>
            <div className="col-span-1">{/* Empty space for alignment */}</div>
          </div>

          {/* Data Grids Section */}
          <div className="grid grid-cols-2 gap-8">
            {/* Job Family Grid */}
            <DataGrid
              title="Jobs"
              subtitle=""
              data={jobFamiliesData?.jobFamilies}
              isLoading={jobFamiliesLoading}
              type="jobFamilies"
              onJobFamilyClick={handleJobFamilyClick}
              reviewersData={reviewersData?.reviewers}
              searchValue={jobFamilySearch}
              onSearchChange={setJobFamilySearch}
              onSearchDirChange={setJobFamilySortDirection}
              onSearchColChange={setJobFamilySortColumn}
              pagination={
                jobFamiliesData
                  ? {
                      currentPage: jobFamiliesData.currentPage,
                      totalPages: jobFamiliesData.totalPages,
                      total: jobFamiliesData.total,
                      onPageChange: setJobFamiliesPage,
                    }
                  : undefined
              }
            />

            {/* Reviewer Grid */}
            <DataGrid
              title="Reviewer"
              subtitle=""
              data={reviewersData?.reviewers}
              isLoading={reviewersLoading}
              type="reviewers"
              searchValue={reviewerSearch}
              onSearchChange={setReviewerSearch}
              onSearchDirChange={setReviewersPageSortDirection}
              onSearchColChange={setReviewersPageSortColumn}
              pagination={
                reviewersData
                  ? {
                      currentPage: reviewersData.currentPage,
                      totalPages: reviewersData.totalPages,
                      total: reviewersData.total,
                      onPageChange: setReviewersPage,
                    }
                  : undefined
              }
            />
          </div>
        </main>

    </div>
  );
}
