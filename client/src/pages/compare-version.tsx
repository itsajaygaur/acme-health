import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCompare, Bell, Clock, User, FileText, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface JobVersion {
  id: number;
  jobCode: string;
  jobTitle: string;
  version: string;
  lastModified: string;
  modifiedBy: string;
  status: "draft" | "approved" | "rejected";
  changesSummary: string;
  description: string;
  department: string;
  salary: string;
  location: string;
  requirements: string[];
  responsibilities: string[];
}

interface ComparisonSection {
  field: string;
  oldValue: string;
  newValue: string;
  hasChanged: boolean;
}

export default function CompareVersion() {
  const [selectedJob, setSelectedJob] = useState("");
  const [version1, setVersion1] = useState("");
  const [version2, setVersion2] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sample job versions data
  const jobVersions: JobVersion[] = [
    {
      id: 1,
      jobCode: "10001",
      jobTitle: "Software Engineer",
      version: "v1.0",
      lastModified: "2025-06-01 10:30",
      modifiedBy: "Kelly Johnson",
      status: "approved",
      changesSummary: "Initial version",
      description: "Develop and maintain software applications using modern technologies.",
      department: "Engineering",
      salary: "$75,000 - $95,000",
      location: "Remote",
      requirements: ["Bachelor's degree in Computer Science", "3+ years experience", "JavaScript proficiency"],
      responsibilities: ["Write clean code", "Participate in code reviews", "Collaborate with team"]
    },
    {
      id: 2,
      jobCode: "10001",
      jobTitle: "Software Engineer",
      version: "v1.1",
      lastModified: "2025-06-05 14:15",
      modifiedBy: "John Smith",
      status: "draft",
      changesSummary: "Updated salary range and added remote work options",
      description: "Develop and maintain software applications using modern technologies. Work remotely or hybrid.",
      department: "Engineering",
      salary: "$80,000 - $105,000",
      location: "Remote/Hybrid",
      requirements: ["Bachelor's degree in Computer Science", "3+ years experience", "JavaScript and TypeScript proficiency"],
      responsibilities: ["Write clean, maintainable code", "Participate in code reviews", "Collaborate with cross-functional teams", "Mentor junior developers"]
    },
    {
      id: 3,
      jobCode: "10002",
      jobTitle: "Radiology Tech",
      version: "v1.0",
      lastModified: "2025-06-02 09:45",
      modifiedBy: "Michelle Brown",
      status: "approved",
      changesSummary: "Initial version",
      description: "Perform diagnostic imaging procedures and maintain radiology equipment.",
      department: "Radiology",
      salary: "$55,000 - $70,000",
      location: "On-site",
      requirements: ["Associate degree in Radiologic Technology", "ARRT certification", "2+ years experience"],
      responsibilities: ["Perform X-rays and CT scans", "Maintain equipment", "Ensure patient safety"]
    }
  ];

  // Sample notifications
  const notifications = [
    { id: 1, title: "Version comparison requested", message: "HR requested comparison for job 10001", timestamp: "5 min ago" },
    { id: 2, title: "New version available", message: "Software Engineer job updated to v1.2", timestamp: "1 hour ago" }
  ];

  const uniqueJobs = Array.from(new Set(jobVersions.map(v => v.jobCode)))
    .map(code => jobVersions.find(v => v.jobCode === code)!)
    .filter(Boolean);

  const selectedJobVersions = jobVersions.filter(v => v.jobCode === selectedJob);
  const version1Data = jobVersions.find(v => v.jobCode === selectedJob && v.version === version1);
  const version2Data = jobVersions.find(v => v.jobCode === selectedJob && v.version === version2);

  // Generate comparison data
  const getComparisons = (): ComparisonSection[] => {
    if (!version1Data || !version2Data) return [];

    return [
      {
        field: "Job Title",
        oldValue: version1Data.jobTitle,
        newValue: version2Data.jobTitle,
        hasChanged: version1Data.jobTitle !== version2Data.jobTitle
      },
      {
        field: "Description",
        oldValue: version1Data.description,
        newValue: version2Data.description,
        hasChanged: version1Data.description !== version2Data.description
      },
      {
        field: "Department",
        oldValue: version1Data.department,
        newValue: version2Data.department,
        hasChanged: version1Data.department !== version2Data.department
      },
      {
        field: "Salary Range",
        oldValue: version1Data.salary,
        newValue: version2Data.salary,
        hasChanged: version1Data.salary !== version2Data.salary
      },
      {
        field: "Location",
        oldValue: version1Data.location,
        newValue: version2Data.location,
        hasChanged: version1Data.location !== version2Data.location
      },
      {
        field: "Requirements",
        oldValue: version1Data.requirements.join(", "),
        newValue: version2Data.requirements.join(", "),
        hasChanged: JSON.stringify(version1Data.requirements) !== JSON.stringify(version2Data.requirements)
      },
      {
        field: "Responsibilities",
        oldValue: version1Data.responsibilities.join(", "),
        newValue: version2Data.responsibilities.join(", "),
        hasChanged: JSON.stringify(version1Data.responsibilities) !== JSON.stringify(version2Data.responsibilities)
      }
    ];
  };

  const comparisons = getComparisons();
  const changedFields = comparisons.filter(c => c.hasChanged);

  const toggleSection = (field: string) => {
    setExpandedSections(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <GitCompare className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Compare Versions</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{notifications.length}</span>
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Beta Banner */}
          <div className="mb-6 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="font-semibold text-sm">⚠️ PRE-PROD RELEASE BETA 1.0</span>
            </div>
          </div>

          {/* Selection Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Select Versions to Compare</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueJobs.map((job) => (
                        <SelectItem key={job.jobCode} value={job.jobCode}>
                          {job.jobCode} - {job.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version 1 (Old)</label>
                  <Select value={version1} onValueChange={setVersion1} disabled={!selectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select version..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedJobVersions.map((version) => (
                        <SelectItem key={version.id} value={version.version}>
                          {version.version} - {version.lastModified}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version 2 (New)</label>
                  <Select value={version2} onValueChange={setVersion2} disabled={!selectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select version..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedJobVersions.map((version) => (
                        <SelectItem key={version.id} value={version.version}>
                          {version.version} - {version.lastModified}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {version1 && version2 && version1 !== version2 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">Comparing:</span>
                        <span className="ml-2">{version1}</span>
                        <ArrowRight className="w-4 h-4 inline mx-2 text-gray-400" />
                        <span>{version2}</span>
                      </div>
                    </div>
                    <Badge variant={changedFields.length > 0 ? "destructive" : "secondary"}>
                      {changedFields.length} changes found
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Version Information */}
          {version1Data && version2Data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{version1Data.version} (Old Version)</span>
                    <Badge variant={version1Data.status === "approved" ? "default" : "secondary"}>
                      {version1Data.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Modified: {version1Data.lastModified}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">By: {version1Data.modifiedBy}</span>
                    </div>
                    <p className="text-gray-700 mt-2">{version1Data.changesSummary}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{version2Data.version} (New Version)</span>
                    <Badge variant={version2Data.status === "approved" ? "default" : "secondary"}>
                      {version2Data.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Modified: {version2Data.lastModified}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">By: {version2Data.modifiedBy}</span>
                    </div>
                    <p className="text-gray-700 mt-2">{version2Data.changesSummary}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Comparison Results */}
          {comparisons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Field Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparisons.map((comparison) => (
                    <div
                      key={comparison.field}
                      className={`border rounded-lg p-4 ${
                        comparison.hasChanged ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{comparison.field}</h3>
                          {comparison.hasChanged && (
                            <Badge variant="destructive" className="text-xs">Changed</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(comparison.field)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedSections.includes(comparison.field) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {expandedSections.includes(comparison.field) && (
                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <h4 className="text-sm font-medium text-red-800 mb-2">Old Version</h4>
                            <p className="text-sm text-gray-700">{comparison.oldValue}</p>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <h4 className="text-sm font-medium text-green-800 mb-2">New Version</h4>
                            <p className="text-sm text-gray-700">{comparison.newValue}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {changedFields.length === 0 && comparisons.length > 0 && (
                  <div className="text-center py-8">
                    <GitCompare className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-green-600 font-medium">No differences found between these versions</p>
                    <p className="text-gray-500 text-sm mt-1">Both versions are identical</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}


        </div>
      </main>
    </div>
  );
}