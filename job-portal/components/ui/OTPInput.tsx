import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function OTPInput({ value, onChange, error }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into 6 elements
  const items = value.split('').concat(Array(6).fill('')).slice(0, 6);

  useEffect(() => {
    // Autofocus first empty field
    const emptyIndex = items.findIndex((i) => !i);
    const index = emptyIndex === -1 ? 5 : emptyIndex;
    inputsRef.current[index]?.focus();
  }, []);

  const handleChange = (val: string, index: number) => {
    const freshVal = val.replace(/[^0-9]/g, '');
    const current = [...items];
    current[index] = freshVal.slice(-1); // take last character

    const combined = current.join('');
    onChange(combined);

    // Shift focus forward
    if (freshVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !items[index] && index > 0) {
      // Shift focus backward
      const current = [...items];
      current[index - 1] = '';
      onChange(current.join(''));
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().slice(0, 6).replace(/[^0-9]/g, '');
    if (pasteData) {
      onChange(pasteData);
      const focusIndex = Math.min(pasteData.length, 5);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex justify-center gap-2 select-none">
        {items.map((char, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={1}
            value={char}
            onPaste={handlePaste}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-12 h-14 border rounded-xl text-center text-2xl font-extrabold text-text-primary bg-white transition-all duration-150 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
              error ? 'border-accent-rose focus:border-accent-rose' : 'border-surface-mid'
            }`}
          />
        ))}
      </div>
      {error && <span className="text-xs font-semibold text-accent-rose mt-1 text-center">{error}</span>}
    </div>
  );
}
