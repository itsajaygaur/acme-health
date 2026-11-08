import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import {
  ArrowLeft,
  Search,
  Bell,
  FileText,
  Users,
  BarChart,
  Clock,
  Undo,
  RotateCcw,
  Plus,
  Pencil,
  Eye,
  Edit,
  GripVertical,
  Trash2,
  UserPlus,
  X,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { fetchWithCredentials } from "@/lib/utils";

export default function JobFinalReview() {
  const [, setLocation] = useLocation();
  const { isAdminMode } = useRole();
  const [jobCode, setJobCode] = useState("");

  // Get job code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobCodeFromUrl = urlParams.get("jobCode");
    if (jobCodeFromUrl) {
      setJobCode(jobCodeFromUrl);
    }
  }, []);

  // Effect to extract job code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobParam = urlParams.get("job");
    if (jobParam) {
      setJobCode(jobParam);
    }
  }, []);

  const { data: jobFinalReview, isLoading } = useQuery({
    queryKey: ["finalReview", jobCode],
    queryFn: async () => {
      if (!jobCode) return [];
      const res = await fetchWithCredentials(
        `/api/job/finalreview?jobCode=${encodeURIComponent(jobCode)}`
      );
      if (!res.ok) throw new Error("Failed to fetch essential functions");
      return await res.json();
    },
    enabled: !!jobCode,
  });

  const jobDetails =
    jobFinalReview && Object.keys(jobFinalReview).length > 0
      ? jobFinalReview.jobDetails
      : {};

  const essentialFunctionData =
    jobFinalReview && Array.isArray(jobFinalReview.essentialFunctions)
      ? jobFinalReview.essentialFunctions
      : ["No essential functions available"];

  const reviewers =
    jobFinalReview && Array.isArray(jobFinalReview.reviewers)
      ? jobFinalReview.reviewers
      : ["No reviewers available"];

  const status = "Completed"; // Example status, replace with actual logic

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileCheck className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Job Final Review
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Job Code: {Number(jobCode) > 0 ? jobCode : "Invalid Job Code"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              asChild
              className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-xs px-2 py-1 h-7"
            >
              <Link href="/jobs">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Link>
            </Button>
          </div>

          {/* Job Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Job Title
                </span>
              </div>
              <p className="text-blue-600 font-semibold">
                {jobDetails?.jobTitle ?? "N/A"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Job Family
                </span>
              </div>
              <p className="text-blue-600 font-semibold">
                {jobDetails?.jobFamily ?? "N/A"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
              </div>
              <Badge
                className={
                  status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {status}
              </Badge>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Last Edited By
                </span>
              </div>
              <p className="text-blue-600 font-semibold">
                {jobDetails?.lastEditedBy ?? "N/A"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Functional Leaders
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {reviewers.map((user:string, index:number) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                    <span className="text-green-700 font-medium text-sm">{user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="bg-white p-4 rounded-lg shadow-sm"></div> */}

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Last Updated
                </span>
              </div>
              <p className="text-blue-600 font-semibold">
                {jobDetails?.lastUpdated ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-4xl mx-auto mb-8">
            {/* Updated Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Updated Job Description
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Job Code: {Number(jobCode) > 0 ? jobCode : "Invalid Job Code"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Job Summary</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">{jobDetails?.jobSummary ?? "No Job Summary available"}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Essential Functions</h4>
                  </div>
                  <div className="space-y-3 pl-4">
                    {essentialFunctionData.map((func: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-0.5 text-sm font-bold">
                          •
                        </span>
                        <p className="text-sm flex-1 leading-relaxed">{func}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
