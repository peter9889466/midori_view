"use client";

import type React from "react";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { TableHead } from "./ui/table";
import type { SortField, SortOrder } from "../types/rankings";

interface SortableTableHeaderProps {
    field: SortField;
    currentSortField: SortField;
    currentSortOrder: SortOrder;
    onSort: (field: SortField) => void;
    children: React.ReactNode;
}

export function SortableTableHeader({
    field,
    currentSortField,
    currentSortOrder,
    onSort,
    children,
}: SortableTableHeaderProps) {
    const isActive = currentSortField === field;

    const getSortIcon = () => {
        if (!isActive) {
            return <ChevronsUpDown className="ml-2 h-4 w-4" />;
        }
        return currentSortOrder === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
        );
    };

    return (
        <TableHead>
            <button
                className="flex items-center hover:text-foreground transition-colors"
                onClick={() => onSort(field)}
            >
                {children}
                {getSortIcon()}
            </button>
        </TableHead>
    );
}
