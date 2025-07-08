export interface Brand {
  id: string;
  name: string;
  website: string;
  keywords: Keyword[];
  notifications: NotificationSettings;
}

export interface Keyword {
  id: string;
  name: string;
  type: 'Own Brand' | 'Competitor' | 'Industry';
  color: string;
}

export interface NotificationSettings {
  email: boolean;
  slack: boolean;
  slackWebhook?: string;
  emailAddress?: string;
} 