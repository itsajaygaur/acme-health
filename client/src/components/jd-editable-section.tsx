import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

export type JdSectionItem = { id: number; text: string };

/**
 * An editable job description element: add, edit and remove items, plus a
 * reset back to the values parsed from the original job description.
 */
export function JdEditableSection({
  label,
  items,
  onChange,
  onReset,
  canReset,
  disabled,
}: {
  label: string;
  items: JdSectionItem[];
  onChange: (items: JdSectionItem[]) => void;
  onReset: () => void;
  canReset: boolean;
  disabled?: boolean;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (item: JdSectionItem) => {
    setEditingId(item.id);
    setDraft(item.text);
  };

  const commitEdit = () => {
    if (editingId === null) return;
    const text = draft.trim();
    // An item left blank was never really added, so drop it rather than
    // persisting an empty bullet.
    onChange(
      text
        ? items.map((item) =>
            item.id === editingId ? { ...item, text } : item
          )
        : items.filter((item) => item.id !== editingId)
    );
    setEditingId(null);
    setDraft("");
  };

  const cancelEdit = () => {
    if (editingId === null) return;
    const existing = items.find((item) => item.id === editingId);
    if (existing && !existing.text) {
      onChange(items.filter((item) => item.id !== editingId));
    }
    setEditingId(null);
    setDraft("");
  };

  const addItem = () => {
    const id = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    onChange([...items, { id, text: "" }]);
    setEditingId(id);
    setDraft("");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{label}</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          disabled={disabled || !canReset}
          title="Reset to the original job description"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && editingId === null && (
          <p className="text-sm text-gray-400 italic">Not specified</p>
        )}

        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="space-y-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="text-sm min-h-[70px]"
                placeholder={`Enter ${label}...`}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={commitEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className="flex items-start space-x-3 p-2 bg-gray-50 rounded"
            >
              <p className="text-sm flex-1 pr-2">{item.text}</p>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-auto min-w-0"
                onClick={() => startEdit(item)}
                disabled={disabled}
                title={`Edit ${label}`}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-auto min-w-0"
                onClick={() =>
                  onChange(items.filter((entry) => entry.id !== item.id))
                }
                disabled={disabled}
                title={`Delete from ${label}`}
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={addItem}
          disabled={disabled || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
