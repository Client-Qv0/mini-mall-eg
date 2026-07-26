import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  baseUrl: string;
};

export function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <PageLink
        baseUrl={baseUrl}
        page={page - 1}
        disabled={page <= 1}
        label="上一页"
      />

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .map((p, idx, arr) => {
          const prev = arr[idx - 1];
          return (
            <span key={p} className="flex items-center">
              {prev && p - prev > 1 && (
                <span className="px-2 text-zinc-400">...</span>
              )}
              <PageLink
                baseUrl={baseUrl}
                page={p}
                active={p === page}
                label={String(p)}
              />
            </span>
          );
        })}

      <PageLink
        baseUrl={baseUrl}
        page={page + 1}
        disabled={page >= totalPages}
        label="下一页"
      />
    </div>
  );
}

function PageLink({
  baseUrl,
  page,
  disabled,
  active,
  label,
}: {
  baseUrl: string;
  page: number;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  const cls = cn(
    "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors",
    active && "bg-primary text-white",
    !active &&
      !disabled &&
      "text-zinc-700 hover:bg-zinc-100",
    disabled && "text-zinc-300 pointer-events-none"
  );

  if (disabled) {
    return <span className={cls}>{label}</span>;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return (
    <Link
      href={`${baseUrl}${separator}page=${page}`}
      className={cls}
    >
      {label}
    </Link>
  );
}
