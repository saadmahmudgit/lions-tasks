import { useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import Index from "@/pages/Index";
import { Button } from "@/components/ui/button";

function clearBrowserSession() {
  // Expire all cookies for current host as a hard fallback.
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const eq = cookie.indexOf("=");
    const name = (eq > -1 ? cookie.slice(0, eq) : cookie).trim();
    if (!name) continue;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
  }

  // Remove local/session storage entries that may cache auth state.
  const lsKeys = Object.keys(localStorage);
  for (const key of lsKeys) {
    if (key.toLowerCase().includes("auth") || key.toLowerCase().includes("session")) {
      localStorage.removeItem(key);
    }
  }

  const ssKeys = Object.keys(sessionStorage);
  for (const key of ssKeys) {
    if (key.toLowerCase().includes("auth") || key.toLowerCase().includes("session")) {
      sessionStorage.removeItem(key);
    }
  }
}

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
        // Last-resort: force local browser logout even if API route is unavailable.
        clearBrowserSession();
        window.location.href = "/auth";

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

