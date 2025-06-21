import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Mail, Check } from "lucide-react";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  source?: string;
}

interface EmailData {
  email: string;
  source: string;
  timestamp: string;
  id: string;
}

const EmailCaptureModal = ({ 
  isOpen, 
  onClose, 
  title = "Get Early Access", 
  description = "Join our beta waitlist and be the first to know when we launch.",
  source = "modal"
}: EmailCaptureModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const emailData: EmailData = {
        email: email.trim(),
        source,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };

      // Show success state
      setIsSuccess(true);
      setEmail("");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      setError("Failed to save email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
              <p className="text-gray-600">
                {description}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-semibold transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Join Waitlist"}
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              No spam, ever. Unsubscribe at any time.
            </p>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              You're on the list!
            </h3>
            <p className="text-gray-600">
              Thanks for joining our beta waitlist. We'll notify you as soon as we launch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailCaptureModal; 