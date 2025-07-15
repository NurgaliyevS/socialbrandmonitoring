"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function VerificationStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Verification email sent! Please check your inbox.");
        setSuccess(true);
      } else {
        setError(data.error || "Failed to resend verification email.");
      }
    } catch (err) {
      setError("Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Mail className="h-8 w-8 text-blue-500" />
            <p className="text-center text-lg font-medium">Check your inbox</p>
            <p className="text-center text-muted-foreground text-sm">
              We sent a verification link to your email address. Please verify your email to activate your account.<br />
              Didn&apos;t receive the email? Enter your email below to resend the verification link.
            </p>
          </div>
          <form onSubmit={handleResend} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </form>
          {message && (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-green-700 text-sm text-center">{message}</p>
            </div>
          )}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 