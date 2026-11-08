import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import {
  Search,
  Filter,
  Bell,
  FilterX,
  ChevronDown,
  Trash2,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCircle,
  FileSpreadsheet,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Notification } from "shared/notification.schema";
import { formatDistanceToNow } from "date-fns";
import NotificationBell from "./notification-bell";
import { fetchWithCredentials, getLoggedInUser } from "@/lib/utils";
import {
  SearchPreference,
  FilterPreference,
} from "shared/userpreference.schema";
import { queryClient } from "@/lib/queryClient";

interface JobEntry {
  id: number;
  job_code: string;
  job_title: string;
  job_family: string;
  reviewer_name: string;
  responsible_name: string;
  status:
    | "In Progress"
    | "Not Started"
    | "Completed"
    | "Submitted to HR"
    | "Accepted As Is";
  last_updated: string;
  created_at: string;
  total_count: number;
}

interface JobFamily {
  id: number;
  job_family: string;
}

const statusOptions = [
  "In Progress",
  "Not Started",
  "Completed",
  "Submitted to HR",
  "Accepted As Is"
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function JobsFamily() {
  const [, setLocation] = useLocation();
  const { isAdminMode } = useRole();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFamily, setSelectedJobFamily] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // console.log('satus ===> ', selectedStatus)
  // Reviewer assignments (untouched logic)
  const [reviewerAssignments, setReviewerAssignments] = useState<{
    [key: number]: string | null;
  }>({ 1: null, 2: null });
  const availableUsers = [];
  const urlParams = new URLSearchParams(window.location.search);
  // const reviewerParam = urlParams.get("reviewer");
  const searchParam = urlParams.get("search");

  // URL filter setup (untouched logic)
  useEffect(() => {
    // if (reviewerParam) {
    //   const decodedReviewer = decodeURIComponent(reviewerParam);
    //   setSearchTerm(decodedReviewer);
    //   setSelectedStatus("");
    // } else 
    if (searchParam) {
      const decodedSearch = decodeURIComponent(searchParam);
      setSearchTerm(decodedSearch);
      setSelectedStatus("");
    }
  }, []);

  const savePreferencesTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPreferences = useRef<string>("");

  // Only save preferences if user has interacted (not on initial page load)
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Don't save on first mount
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      return;
    }
    if (savePreferencesTimeout.current) {
      clearTimeout(savePreferencesTimeout.current);
    }
    savePreferencesTimeout.current = setTimeout(() => {
      const preferences = [
        {
          search: searchTerm,
          jobfamily: selectedJobFamily,
          status: selectedStatus,
        },
      ];
      const preferencesStr = JSON.stringify(preferences);
      if (preferencesStr !== lastSavedPreferences.current) {
        saveSearchPreferences(preferencesStr);
        lastSavedPreferences.current = preferencesStr;
      }
    }, 600);
    return () => {
      if (savePreferencesTimeout.current) {
        clearTimeout(savePreferencesTimeout.current);
      }
    };
  }, [searchTerm, selectedJobFamily, selectedStatus]);

  // API call

  const saveSearchPreferences = async (preferences: string) => {
    const response = await fetchWithCredentials("/api/users/savepreferences/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // id: getLoggedInUser().id,
        pageName: "jobs",
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save user preferences");
    }
    queryClient.invalidateQueries({
      queryKey: ["userPreferences"]
    })
    return response.json();
  };

  const {
    data: searchPreferences
  } = useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const response = await fetchWithCredentials(
        `/api/users/fetchpreferences/jobs`
      );
      if (!response.ok) throw new Error("Failed to fetch user preferences");
      return await response.json();
    },
  });
  
  useEffect(() => {
    const defaultJson= `[{"search":"","jobfamily":"","status":""}]`
    if (searchPreferences && searchPreferences.FilterJson) {
      let preferences = []
      try {
        
        preferences = JSON.parse(searchPreferences.FilterJson || defaultJson);
      } catch (error) {
        preferences = JSON.parse(defaultJson)
      }
      const merged = Object.assign({}, ...preferences);
      // console.log("Merged preferences:", merged);
      if(!searchParam){
        setSearchTerm(merged.search || "");
      }
      setSelectedJobFamily(merged.jobfamily || "");
      setSelectedStatus(merged.status || "");
    }
  }, [searchPreferences]);

  const limit = 10;
  const fetchJobs = async () => {
  const params = new URLSearchParams();
  if (debouncedSearchTerm) params.append("search_term", debouncedSearchTerm);
  if (selectedJobFamily)
      params.append("job_family_id", String(selectedJobFamily));
    if (selectedStatus) params.append("status", selectedStatus);
    params.append("page", currentPage.toString());
    params.append("limit", limit.toString());
    // if (getLoggedInUser().role != "Admin" && getLoggedInUser().role != "Reviewer") {
    //   // params.append('reviewer_id', getLoggedInUser().id);
    // }

    if (sortBy) params.append("sortField", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder.toUpperCase());

    const response = await fetchWithCredentials(`/api/jobs?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  };

  const fetchJobFamilies = async () => {
    const response = await fetchWithCredentials("/api/all-job-families");
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  };

  const {
    data: jobFamiliesData,
    isLoading: isFamiliesLoading,
    error: familiesError,
  } = useQuery({
    queryKey: ["jobFamilies"],
    queryFn: fetchJobFamilies,
  });

  // Make sure to fallback to [] if not loaded yet
  const jobFamilies: JobFamily[] = jobFamiliesData || [];

  const debouncedSearchTerm = useDebounce(searchTerm, 600);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "jobs",
      debouncedSearchTerm,
      selectedJobFamily,
      selectedStatus,
      currentPage,
      sortBy,
      sortOrder,
    ],
    queryFn: () => fetchJobs(),
  });

  const jobs: JobEntry[] = data?.items || [];
  const total: number =
    data?.total && data.total > 0 ? data.total : jobs[0]?.total_count ?? 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  // Sort logic for column click
  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedJobFamily("");
    setSelectedStatus("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
  };
  const hasFilters =
    searchTerm !== "" || selectedJobFamily !== "" || selectedStatus !== "";

  // Reviewer assignment logic (untouched)
  const handleReviewerAssignment = (entryId: number, userName: string) => {
    setReviewerAssignments((prev) => ({ ...prev, [entryId]: userName }));
  };
  const getFnLeaderDisplay = (value: string) => {
    if (!value)
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <UserCircle className="w-5 h-5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                In order to add people here you need to assign them in the Job
                Description Review page
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    return (
      <button
        onClick={() => handleFunctionalLeaderClick(value)}
        className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer text-left"
      >
        {value}
      </button>
    );
  };

  const getResponsibleDisplay = (value: string) => {
    if (!value)
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <UserCircle className="w-5 h-5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                In order to add people here you need to assign them in the Job
                Description Review page
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    return <span className="text-sm text-gray-900">{value}</span>;
  };

  // Function to handle functional leader name click
  const handleFunctionalLeaderClick = (reviewerName: string) => {
    setSearchTerm(reviewerName);
    setSelectedStatus("");
    setSelectedJobFamily("");
    setCurrentPage(1);
  };

  function handleSavePreference(status: string){
        setSelectedStatus(status); 
              const preferences = [
                {
                  search: searchTerm,
                  jobfamily: selectedJobFamily,
                  status: status,
                },
              ];
        saveSearchPreferences(JSON.stringify(preferences))                
  }

  // Status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Reviewed":
        return "bg-purple-100 text-purple-800";
      case "Submitted to HR":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportToExcel = () => {
    setIsExporting(true);
    fetchWithCredentials('/api/export-jobs')
    .then(res => {
      if (!res.ok) throw new Error('Failed to download');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jobs.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => err )
    .finally(() => setIsExporting(false));
};

const [isExporting, setIsExporting] = useState(false);

const exportToExcelCompleted = () => {
  setIsExporting(true);
  fetchWithCredentials('/api/export-jobs-completed')
    .then(res => {
      if (!res.ok) throw new Error('Failed to download');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jobs-completed.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    // .catch(err => console.error('Export failed:', err))
    .catch(err => err)
    .finally(() => setIsExporting(false));
};

  // Render
  return (

    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                Jobs
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
          {/* Controls */}
          {isExporting  && (
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-70 flex items-center justify-center z-50" ><Loader2 className="animate-spin" /> </div>
                )}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search job code, title, family, reviewer, status..."
                    value={searchTerm}
                    onChange={(e) =>{
                      if(currentPage !== 1 ) setCurrentPage(1)
                      setSearchTerm(e.target.value)
                    }
                    } 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                >
                  {hasFilters ? (
                    <FilterX className="w-4 h-4 mr-2" />
                  ) : (
                    <Filter className="w-4 h-4 mr-2" />
                  )}
                  {hasFilters ? "Clear Filters" : "Filters"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {selectedJobFamily
                        ? jobFamilies.find((jf) => jf.id === selectedJobFamily)
                            ?.job_family
                        : "Select Job Family"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedJobFamily("")}>
                      All Job Family
                    </DropdownMenuItem>
                    {jobFamilies.map((jf) => (
                      <DropdownMenuItem
                        key={jf.id}
                        onClick={() => {
                         if(currentPage !== 1) setCurrentPage(1); 
                          setSelectedJobFamily(jf.id)
                        }}
                        // onClick={() => setSelectedJobFamily(jf.id)}
                      >
                        {jf.job_family}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {selectedStatus || "Select Status"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSavePreference("")}>
                      All Statuses
                    </DropdownMenuItem>
                    {statusOptions.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => {
                          if(currentPage !== 1) setCurrentPage(1)
                          handleSavePreference(status)
                        }}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Export Button */}
            <div className="mb-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToExcel}
                // className="flex items-center"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToExcelCompleted}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export All JD Content</span>
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("job_code")}
                      >
                        <span>Job Code</span>
                        {getSortIcon("job_code")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("job_title")}
                      >
                        <span>Job Title</span>
                        {getSortIcon("job_title")}
                      </button>
                    </th>
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
                        onClick={() => handleSort("reviewer_name")}
                      >
                        <span>Functional Leader</span>
                        {getSortIcon("reviewer_name")}
                      </button>
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("responsible_name")}
                      >
                        <span>Responsible</span>
                        {getSortIcon("responsible_name")}
                      </button>
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <span>Status</span>
                        {getSortIcon("status")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("last_updated")}
                      >
                        <span>Last Updated</span>
                        {getSortIcon("last_updated")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-red-500">
                        Error loading jobs
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    jobs.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              if (entry.status === "Completed") {
                                setLocation(
                                  `/job-final-review?jobCode=${entry.job_code}`
                                );
                              } else {
                                setLocation(
                                  `/editing?jobCode=${entry.job_code}`
                                );
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {entry.job_code}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.job_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {entry.job_family}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          {entry.reviewer_name
                            ? entry.reviewer_name
                                .split(",")
                                .map((name, idx) => (
                                  <div key={idx}>
                                    {getFnLeaderDisplay(name.trim())}
                                  </div>
                                ))
                            : getFnLeaderDisplay("")}
                        </td>
                        {/* <td className="px-6 py-4  text-sm text-gray-600">
                          {getResponsibleDisplay(entry.responsible_name)}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                              entry.status
                            )}`}
                          >
                            {entry.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {entry.last_updated}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
           <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing 1 to {Math.min(10, jobs.length)} of {jobs[0]?.total_count ?? 0} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentGroup = Math.floor((currentPage - 1) / 5);
                    const previousGroupStart = Math.max(0, currentGroup - 1) * 5 + 1;
                    setCurrentPage(previousGroupStart);
                  }}
                  disabled={currentPage <= 5}
                >
                  <ChevronsLeft />
                </Button>
                
                {/* Dynamic cycling page buttons */}
                {(() => {
                  const getVisiblePages = () => {
                    if (totalPages <= 5) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1);
                    }
                    
                    // Calculate which group of 5 the current page belongs to
                    const currentGroup = Math.floor((currentPage - 1) / 5);
                    const groupStart = currentGroup * 5 + 1;
                    const groupEnd = Math.min(groupStart + 4, totalPages);
                    
                    return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);
                  };
                  
                  return getVisiblePages().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ));
                })()}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentGroup = Math.floor((currentPage - 1) / 5);
                    const nextGroupStart = (currentGroup + 1) * 5 + 1;
                    setCurrentPage(Math.min(totalPages, nextGroupStart));
                  }}
                  disabled={Math.floor((currentPage - 1) / 5) >= Math.floor((totalPages - 1) / 5)}
                >
                  <ChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
