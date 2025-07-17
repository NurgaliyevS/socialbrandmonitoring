import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { Brand, Keyword, NotificationSettings } from './types';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { settingsService } from '@/lib/settings-service';

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
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [localEmail, setLocalEmail] = React.useState('');
  const [localSlack, setLocalSlack] = React.useState('');
  const [localEmailEnabled, setLocalEmailEnabled] = React.useState(false);
  const [localSlackEnabled, setLocalSlackEnabled] = React.useState(false);

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setLocalEmail(brand.notifications.emailAddress || '');
    setLocalSlack(brand.notifications.slackWebhook || '');
    setLocalEmailEnabled(brand.notifications.email);
    setLocalSlackEnabled(brand.notifications.slack);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLocalEmail('');
    setLocalSlack('');
    setLocalEmailEnabled(false);
    setLocalSlackEnabled(false);
  };

  const saveEdit = async (brand: Brand) => {
    try {
      const updated = await settingsService.updateNotifications(brand.id, {
        email: localEmailEnabled,
        slack: localSlackEnabled,
        emailAddress: localEmail,
        slackWebhook: localSlack,
      });
      setBrands(brands.map(b => b.id === brand.id ? updated : b));
      toast.success('Notification settings saved.');
      cancelEdit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notifications');
    }
  };

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
          editingId === brand.id ? (
            <form key={brand.id} onSubmit={e => { e.preventDefault(); saveEdit(brand); }} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{brand.name}</h3>
                <div className="flex gap-2">
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
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
                    checked={localEmailEnabled}
                    onCheckedChange={setLocalEmailEnabled}
                  />
                </div>
                <div className="ml-8">
                  <Label htmlFor={`email-address-${brand.id}`}>Email Address</Label>
                  <Input
                    id={`email-address-${brand.id}`}
                    value={localEmail}
                    onChange={e => setLocalEmail(e.target.value)}
                    placeholder="sherlock.holmes@bakerstreet.com"
                    className="mt-1"
                    type="email"
                    required
                  />
                </div>
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
                    checked={localSlackEnabled}
                    onCheckedChange={setLocalSlackEnabled}
                  />
                </div>
                <div className="ml-8">
                  <Label htmlFor={`slack-webhook-${brand.id}`}>Slack Webhook URL</Label>
                  <Input
                    id={`slack-webhook-${brand.id}`}
                    value={localSlack}
                    onChange={e => setLocalSlack(e.target.value)}
                    placeholder="https://hooks.slack.com/services/T221B/H0LM3S/pipe-smoking-detective-x42"
                    className="mt-1"
                    type="url"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div key={brand.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{brand.name}</h3>
                <Button size="sm" type="submit" onClick={() => startEdit(brand)}>
                  Edit
                </Button>
              </div>
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
                    disabled
                  />
                </div>
                <div className="ml-8">
                  <Label htmlFor={`email-address-${brand.id}`}>Email Address</Label>
                  <Input
                    id={`email-address-${brand.id}`}
                    value={brand.notifications.emailAddress || ''}
                    readOnly
                    placeholder='Email address is not set'
                    className="mt-1"
                    type="text"
                  />
                </div>
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
                    disabled
                  />
                </div>
                <div className="ml-8">
                  <Label htmlFor={`slack-webhook-${brand.id}`}>Slack Webhook URL</Label>
                  <Input
                    id={`slack-webhook-${brand.id}`}
                    value={brand.notifications.slackWebhook || ''}
                    readOnly
                    placeholder='Slack webhook is not set'
                    className="mt-1"
                    type="text"
                  />
                </div>
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsComponent; 