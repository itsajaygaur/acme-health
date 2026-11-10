import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JdComment } from "@shared/job-description-fields";

/** The draft a reviewer is typing. Only one comment is open at a time, so this
 *  lives on the page and is handed to whichever element hosts the open editor. */
export interface JdCommentDraft {
  text: string;
  category: string;
  isCritical: boolean;
}

/**
 * The comment thread for one JD element: its existing comments, plus the inline
 * editor when one of them is open. Rendered directly underneath the element the
 * comments are about, so a reviewer never leaves the element to comment on it.
 */
export function JdSectionComments({
  comments,
  editingCommentId,
  draft,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  disabled,
}: {
  comments: JdComment[];
  editingCommentId: number | null;
  draft: JdCommentDraft;
  onDraftChange: (patch: Partial<JdCommentDraft>) => void;
  onEdit: (comment: JdComment) => void;
  onCancel: (comment: JdComment) => void;
  onSave: (comment: JdComment) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
}) {
  if (!comments.length) return null;

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white shadow-sm rounded-xl border border-gray-200 p-4"
        >
          {editingCommentId === comment.id ? (
            <div className="space-y-4">
              {/* Category Selector */}
              <div className="flex gap-4 items-end">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <Select
                    value={draft.category}
                    onValueChange={(value) => onDraftChange({ category: value })}
                  >
                    <SelectTrigger className="w-[200px] h-9 mt-1">
                      <SelectValue placeholder="Select a Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        <SelectItem value="generic">Generic</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="flex items-center space-x-2 mb-2"
                  title="Please note, we are currently working on updating content related to the Other Job Description.  Please only check this box if the comment below is related to a field in the Other Job Description section that needs to be addressed prior to January 1st, 2026."
                >
                  <input
                    type="checkbox"
                    id={`critical-checkbox-${comment.id}`}
                    checked={draft.isCritical}
                    onChange={(e) =>
                      onDraftChange({ isCritical: e.target.checked })
                    }
                    className="h-4 w-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`critical-checkbox-${comment.id}`}
                    className="text-sm font-medium cursor-pointer text-red-600"
                  >
                    Critical
                  </label>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Comment
                </label>
                <Textarea
                  value={draft.text}
                  disabled={!draft.category}
                  onChange={(e) => onDraftChange({ text: e.target.value })}
                  className="min-h-[120px] resize-none mt-1"
                  placeholder="Write your comment..."
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(comment)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!draft.category || !draft.text?.trim()}
                  onClick={() => onSave(comment)}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                {/* Meta Info */}
                <div className="flex flex-col gap-1">
                  <div>
                    {comment.category && (
                      <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full w-fit">
                        {comment.category}
                      </span>
                    )}
                    {comment.isCritical && (
                      <span className="inline-flex items-center text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full ml-2">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500 items-center">
                    {comment.author && (
                      <>
                        <p>{comment.author}</p>
                        <span>•</span>
                      </>
                    )}
                    <p>{comment.createdAt}</p>
                  </div>
                </div>

                {comment.isEditable && (
                  <div>
                    {/* Edit Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(comment)}
                      className="h-8 w-8 rounded-full"
                      disabled={disabled}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Delete Icon */}
                    <AlertDialog>
                      <AlertDialogTrigger disabled={disabled}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(comment.id)}
                          >
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {/* Comment Text */}
              <p className="text-gray-800 leading-relaxed">{comment.comment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
