import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { GitCompare, ArrowLeft, FileText, Users } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn, fetchWithCredentials } from "@/lib/utils";
import FullScreenLoader from "@/components/full-screen-loader";
import { DiffBulletList } from "@/components/diff-bullet-list";
import {
  createWordDiff,
  diffSegmentClassName,
  unchangedSegments,
  type DiffSegment,
} from "@/lib/diff";
import {
  JD_LABELS,
  JD_SECTIONS,
  type JobDescriptionSectionChanges,
  type JobDescriptionSections,
} from "@shared/job-description-fields";

interface EssentialFunctionRow {
  functionText: string;
  sortOrder?: number;
  id?: number;
}

/** The slice of `GET /api/job-description/:jobCode` this page reads. */
interface JobDescriptionResponse {
  id?: number;
  jobTitle?: string;
  jobFamily?: string;
  status?: string;
  lastUpdated?: string;
  jobSummaryOriginal?: string | null;
  jobSummaryAi?: string | null;
  jobSummaryChanges?: string | null;
  essentialFunctionsOriginal?: EssentialFunctionRow[];
  essentialFunctionsAi?: EssentialFunctionRow[];
  essentialFunctionsChanges?: EssentialFunctionRow[];
  jobDescriptionSections?: Partial<JobDescriptionSections>;
  jobDescriptionSectionsAi?: Partial<JobDescriptionSections>;
  jobDescriptionSectionChanges?: JobDescriptionSectionChanges;
}

const functionsToText = (rows?: EssentialFunctionRow[]) =>
  (rows ?? []).map((row) => row.functionText).join("\n");

