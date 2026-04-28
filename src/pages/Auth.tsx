import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isPending && session) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message || "Could not create your account.");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message || "Invalid email or password.");
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Sign in to access your tasks and dashboard."
                : "Create your account and start using Tickly Tasks."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button className="w-full" type="submit" disabled={loading || isPending}>
                {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-foreground underline underline-offset-4"
                onClick={() => {
                  setError(null);
                  setMode(mode === "signin" ? "signup" : "signin");
                }}
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              <Link to="/" className="underline underline-offset-4">
                Return to app
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

