import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "../../lib/tailwind-utils";
import { buttonVariants } from "./button";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const Pagination = ({
                        className,
                        ...props
                    }) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props} />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("flex flex-row items-center gap-1", className)}
        {...props} />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
                            className,
                            isActive,
                            size = "icon",
                            ...props
                        }) => (
    <a
        aria-current={isActive ? "page" : undefined}
        className={cn(
            buttonVariants({
                variant: isActive ? "outline" : "ghost",
                size,
            }),
            isActive && `border-[${COLORS[0]}] text-[${textColor}] bg-[${cardBgColor}]`,
            !isActive && `text-[${secondaryTextColor}] hover:text-[${textColor}] hover:bg-[${cardBgColor}]/50`,
            "transition-colors duration-200",
            className
        )}
        {...props} />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
                                className,
                                ...props
                            }) => (
    <PaginationLink
        aria-label="Ke halaman sebelumnya"
        size="default"
        className={cn("gap-1 pl-2.5 text-sm md:text-base", className)}
        {...props}>
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
    </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
                            className,
                            ...props
                        }) => (
    <PaginationLink
        aria-label="Ke halaman berikutnya"
        size="default"
        className={cn("gap-1 pr-2.5 text-sm md:text-base", className)}
        {...props}>
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
                                className,
                                ...props
                            }) => (
    <span
        aria-hidden
        className={cn(`flex h-9 w-9 items-center justify-center text-[${secondaryTextColor}]`, className)}
        {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Halaman lainnya</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
}