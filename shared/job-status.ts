/**
 * Job workflow statuses and the rules governing "reset" (backwards) transitions.
 *
 * The status values mirror the CK_jobs_status CHECK constraint in
 * database/01_tables.sql -- a reset never introduces a new status value.
 *
 * This module is the single source of truth for both sides: the server enforces
 * `resetTargetFor` inside the transaction, and the client uses the same function
 * to decide whether to render the reset button, so the UI can never offer a
 * transition the API would reject.
 */

export const JOB_STATUSES = [
  "Not Started",
  "In Progress",
  "Submitted to HR",
  "Accepted As Is",
  "Completed",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface JobResetActor {
  isAdmin: boolean;
  isHrLeader: boolean;
}

/**
 * The only legal reset transitions.
 *
 *  - An HR Leader (or an Administrator) can pull a job back from the Functional
 *    Leader's terminal states so the Functional Leader can edit it again.
 *  - Only an Administrator can undo an HR Leader's completion, handing the job
 *    back to HR to edit and complete again.
 *
 * Returns the target status, or null when this actor may not reset a job in
 * this status.
 */
export function resetTargetFor(
  current: string | undefined | null,
  actor: JobResetActor
): JobStatus | null {
  if (
    (current === "Submitted to HR" || current === "Accepted As Is") &&
    (actor.isHrLeader || actor.isAdmin)
  ) {
    return "In Progress";
  }
  if (current === "Completed" && actor.isAdmin) {
    return "Submitted to HR";
  }
  return null;
}

/** True when *somebody* could reset a job in this status -- used to tell a 403 from a 409. */
export function isResettableStatus(current: string | undefined | null): boolean {
  return resetTargetFor(current, { isAdmin: true, isHrLeader: true }) !== null;
}

export const RESET_REASON_MAX_LENGTH = 500;

export interface ResetJobStatusRequest {
  jobId: number;
  reason: string;
}

export interface ResetJobStatusResponse {
  message: string;
  previousStatus: JobStatus;
  status: JobStatus;
}
