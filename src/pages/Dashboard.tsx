import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import Index from "@/pages/Index";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, isPending, error } = authClient.useSession();

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

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-20">
        <Button
          variant="outline"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/auth";
          }}
        >
          Sign out
        </Button>
      </div>
      <Index />
    </div>
  );
}

