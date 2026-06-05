import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface AuditPaginationProps {
  currentPage: number
  totalPages: number
  totalMatching: number
  pageSize: number
  q?: string
  entityTypeParam?: string
  statusParam?: string
  fromParam?: string
  toParam?: string
}

export function AuditPagination({ currentPage, totalPages, totalMatching, pageSize, q, entityTypeParam, statusParam, fromParam, toParam }: AuditPaginationProps) {
  if (totalMatching === 0) return null

  const getPageUrl = (pageNum: number) => {
    const paramsObj = new URLSearchParams()
    if (q) paramsObj.set("q", q)
    if (entityTypeParam) paramsObj.set("entityType", entityTypeParam)
    if (statusParam) paramsObj.set("status", statusParam)
    if (fromParam) paramsObj.set("from", fromParam)
    if (toParam) paramsObj.set("to", toParam)
    paramsObj.set("page", pageNum.toString())
    return `/organisation/audit-logs?${paramsObj.toString()}`
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      <p className="text-sm text-muted-foreground shrink-0 font-medium">
        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalMatching)} of{" "}
        {totalMatching} record{totalMatching !== 1 ? "s" : ""}
      </p>
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href={getPageUrl(currentPage - 1)} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Show pages around current page
              if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                return (
                  <PaginationItem key={p}>
                    <PaginationLink href={getPageUrl(p)} isActive={p === currentPage}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <PaginationItem key={p}>
                    <span className="px-2 text-muted-foreground text-xs font-black">...</span>
                  </PaginationItem>
                )
              }
              return null
            })}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext href={getPageUrl(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
