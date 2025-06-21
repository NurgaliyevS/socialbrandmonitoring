import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Mail, Users } from "lucide-react";

interface EmailData {
  email: string;
  source: string;
  timestamp: string;
  id: string;
}

const EmailManager = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'hero': return 'bg-orange-100 text-orange-800';
      case 'pricing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg"
          title="Email Manager"
        >
          <Mail className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-white rounded-lg shadow-2xl border">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Email Manager</h3>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {emails.length}
            </span>
          </div>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No emails captured yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div key={email.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{email.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(email.source)}`}>
                        {email.source}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(email.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManager; 