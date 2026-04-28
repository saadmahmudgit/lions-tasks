import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import Index from "@/pages/Index";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && !session) {
    return <Navigate to="/auth" replace />;
  }

  return <Index />;
}

