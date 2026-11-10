import type { JobStatus } from "./job-status";
import type { JobDescriptionSections } from "./job-description-fields";

export interface JobFinalReview {
  essentialFunctions: string[];   // List of function texts
  reviewers: string[];            // List of reviewer names
  jobDetails: {
    id: number;
    jobTitle: string;
    jobCode: string;
    jobFamily: string;
    status: JobStatus;
    lastEditedBy: string;
    lastUpdated: string;          // Use Date if parsing
    jobSummary: string;
  };
  // Education, experience, certification, environmental and physical
  // elements, with the reviewer's edits applied to the editable ones.
  jobDescriptionSections: JobDescriptionSections;
}
