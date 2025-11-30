"use client";

import type { AiBook } from "@/lib/types";
import { AnalyticsCard } from "./analytics-card";
import { PricingCard } from "./pricing-card";
import { SalesChannelsCard } from "./sales-channels-card";

interface SalesTabProps {
  book: AiBook;
}

export function SalesTab({ book }: SalesTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <AnalyticsCard />
        </div>
        <div className="space-y-8">
            <PricingCard book={book} />
            <SalesChannelsCard />
        </div>
    </div>
  );
}
