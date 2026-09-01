import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StarRating({
  rating,
  interactive = false,
  onChange,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'text-sm gap-0.5',
    md: 'text-base gap-1',
    lg: 'text-2xl gap-1.5',
  };

  const handleRating = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`inline-flex items-center select-none ${sizes[size]} ${className}`}>
      {[1, 2, 3, 4, 5].map((num) => {
        const isFilled = num <= (hoverRating || rating);
        return (
          <span
            key={num}
            className={`material-symbols-outlined transition-all duration-100 ${
              isFilled ? 'text-amber-500 scale-105' : 'text-surface-mid'
            } ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
            style={{ fontVariationSettings: isFilled ? '"FILL" 1, "wght" 400' : '"FILL" 0, "wght" 400' }}
            onMouseEnter={() => interactive && setHoverRating(num)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => handleRating(num)}
          >
            star
          </span>
        );
      })}
    </div>
  );
}
