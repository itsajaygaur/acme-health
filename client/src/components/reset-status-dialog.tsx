import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { fetchWithCredentials, getLoggedInUser, hasRole } from "@/lib/utils";
import {
  RESET_REASON_MAX_LENGTH,
  resetTargetFor,
  type JobStatus,
} from "@shared/job-status";

interface ResetStatusButtonProps {
  jobId: number | undefined;
  jobCode: string | number | undefined;
  /** The job's current status, straight from the API. */
  status: string | undefined;
  /** Called after a successful reset, with the new status. */
  onReset?: (newStatus: JobStatus) => void;
}

/**
 * "Reset" lets a leader undo the step below them when a record was submitted or
 * completed in error. Renders nothing unless the signed-in user is allowed to
 * reset a job in this particular status -- resetTargetFor() is the same
 * function the server enforces, so this button can never offer a transition the
 * API would reject.
 */
export function ResetStatusButton({
  jobId,
  jobCode,
  status,
  onReset,
}: ResetStatusButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const loggedInUser = getLoggedInUser();
  const target = resetTargetFor(status, {
    isAdmin: hasRole(loggedInUser, "admin"),
    isHrLeader: hasRole(loggedInUser, "hrleader"),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithCredentials(`/api/job/reset-status`, {
        method: "POST",
        body: JSON.stringify({ jobId, reason: reason.trim() }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to reset job status");
      }
      return res.json() as Promise<{ status: JobStatus }>;
    },
    onSuccess: (result) => {
      setOpen(false);
      setReason("");
      toast({ title: `Job reset to ${result.status}` });
      onReset?.(result.status);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  if (!target) return null;

  const returningToLeader = target === "In Progress";
  const label = returningToLeader
    ? "Reset to Functional Leader"
    : "Reset to HR Leader";

  return (
    <>
      <Button
        variant="outline"
        className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
        onClick={() => setOpen(true)}
        // Deliberately NOT gated on the page's `isCompleted` flag: that flag is
        // true for exactly the statuses this button exists to undo.
        disabled={resetMutation.isPending || !jobId}
      >
        {resetMutation.isPending ? "Resetting..." : label}
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{label}</AlertDialogTitle>
            <AlertDialogDescription>
              This moves job {jobCode} from <b>{status}</b> back to{" "}
              <b>{target}</b>, so{" "}
              {returningToLeader
                ? "the Functional Leader"
                : "the HR Leader"}{" "}
              can view and edit it again. The job description itself is not
              changed &mdash; only its status.
              <br />
              <br />
              Please give a short reason. It is sent with the notification so
              they know what to correct.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={reason}
            onChange={(e) =>
              setReason(e.target.value.slice(0, RESET_REASON_MAX_LENGTH))
            }
            maxLength={RESET_REASON_MAX_LENGTH}
            placeholder="Reason for resetting this job..."
            className="min-h-[96px]"
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!reason.trim() || resetMutation.isPending}
              // AlertDialogAction closes the dialog on click by default, which
              // would drop the pending state and hide any error.
              onClick={(e) => {
                e.preventDefault();
                resetMutation.mutate();
              }}
            >
              {resetMutation.isPending ? "Resetting..." : "Reset Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
