"use client";

import { Minus, Plus } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  id,
  className,
}: QuantityInputProps): React.ReactElement {
  function handleInputChange(inputValue: string): void {
    const parsed = Number.parseInt(inputValue, 10);
    if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    } else if (inputValue === "") {
      onChange(min);
    }
  }

  function decrement(): void {
    if (value > min) {
      onChange(value - 1);
    }
  }

  function increment(): void {
    if (value < max) {
      onChange(value + 1);
    }
  }

  return (
    <InputGroup className={cn("w-24", className)}>
      <InputGroupAddon className="pl-0.5">
        <InputGroupButton
          aria-label="Decrease quantity"
          disabled={disabled || value <= min}
          onClick={decrement}
          size="icon-sm"
          variant="ghost"
        >
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        className="text-center"
        disabled={disabled}
        id={id}
        inputMode="numeric"
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        type="text"
        value={value}
      />
      <InputGroupAddon align="inline-end" className="pr-0.5">
        <InputGroupButton
          aria-label="Increase quantity"
          disabled={disabled || value >= max}
          onClick={increment}
          size="icon-sm"
          variant="ghost"
        >
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
