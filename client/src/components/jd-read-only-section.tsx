import type { ReactNode } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A read-only job description element: a heading plus its bullet list, or a
 * muted placeholder when the element has no content for this job.
 *
 * Elements that reviewers cannot edit directly but may request changes to get
 * an `onAddComment` action, which opens the comment box for that element.
 *
 * `children` is the element's comment thread, rendered under its bullets so the
 * comments and the content they are about stay together.
 */
export function JdReadOnlySection({
  label,
  items,
  onAddComment,
  disabled,
  children,
}: {
  label: string;
  items?: string[];
  onAddComment?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{label}</h4>
        {onAddComment && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddComment}
            disabled={disabled}
            title={`Comment on ${label}`}
            className="flex items-center gap-2 text-xs"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Add comment
          </Button>
        )}
      </div>
      {items?.length ? (
        <ul className="space-y-2 text-sm list-disc list-inside">
          {items.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 italic">Not specified</p>
      )}
      {children}
    </div>
  );
}
