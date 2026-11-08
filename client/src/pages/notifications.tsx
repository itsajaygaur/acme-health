import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Bell,
  Check,
  X,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "shared/notification.schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithCredentials, getLoggedInUser } from "@/lib/utils";

export default function Notifications() {

  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobFamily, setSelectedJobFamily] = useState<{ id: number; job_family: string; } | null>(null);
  // TODO: Replace with actual user id from auth context/session
  const userId = -1;

    const fetchJobFamilies = async () => {
    const response = await fetchWithCredentials("/api/all-job-families");
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  };

    const {
      data: jobFamilies,
      isLoading: isFamiliesLoading,
      error: familiesError,
    } = useQuery({
      queryKey: ["jobFamilies"],
      queryFn: fetchJobFamilies,
    });

    // Fetch notifications from API
    const fetchNotifications = async () => {
          const params = new URLSearchParams();
            params.append("userId", getLoggedInUser().id.toString());
            params.append("page", currentPage.toString());
            params.append("limit", "10");
            params.append("isHRLeader", getLoggedInUser()?.group.split(":")?.includes('hrleader')?.toString());
            if (selectedJobFamily?.job_family) {
              params.append("jobType", selectedJobFamily.job_family);
            }
        const response = await fetchWithCredentials(
          `/api/notifications/GetNotifications?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        return await response.json();
        // Use the notifications property from the response
        // setNotifications(
        //   Array.isArray(data.notifications) ? data.notifications : []
        // );

    };

    const { data: notificationsData } = useQuery({
      queryKey: ["notifications", currentPage, selectedJobFamily?.job_family],
      queryFn: () => fetchNotifications(),
      enabled: !!userId,
    })

    const notifications: Notification[] = notificationsData?.notifications || [];
  

  useEffect(() => {
    // fetchNotifications();
  }, [userId, selectedJobFamily]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "info":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetchWithCredentials(`/api/notifications/UpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: true, action: "update" }),
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      queryClient.invalidateQueries({ queryKey: ["notifications", currentPage, selectedJobFamily?.job_family] });
      // setNotifications((prev) =>
      //   prev.map((notification) =>
      //     notification.id === id
      //       ? { ...notification, isRead: true }
      //       : notification
      //   )
      // );
    } catch (err) {
      // Optionally handle error
    }
  };

  const markAsUnread = async (id: number) => {
    try {
      const response = await fetchWithCredentials(`/api/notifications/UpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: false, action: "update" }),
      });
      if (!response.ok) throw new Error("Failed to mark as unread");
      queryClient.invalidateQueries({ queryKey: ["notifications", currentPage, selectedJobFamily?.job_family] });
      // setNotifications((prev) =>
      //   prev.map((notification) =>
      //     notification.id === id
      //       ? { ...notification, isRead: false }
      //       : notification
      //   )
      // );
    } catch (err) {
      // Optionally handle error
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetchWithCredentials(`/api/notifications/UpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      queryClient.invalidateQueries({ queryKey: ["notifications", currentPage, selectedJobFamily?.job_family] });
      // setNotifications((prev) =>
      //   prev.filter((notification) => notification.id !== id)
      // );
    } catch (err) {
      // Optionally handle error
    }
  };

  const markAllAsRead = async () => {
    try {
      let id = 0; // Pass UserID to update all notifications to read for the particular user.
      const response = await fetchWithCredentials(`/api/notifications/UpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: true, action: "bulk" }),
      });
      if (!response.ok) throw new Error("Failed to mark all as read");
      queryClient.invalidateQueries({ queryKey: ["notifications", currentPage, selectedJobFamily?.job_family] });
      // setNotifications((prev) =>
      //     prev.map((notification) => ({ ...notification, isRead: true }))
      // );
    } catch (err) {
      // Optionally handle error
    }
  };

  const filteredNotifications = notifications?.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.jobType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || notification.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "read" && notification.isRead) ||
      (statusFilter === "unread" && !notification.isRead);

    // console.log(
    //   `Filtering: searchTerm=${searchTerm}, typeFilter=${typeFilter}, statusFilter=${statusFilter}, matchesSearch=${matchesSearch}, matchesType=${matchesType}, matchesStatus=${matchesStatus}`
    // );
    return matchesSearch && matchesType && matchesStatus;
  });

    // Pagination
  const totalPages = Math.ceil(notificationsData?.total / 10);
  const startIndex = (currentPage - 1) * 10;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + 10);


  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function exportToExcel() {
  fetchWithCredentials('/api/export-notifications?isHRLeader=' + getLoggedInUser().group?.split(':')?.includes('hrleader'))
    .then(res => {
      if (!res.ok) throw new Error('Failed to download');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notifications.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    // .catch(err => console.error('Export failed:', err));
    .catch(err => err);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* <Header /> */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto">
            <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Bell className="text-primary text-2xl" />
              <span className="text-xl font-semibold text-gray-900">
                Notifications
              </span>
            </div>
          </div>
            {/* Filters and Search */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 mr-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by title, message, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>

            {/* Additional Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Completed</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Type
                  </label>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {selectedJobFamily?.job_family || "Select Job Type"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSelectedJobFamily(null)}>
                    All Job Types
                  </DropdownMenuItem>
                  {jobFamilies?.map((jf: { id: number; job_family: string; }) => (
                    <DropdownMenuItem
                      key={jf.id}
                      onClick={() => {setCurrentPage(1),setSelectedJobFamily({id: jf.id, job_family: jf.job_family})}}
                    >
                      {jf.job_family}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
                </div>
              </div>
            </div>

               <div className="mb-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToExcel}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to Excel</span>
              </Button>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications ({filteredNotifications.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <Badge className="mb-1" >{notification.jobType}</Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span
                              className="prose prose-sm dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: notification.message }}
                            />
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {/* {notification.category} */}
                              Last Updated
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {notification.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.isRead ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsUnread(notification.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Mark Unread
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No notifications found matching your criteria.
                  </p>
                </div>
              )}

                       {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {startIndex + 1} to {Math.min(startIndex + 10, filteredNotifications.length)} of {filteredNotifications.length} notifications
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Previous Group Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentGroup = Math.floor((currentPage - 1) / 5);
                          if (currentGroup > 0) {
                            const newPage = (currentGroup - 1) * 5 + 1;
                            setCurrentPage(newPage);
                          }
                        }}
                        disabled={Math.floor((currentPage - 1) / 5) === 0}
                        className="px-2 py-1"
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
                        
                        const visiblePages = getVisiblePages();
                        
                        return visiblePages.map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="px-3 py-1 min-w-[2rem]"
                          >
                            {pageNum}
                          </Button>
                        ));
                      })()}
                      
                      {/* Next Group Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentGroup = Math.floor((currentPage - 1) / 5);
                          const maxGroup = Math.floor((totalPages - 1) / 5);
                          if (currentGroup < maxGroup) {
                            const newPage = (currentGroup + 1) * 5 + 1;
                            setCurrentPage(newPage);
                          }
                        }}
                        disabled={Math.floor((currentPage - 1) / 5) === Math.floor((totalPages - 1) / 5)}
                        className="px-2 py-1"
                      >
                        <ChevronsRight />
                      </Button>
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
