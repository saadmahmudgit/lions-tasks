import { useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import Index from "@/pages/Index";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, isPending, error } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (isPending) {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Checking your session...</p>
      </main>
    );
  }

  if (error || !session) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      const { error: clientError } = await authClient.signOut();
      if (clientError) {
        throw new Error(clientError.message || "Sign out failed.");
      }

      window.location.href = "/auth";
    } catch (firstError) {
      // Fallback request for environments where the client helper fails.
      try {
        const response = await fetch("/api/auth/sign-out", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (!response.ok) {
          const raw = await response.text().catch(() => "");
          throw new Error(raw || "Sign out request failed.");
        }
        window.location.href = "/auth";
      } catch (secondError) {
        // Last-resort: browser-level POST form submit to Better Auth route.
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/auth/sign-out";

        const callbackInput = document.createElement("input");
        callbackInput.type = "hidden";
        callbackInput.name = "callbackURL";
        callbackInput.value = "/auth";
        form.appendChild(callbackInput);

        document.body.appendChild(form);
        form.submit();

        setSignOutError(
          secondError instanceof Error
            ? secondError.message
            : firstError instanceof Error
              ? firstError.message
              : "Sign out failed."
        );
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-20">
        <Button
          variant="outline"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
        {signOutError && <p className="mt-2 text-right text-xs text-destructive">{signOutError}</p>}
      </div>
      <Index />
    </div>
  );
}

