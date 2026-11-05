import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrationSchema } from "@/lib/chat-validation";
import { usePortfolioAuth } from "./auth-provider";

export function AccountForm({ reset = false }: { reset?: boolean }) {
  const { user, recovery } = usePortfolioAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const changing = reset && !!user && recovery;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const display_name = String(form.get("display_name") ?? "").trim();
    setBusy(true);
    try {
      if (changing) {
        if (password.length < 8) throw new Error("Use at least 8 characters.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setNotice("Password updated. You can return to Let's Talk.");
      } else if (mode === "signup") {
        const result = registrationSchema.safeParse({ email, password, display_name });
        if (!result.success)
          throw new Error(result.error.issues[0]?.message ?? "Check your details.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name }, emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        if (!data.session)
          setNotice("Check your email and confirm your account, then sign in here.");
      } else if (mode === "forgot" || reset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice(
          "If an account exists, a password reset link has been sent. Check your inbox and spam folder.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      {!reset && (
        <div className="flex border-b">
          <Button
            variant={mode === "signin" ? "secondary" : "ghost"}
            onClick={() => {
              setMode("signin");
              setNotice("");
              setError("");
            }}
          >
            Sign in
          </Button>
          <Button
            variant={mode === "signup" ? "secondary" : "ghost"}
            onClick={() => {
              setMode("signup");
              setNotice("");
              setError("");
            }}
          >
            Create account
          </Button>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && !reset && (
          <label className="block text-sm">
            Display name
            <Input
              name="display_name"
              required
              maxLength={80}
              autoComplete="nickname"
              className="mt-2"
            />
          </label>
        )}
        {!changing && (
          <label className="block text-sm">
            Email address
            <Input name="email" type="email" required autoComplete="email" className="mt-2" />
          </label>
        )}
        {(changing || (!reset && mode !== "forgot")) && (
          <label className="block text-sm">
            {changing ? "New password" : "Password"}
            <Input
              name="password"
              type="password"
              required
              minLength={mode === "signup" || changing ? 8 : undefined}
              autoComplete={changing || mode === "signup" ? "new-password" : "current-password"}
              className="mt-2"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
        <Button className="h-11 w-full" disabled={busy}>
          {busy
            ? "Please wait…"
            : changing
              ? "Update password"
              : reset || mode === "forgot"
                ? "Send reset link"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
        </Button>
        {!reset && mode !== "signup" && (
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => setMode(mode === "forgot" ? "signin" : "forgot")}
          >
            {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
          </Button>
        )}
      </form>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Your name, account email and messages are stored to support this conversation. Request
        account and conversation deletion by messaging Nehemiah.
      </p>
    </div>
  );
}
