"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }
    const verify = async () => {
      setStatus("loading");
      setMessage("");
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setMessage("Your email has been verified! Redirecting to sign in...");
          setTimeout(() => {
            // Redirect to signin with success message and pre-filled email
            const email = data.email || "";
            router.push(`/auth/signin?verified=true&email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-center">Verifying your email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-center text-green-700 font-medium">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="h-8 w-8 text-red-600" />
              <p className="text-center text-red-700 font-medium">{message}</p>
              <Button className="mt-2" onClick={() => router.push("/auth/signin")}>Back to Sign In</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 