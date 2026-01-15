"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm(): React.ReactNode {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        Check your email for the magic link!
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          disabled={isLoading}
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>

      {error ? <div className="text-destructive text-sm">{error}</div> : null}

      <Button disabled={isLoading} type="submit">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              aria-label="Loading"
              className="h-4 w-4 animate-spin"
              fill="none"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
            Sending...
          </span>
        ) : (
          "Send Magic Link"
        )}
      </Button>
    </form>
  );
}
