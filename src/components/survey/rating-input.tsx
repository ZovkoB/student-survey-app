"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingInputProps = {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function RatingInput({ value, onChange, disabled }: RatingInputProps) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isSelected = value !== undefined && rating <= value;

        return (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            aria-label={`Ocjena ${rating} od 5`}
            onClick={() => onChange(rating)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors",
              isSelected ? "text-amber-400" : "text-slate-300 hover:text-amber-400",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Star
              className={cn(
                "h-6 w-6",
                isSelected ? "fill-current" : "fill-none",
              )}
            />
          </button>
        );
      })}
      {value !== undefined && (
        <span className="text-sm font-medium text-slate-600">{value} / 5</span>
      )}
    </div>
  );
}
