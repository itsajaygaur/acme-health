import {
  diffSegmentClassName,
  groupDiffSegmentsByLines,
  type DiffSegment,
} from "@/lib/diff";

/**
 * A bullet list rendered from diff segments, one bullet per line, with the
 * reviewer's insertions and deletions marked up.
 *
 * Pass `unchangedSegments(items)` to render a plain list through the same
 * markup, so an original and a current column sit side by side without their
 * bullets drifting apart.
 */
export function DiffBulletList({
  segments,
  emptyText = "Not specified",
}: {
  segments: DiffSegment[];
  emptyText?: string;
}) {
  const lines = groupDiffSegmentsByLines(segments);

  if (!lines.length) {
    return <p className="text-sm text-gray-400 italic">{emptyText}</p>;
  }

  return (
    <ul className="list-disc list-outside pl-5 space-y-2">
      {lines.map((lineSegments, index) => (
        <li key={index} className="leading-relaxed">
          {lineSegments.map((segment, segmentIndex) => (
            <span key={segmentIndex} className={diffSegmentClassName(segment.type)}>
              {segment.text}{" "}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
