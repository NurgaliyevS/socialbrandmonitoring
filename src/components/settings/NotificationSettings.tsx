import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { Brand, Keyword, NotificationSettings } from './types';

interface NotificationSettingsProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  handleUpdateNotifications: (brandId: string, updates: Partial<NotificationSettings>) => void;
}

const NotificationSettingsComponent = ({
  brands,
  setBrands,
  handleUpdateNotifications
}: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {brands.map((brand) => (
          <div key={brand.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">{brand.name}</h3>
            
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <Label htmlFor={`email-${brand.id}`} className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive alerts via email
                    </p>
                  </div>
                </div>
                <Switch
                  id={`email-${brand.id}`}
                  checked={brand.notifications.email}
                  onCheckedChange={(checked) => 
                    handleUpdateNotifications(brand.id, { email: checked })
                  }
                />
              </div>

              {brand.notifications.email && (
                <div className="ml-8">
                  <Label htmlFor={`email-address-${brand.id}`}>Email Address</Label>
                  <Input
                    id={`email-address-${brand.id}`}
                    value={brand.notifications.emailAddress || ''}
                    onChange={(e) => 
                      handleUpdateNotifications(brand.id, { emailAddress: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              )}

              {/* Slack Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <div>
                    <Label htmlFor={`slack-${brand.id}`} className="font-medium">
                      Slack Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive alerts in Slack
                    </p>
                  </div>
                </div>
                <Switch
                  id={`slack-${brand.id}`}
                  checked={brand.notifications.slack}
                  onCheckedChange={(checked) => 
                    handleUpdateNotifications(brand.id, { slack: checked })
                  }
                />
              </div>

              {brand.notifications.slack && (
                <div className="ml-8">
                  <Label htmlFor={`slack-webhook-${brand.id}`}>Slack Webhook URL</Label>
                  <Input
                    id={`slack-webhook-${brand.id}`}
                    value={brand.notifications.slackWebhook || ''}
                    onChange={(e) => 
                      handleUpdateNotifications(brand.id, { slackWebhook: e.target.value })
                    }
                    placeholder="https://hooks.slack.com/services/..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsComponent; 