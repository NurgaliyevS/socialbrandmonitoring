import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Play, Send } from 'lucide-react';
import { Brand, NotificationSettings } from './types';
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
  const [localTelegramChatId, setLocalTelegramChatId] = React.useState('');
  const [localEmailEnabled, setLocalEmailEnabled] = React.useState(false);
  const [localSlackEnabled, setLocalSlackEnabled] = React.useState(false);
  const [localTelegramEnabled, setLocalTelegramEnabled] = React.useState(false);

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setLocalEmail(brand.notifications.emailAddress || '');
    setLocalSlack(brand.notifications.slackWebhook || '');
    setLocalTelegramChatId(brand.notifications.telegramChatId || '');
    setLocalEmailEnabled(brand.notifications.email);
    setLocalSlackEnabled(brand.notifications.slack);
    setLocalTelegramEnabled(brand.notifications.telegram);  
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
        telegram: localTelegramEnabled,
        emailAddress: localEmail,
        slackWebhook: localSlack,
        telegramChatId: localTelegramChatId,
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
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>💡 <strong>How to set up:</strong></p>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>Go to your Slack workspace settings</li>
                      <li>Create a new webhook for your desired channel</li>
                      <li>Copy the webhook URL and paste it above</li>
                      <li>Notifications will be sent to that specific channel</li>
                    </ol>
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <a 
                        href="https://youtu.be/IU-IDUasNvA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Play className="h-4 w-4" />
                        Watch Video Tutorial: Slack Integration Setup
                      </a>
                    </div>
                  </div>
                </div>

                {/* Telegram Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor={`slack-${brand.id}`} className="font-medium">
                        Telegram Notifications
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive alerts in Telegram
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`telegram-${brand.id}`}
                    checked={localTelegramEnabled}
                    onCheckedChange={setLocalTelegramEnabled}
                  />
                </div>
                <div className="ml-8">
                  <Label htmlFor={`telegram-chatid-${brand.id}`}>Telegram Chat/Channel ID</Label>
                  <Input
                    id={`telegram-chatid-${brand.id}`}
                    value={localTelegramChatId}
                    onChange={e => setLocalTelegramChatId(e.target.value)}
                    placeholder="8452186985:AAEj3i9P-UoOvY7iQfNeunqDVS1SZanmUyk"
                    className="mt-1"
                    type="text"
                  />
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>💡 <strong>How to set up:</strong></p>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>Go to your Telegram bot settings</li>
                      <li>Create a new bot and get the token</li>
                      <li>Copy the token and paste it above</li>
                      <li>Notifications will be sent to that specific channel</li>
                    </ol>
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <a 
                        href="https://youtu.be/IU-IDUasNvA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Play className="h-4 w-4" />
                        Watch Video Tutorial: Telegram Integration Setup
                      </a>
                    </div>
                  </div>
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
                {/* Telegram Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor={`slack-${brand.id}`} className="font-medium">
                        Telegram Notifications
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive alerts in Telegram
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`telegram-${brand.id}`}
                    checked={brand.notifications.telegram}
                    disabled
                  />
                </div>
                <div className="ml-8">
                  <Label htmlFor={`telegram-chatid-${brand.id}`}>Telegram Chat/Channel ID</Label>
                  <Input
                    id={`telegram-chatid-${brand.id}`}
                    value={brand.notifications.telegramChatId || ''}
                    readOnly
                    placeholder='Telegram chat/channel id is not set'
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