export default function CompareVersions() {
  // Both toggles are parked: the controls that set them are commented out
  // below, so read the value only rather than leaving a dead setter behind.
  const [showAiBox] = useState(false);
  const [showDifferencesOnly] = useState(false);

  // Get lastUpdatedDate and jobCode from URL parameters
  const [lastUpdatedDate, setLastUpdatedDate] = useState("June 7, 2025");
  const [jobCode, setJobCode] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lastUpdatedFromUrl = urlParams.get("lastUpdated");
    const jobCodeFromUrl = urlParams.get("jobCode");
    if (lastUpdatedFromUrl) {
      setLastUpdatedDate(decodeURIComponent(lastUpdatedFromUrl));
    }
    if (jobCodeFromUrl) {
      setJobCode(decodeURIComponent(jobCodeFromUrl));
    }
  }, []);

  const { data: jobDescription, isPending } = useQuery<JobDescriptionResponse>({
    queryFn: () =>
      fetchWithCredentials(`/api/job-description/${jobCode}`).then(
        (res) => res.json() as Promise<JobDescriptionResponse>
      ),
    queryKey: ["job-description", jobCode],
    enabled: !!jobCode,
  });

  useEffect(() => {
    // Scroll to top of page when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Every diff on this page reads the same way: the left of the comparison is
  // the updated (AI) job description, the right is the reviewer's edits layered
  // on top. A job nobody has edited yet has no `_changes` rows, and diffing
  // against an empty string would render the whole element as deleted.
  const jobSummaryDiff = useMemo(() => {
    const ai = jobDescription?.jobSummaryAi || "";
    return createWordDiff(ai, jobDescription?.jobSummaryChanges || ai);
  }, [jobDescription]);

  const essentialFunctionsDiff = useMemo(() => {
    const ai = functionsToText(jobDescription?.essentialFunctionsAi);
    // `||`, not `??`: `essential_functions_changes` has no marker row for a
    // deliberately emptied list, so "never edited" and "emptied" both arrive as
    // an empty array and cannot be told apart here.
    return createWordDiff(
      ai,
      functionsToText(jobDescription?.essentialFunctionsChanges) || ai
    );
  }, [jobDescription]);

  // The JD elements a Functional Leader can edit directly, in the same order
  // the editing page lists them.
  const sectionDiffs = useMemo(() => {
    const original = jobDescription?.jobDescriptionSections ?? {};
    const updated =
      jobDescription?.jobDescriptionSectionsAi ??
      jobDescription?.jobDescriptionSections ??
      {};
    const changes = jobDescription?.jobDescriptionSectionChanges ?? {};

    return JD_SECTIONS.filter(
      (section) => section.editability === "editable"
    ).map((section) => {
      const baseItems = updated[section.key] ?? [];
      // `??`, not `||`: an element the reviewer emptied comes back as an empty
      // array and has to diff as a full deletion rather than fall back to the
      // baseline and silently look untouched.
      const currentItems = changes[section.key] ?? baseItems;
      return {
        key: section.key,
        label: section.label,
        originalItems: original[section.key] ?? [],
        segments: createWordDiff(baseItems.join("\n"), currentItems.join("\n")),
      };
    });
  }, [jobDescription]);

  // Function to render diff segments for current version (right side)
  const renderDiffSegments = (segments: DiffSegment[]) => {
    if (!segments || segments.length === 0) {
      return <span>No content to compare</span>;
    }

    return segments.map((segment, index) => {
      if (showDifferencesOnly && segment.type === "unchanged") {
        return null;
      }

      return (
        <span key={index} className={diffSegmentClassName(segment.type)}>
          {segment.text}
        </span>
      );
    });
  };

  // Function to render original text with word-by-word highlighting
  const renderOriginalWithDiff = (segments: DiffSegment[]) => {
    if (!segments || segments.length === 0) {
      return <span>No content to compare</span>;
    }

    return segments.map((segment, index) => {
      if (showDifferencesOnly && segment.type === "unchanged") {
        return null;
      }

      // Don't show added text in original, but add spacing
      if (segment.type === "added") {
        return (
          <span key={index} className="text-transparent select-none">
            {segment.text}
          </span>
        );
      }

      return (
        <span key={index} className={diffSegmentClassName(segment.type)}>
          {segment.text}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      {/* Loading Overlay. Driven by the query so the panels never show their
          "Not specified" placeholders for elements that are merely still
          loading, which reads as real content. */}
      {isPending && <FullScreenLoader />}

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <GitCompare className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Compare Versions
                  </h1>
                  {jobCode && (
                    <p className="text-sm text-gray-600 mt-1">
                      Job Code: {jobCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              asChild
              className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-xs px-2 py-1 h-7"
            >
              <Link href={`/editing?jobCode=${jobCode}`}>
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Link>
            </Button>
          </div>

          {/* cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Job Title
                </span>
              </div>
              <p className="text-blue-600 font-semibold">
                {jobDescription?.jobTitle}
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
                {jobDescription?.jobFamily}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Status</span>
              </div>
              <Badge
                className={
                  jobDescription?.status === "Complete"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {jobDescription?.status}
              </Badge>
            </div>
          </div>

          {/* Comparison Boxes with Synchronized Sections */}
          <div className="space-y-8">
            {/* Headers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6 border-b bg-gray-50 h-full">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Original Job Description
                    </h3>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6 border-b bg-green-50 h-full">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Current Version
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Last Updated {jobDescription?.lastUpdated}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Summary Section */}
            <div
              className={cn(
                `grid grid-cols-1  gap-6`,
                showAiBox ? "lg:grid-cols-3" : "lg:grid-cols-2"
              )}
            >
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">
                    {JD_LABELS.positionSummary}
                  </h4>
                  <div className="bg-gray-50 border rounded p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {jobDescription?.jobSummaryOriginal}
                  </div>
                </div>
              </div>

              {showAiBox && (
                <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                  <div className="p-6">
                    <h4 className="font-semibold mb-3">
                      {JD_LABELS.positionSummary} AI
                    </h4>
                    <div className="bg-gray-50 border rounded p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {renderOriginalWithDiff(jobSummaryDiff)}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">
                    {JD_LABELS.positionSummary}
                  </h4>
                  <div className="bg-gray-50 border rounded p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {renderDiffSegments(jobSummaryDiff)}
                  </div>
                </div>
              </div>
            </div>

            {/* Essential Functions Section */}
            <div
              className={cn(
                "grid grid-cols-1 gap-6",
                showAiBox ? "lg:grid-cols-3" : "lg:grid-cols-2"
              )}
            >
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">
                    {JD_LABELS.essentialFunctions}:
                  </h4>
                  <div className="space-y-2 text-sm whitespace-pre-wrap">
                    <ul className="list-disc list-outside space-y-2 pl-5">
                      {jobDescription?.essentialFunctionsOriginal?.map(
                        (c, i) => (
                          <li key={i} className="leading-relaxed">
                            {c.functionText}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {showAiBox && (
                <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                  <div className="p-6">
                    <h4 className="font-semibold mb-3">
                      {JD_LABELS.essentialFunctions} AI:
                    </h4>
                    <div className="space-y-2 text-sm whitespace-pre-wrap">
                      {renderOriginalWithDiff(essentialFunctionsDiff)}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">
                    {JD_LABELS.essentialFunctions}:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <DiffBulletList segments={essentialFunctionsDiff} />
                  </div>
                </div>
              </div>
            </div>

            {/* The remaining editable JD elements. The elements a reviewer
                cannot edit have no change storage at all, so a track-changes
                panel for them would always be empty. */}
            {sectionDiffs.map((section) => (
              <div
                key={section.key}
                className={cn(
                  "grid grid-cols-1 gap-6",
                  showAiBox ? "lg:grid-cols-3" : "lg:grid-cols-2"
                )}
              >
                <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                  <div className="p-6">
                    <h4 className="font-semibold mb-3">{section.label}</h4>
                    <div className="space-y-2 text-sm">
                      <DiffBulletList
                        segments={unchangedSegments(section.originalItems)}
                      />
                    </div>
                  </div>
                </div>

                {showAiBox && (
                  <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                    <div className="p-6">
                      <h4 className="font-semibold mb-3">{section.label} AI</h4>
                      <div className="space-y-2 text-sm">
                        {renderOriginalWithDiff(section.segments)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                  <div className="p-6">
                    <h4 className="font-semibold mb-3">{section.label}</h4>
                    <div className="space-y-2 text-sm">
                      <DiffBulletList segments={section.segments} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
