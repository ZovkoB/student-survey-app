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
            aria-label={`Rate ${rating} out of 5`}
            onClick={() => onChange(rating)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Star
              className={cn(
                "h-5 w-5",
                isSelected ? "fill-current" : "fill-none",
              )}
            />
          </button>
        );
      })}
      {value !== undefined && (
        <span className="text-sm text-muted-foreground">{value} / 5</span>
      )}
    </div>
  );
}
