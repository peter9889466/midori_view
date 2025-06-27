"use client";

import { useState, useMemo } from "react";
import type { TradeData, SortField, SortConfig } from "../types/rankings";

export function useSorting(data: TradeData[], defaultSort: SortConfig) {
    const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSort);

    const sortedData = useMemo(() => {
        const sortableData = [...data];

        sortableData.sort((a, b) => {
            const aValue = a[sortConfig.field];
            const bValue = b[sortConfig.field];

            if (aValue < bValue) {
                return sortConfig.order === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.order === "asc" ? 1 : -1;
            }
            return 0;
        });

        // Update ranks based on sorted order
        return sortableData.map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
    }, [data, sortConfig]);

    const handleSort = (field: SortField) => {
        setSortConfig((prevConfig) => ({
            field,
            order:
                prevConfig.field === field && prevConfig.order === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    return {
        sortedData,
        sortConfig,
        handleSort,
    };
}
