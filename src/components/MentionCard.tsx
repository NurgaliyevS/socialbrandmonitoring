
import React from 'react';
import { MessageSquare, ArrowUp, ArrowDown, ExternalLink, Clock, Circle, Check, MailCheck, MailQuestion, Globe } from 'lucide-react';
import { mentionsService } from '@/lib/mentions-service';

interface MentionCardProps {
  mention: {
    id: string;
    subreddit?: string;
    author: string;
    title: string;
    content: string;
    url: string;
    score: number;
    comments: number;
    timestamp: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    brandName?: string;
    permalink?: string;
    itemType: 'post' | 'comment' | 'story'; // Use itemType instead of redditType
    platform: 'reddit' | 'hackernews'; // Add platform for source distinction
    unread: boolean;
  };
  onMentionRead?: (mentionId: string) => void;
  onMentionUnread?: (mentionId: string) => void;
}

const MentionCard = ({ mention, onMentionRead, onMentionUnread }: MentionCardProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ArrowUp className="w-3 h-3" />;
      case 'negative':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  const handleCardClick = async () => {
    window.open(mention.url, '_blank');
  };

  const handleMarkAsUnread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await mentionsService.markAsUnread([mention.id]);
      onMentionUnread?.(mention.id);
    } catch (error) {
      console.error('Error marking mention as unread:', error);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await mentionsService.markAsRead([mention.id]);
      onMentionRead?.(mention.id);
    } catch (error) {
      console.error('Error marking mention as read:', error);
    }
  };

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full cursor-pointer ${mention.unread ? 'border-l-4 border-l-blue-500' : ''}`}
      onClick={handleCardClick}
    >
      {/* Platform label/icon */}
      <div className="flex items-center mb-2">
        {mention.platform === 'reddit' ? (
          <span className="flex items-center text-orange-500 font-semibold text-xs mr-2"><Globe size={16} className="mr-1" />Reddit</span>
        ) : (
          <span className="flex items-center text-yellow-600 font-semibold text-xs mr-2"><Globe size={16} className="mr-1" />Hacker News</span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0 w-full">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">r/</span>
          </div>
          <span className="font-medium text-gray-900">r/{mention.subreddit}</span>
          <span className="text-gray-500 hidden md:inline">•</span>
          <span className="text-gray-500 text-sm block md:inline mt-1 md:mt-0">u/{mention.author}</span>
          {mention.unread && (
            <>
              <div className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                <span className="text-blue-600 text-sm font-medium">New</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(mention.sentiment)}`}>
            <div className="flex items-center gap-1">
              {getSentimentIcon(mention.sentiment)}
              <span className="capitalize">{mention.sentiment}</span>
            </div>
          </div>
          {!mention.unread && (
            <button 
              className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              onClick={handleMarkAsUnread}
              title="Mark as unread"
            >
              <MailQuestion className="w-4 h-4" />
              <span className="text-blue-600 text-sm font-medium text-nowrap">Mark as Unread</span>
            </button>
          )}
          {mention.unread && (
            <button 
              className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              <MailCheck className="w-4 h-4" />
              <span className="text-blue-600 text-sm font-medium text-nowrap">Mark as Read</span>
            </button>
          )}
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              window.open(mention.url, '_blank');
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3
        className={`text-gray-700 text-sm mb-3 line-clamp-3 w-full md:line-clamp-none ${mention.unread ? 'font-medium' : ''}`}
        dangerouslySetInnerHTML={{ __html: mention.title }}
      />
      <div 
        className={`text-gray-700 text-sm mb-3 line-clamp-3 w-full md:line-clamp-none ${mention.unread ? 'font-medium' : ''}`}
        dangerouslySetInnerHTML={{ __html: mention.content }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 gap-2 w-full">
        <div className="flex flex-wrap items-center gap-4 min-w-0 w-full">
          <div className="flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            <span>{mention.score}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{mention.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{mention.timestamp}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {mention.keywords.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs max-w-full">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentionCard;
