import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import {
  Laptop,
  Smartphone,
  Headphones,
  Tablet,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCircle,
  Search,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type {
  DashboardJobFamily,
  DashboardReviewer,
} from "@shared/dashboard.schema";

interface DataGridProps {
  title: string;
  subtitle: string;
  data?: DashboardJobFamily[] | DashboardReviewer[];
  isLoading: boolean;
  type: "jobFamilies" | "reviewers";
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onJobFamilyClick?: (jobFamily: DashboardJobFamily) => void;
  reviewersData?: DashboardReviewer[];
  searchValue?: string;
  onSearchChange: (value: string) => void;
  onSearchDirChange: (value: string) => void;
  onSearchColChange: (value: string) => void;
}

export function DataGrid({
  title,
  subtitle,
  data,
  isLoading,
  type,
  pagination,
  onJobFamilyClick,
  reviewersData,
  searchValue,
  onSearchChange,
  onSearchDirChange,
  onSearchColChange,
}: DataGridProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Function to get functional leaders for a specific job family
  const getFunctionalLeadersForJobFamily = (jobFamilyName: string) => {
    const jobFamilyLeaderMap: { [key: string]: string[] } = {};

    (data as DashboardJobFamily[]).forEach((item) => {
      jobFamilyLeaderMap[item.jobFamily] = !item.reviewers
        ? []
        : item.reviewers.split(",").map((name) => name.trim());
    });

    return jobFamilyLeaderMap[jobFamilyName] || [];
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      onSearchDirChange(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      onSearchColChange(field);
      setSortDirection("asc");
      onSearchDirChange("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  // Apply search filtering first
  const filteredData = data
    ? data.filter((item) => {
        if (!searchValue || searchValue === "") return true;

        if (type === "jobFamilies") {
          const jobFamily = item as DashboardJobFamily;
          const functionalLeaders = getFunctionalLeadersForJobFamily(
            jobFamily.jobFamily
          );
          const leadersText = functionalLeaders.join(" ").toLowerCase();

          return (
            jobFamily.jobFamily
              .toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            //(jobFamily.description && jobFamily.description.toLowerCase().includes(searchValue.toLowerCase())) ||
            leadersText.includes(searchValue.toLowerCase())
          );
        } else if (type === "reviewers") {
          const reviewer = item as DashboardReviewer;
          return (
            reviewer.fullName &&
            reviewer.fullName.toLowerCase().includes(searchValue.toLowerCase())
          );
          //  || (reviewer.email && reviewer.email.toLowerCase().includes(searchValue.toLowerCase())) ||
          //  (reviewer.username && reviewer.username.toLowerCase().includes(searchValue.toLowerCase())) ||
          //  (reviewer.jobFamily && reviewer.jobFamily.toLowerCase().includes(searchValue.toLowerCase())) ||
          //  (reviewer.responsible && reviewer.responsible.toLowerCase().includes(searchValue.toLowerCase()));
        }
        return true;
      })
    : [];

  const sortedData = filteredData
    ? [...filteredData].sort((a, b) => {
        if (!sortField) return 0;

        let aValue: any;
        let bValue: any;

        if (type === "jobFamilies") {
          const jobA = a as DashboardJobFamily;
          const jobB = b as DashboardJobFamily;
          switch (sortField) {
            case "job_family":
              aValue = jobA.jobFamily;
              bValue = jobB.jobFamily;
              break;
            case "name":
              const leadersA = getFunctionalLeadersForJobFamily(jobA.jobFamily);
              const leadersB = getFunctionalLeadersForJobFamily(jobB.jobFamily);
              aValue = leadersA.length > 0 ? leadersA[0] : "";
              bValue = leadersB.length > 0 ? leadersB[0] : "";
              break;
            case "total_jobs":
              aValue = jobA.totalJobs;
              bValue = jobB.totalJobs;
              break;
            case "jobs_reviewed":
              aValue = jobA.jobsReviewed;
              bValue = jobB.jobsReviewed;
              break;
            default:
              return 0;
          }
        } else if (type === "reviewers") {
          const revA = a as DashboardReviewer;
          const revB = b as DashboardReviewer;
          switch (sortField) {
            case "full_name":
              aValue = revA.jobFamily;
              bValue = revB.jobFamily;
              break;
            case "completed":
              aValue = revA.completed;
              bValue = revB.completed;
              break;
            case "in_progress":
              aValue = revA.inProgress;
              bValue = revB.inProgress;
              break;
            default:
              return 0;
          }
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === "asc" ? comparison : -comparison;
        } else {
          const comparison = aValue - bValue;
          return sortDirection === "asc" ? comparison : -comparison;
        }
      })
    : [];

  // if (isLoading) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>{title}</CardTitle>
  //         <p className="text-sm text-gray-600">{subtitle}</p>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="space-y-4">
  //           {[...Array(4)].map((_, i) => (
  //             <div key={i} className="flex items-center space-x-4">
  //               <Skeleton className="w-10 h-10 rounded-lg" />
  //               <div className="flex-1 space-y-2">
  //                 <Skeleton className="h-4 w-3/4" />
  //                 <Skeleton className="h-3 w-1/2" />
  //               </div>
  //               <Skeleton className="h-4 w-16" />
  //             </div>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
            {(type === "jobFamilies" || type === "reviewers") &&
              onSearchChange && (
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${
                      type === "jobFamilies" ? "job families" : "reviewers"
                    }...`}
                    value={searchValue || ""}
                    onChange={(e) =>  onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };
    return (
      statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800"
    );
  };

  const getProductIcon = (category: string) => {
    const iconMap = {
      Electronics: Laptop,
      Mobile: Smartphone,
      Audio: Headphones,
      Tablets: Tablet,
    };
    return iconMap[category as keyof typeof iconMap] || Laptop;
  };

  const getProductIconBg = (category: string) => {
    const bgMap = {
      Electronics: "bg-primary bg-opacity-10",
      Mobile: "bg-purple-100",
      Audio: "bg-green-100",
      Tablets: "bg-orange-100",
    };
    return bgMap[category as keyof typeof bgMap] || "bg-gray-100";
  };

  const getProductIconColor = (category: string) => {
    const colorMap = {
      Electronics: "text-primary",
      Mobile: "text-purple-600",
      Audio: "text-green-600",
      Tablets: "text-orange-600",
    };
    return colorMap[category as keyof typeof colorMap] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          {(type === "jobFamilies" || type === "reviewers") &&
            onSearchChange && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${
                    type === "jobFamilies" ? "job families" : "reviewers"
                  }...`}
                  value={searchValue || ""}
                  onChange={(e) => {
                    if(pagination?.currentPage !== 1){
                      pagination?.onPageChange(1)
                    }
                    onSearchChange(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {type === "jobFamilies" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("job_family")}
                        >
                          <span>Job Family</span>
                          {getSortIcon("job_family")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <span>Functional Leader</span>
                          {getSortIcon("name")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("total_jobs")}
                        >
                          <span>Total Jobs</span>
                          {getSortIcon("total_jobs")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("jobs_reviewed")}
                        >
                          <span>Jobs Reviewed</span>
                          {getSortIcon("jobs_reviewed")}
                        </button>
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("full_name")}
                        >
                          <span>Functional Leader</span>
                          {getSortIcon("full_name")}
                        </button>
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("completed")}
                        >
                          <span>Completed</span>
                          {getSortIcon("completed")}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                          onClick={() => handleSort("in_progress")}
                        >
                          <span>In Progress</span>
                          {getSortIcon("in_progress")}
                        </button>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {type === "jobFamilies"
                  ? (sortedData as DashboardJobFamily[]).map((jobFamily) => {
                      const functionalLeaders =
                        getFunctionalLeadersForJobFamily(jobFamily.jobFamily);
                      return (
                        <tr
                          key={jobFamily.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => onJobFamilyClick?.(jobFamily)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className="text-blue-600 hover:text-blue-800 underline transition-colors">
                              {jobFamily.jobFamily}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-48">
                            <div className="flex flex-wrap gap-1">
                              {functionalLeaders.length > 0 ? (
                                functionalLeaders.map((leader, index) => (
                                  <span key={index}>
                                    <a
                                      href={`/jobs?search=${encodeURIComponent(
                                        leader
                                      )}`}
                                      className="text-blue-600 hover:text-blue-800 underline transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {leader}
                                    </a>
                                    {index < functionalLeaders.length - 1 && (
                                      <span className="text-gray-400">, </span>
                                    )}
                                  </span>
                                ))
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <UserCircle className="w-5 h-5 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        In order to add people here you need to
                                        assign them in the Jobs Description
                                        Review page
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {jobFamily.totalJobs}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {jobFamily.jobsReviewed}
                          </td>
                        </tr>
                      );
                    })
                  : (sortedData as DashboardReviewer[]).map((reviewer) => (
                      <tr
                        key={reviewer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`/jobs?search=${encodeURIComponent(
                              reviewer.fullName || ""
                            )}`}
                            className="text-blue-600 hover:text-blue-800 underline transition-colors"
                          >
                            {reviewer.fullName}
                          </a>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reviewer.completed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reviewer.inProgress}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing 1 to {Math.min(4, pagination.total)} of {pagination.total} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentGroup = Math.floor((pagination.currentPage - 1) / 5);
                  const previousGroupStart = Math.max(0, currentGroup - 1) * 5 + 1;
                  pagination.onPageChange(previousGroupStart);
                }}
                disabled={pagination.currentPage <= 5}
              >
                <ChevronsLeft />
              </Button>
              
              {/* Dynamic cycling page buttons */}
              {(() => {
                const getVisiblePages = () => {
                  if (pagination.totalPages <= 5) {
                    return Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
                  }
                  
                  // Calculate which group of 5 the current page belongs to
                  const currentGroup = Math.floor((pagination.currentPage - 1) / 5);
                  const groupStart = currentGroup * 5 + 1;
                  const groupEnd = Math.min(groupStart + 4, pagination.totalPages);
                  
                  return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);
                };
                
                return getVisiblePages().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ));
              })()}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentGroup = Math.floor((pagination.currentPage - 1) / 5);
                  const nextGroupStart = (currentGroup + 1) * 5 + 1;
                  pagination.onPageChange(Math.min(pagination.totalPages, nextGroupStart));
                }}
                disabled={Math.floor((pagination.currentPage - 1) / 5) >= Math.floor((pagination.totalPages - 1) / 5)}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
