
import React from 'react';
import { MessageSquare, ArrowUp, ArrowDown, ExternalLink, Clock } from 'lucide-react';

interface MentionCardProps {
  mention: {
    id: string;
    subreddit: string;
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
    redditType?: 'post' | 'comment';
  };
}

const MentionCard = ({ mention }: MentionCardProps) => {
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

  console.log(mention.permalink, 'mention permalink')
  console.log(mention.url, 'mention url')

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">r/</span>
          </div>
          <span className="font-medium text-gray-900">r/{mention.subreddit}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500 text-sm">u/{mention.author}</span>
          {mention.brandName && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-blue-600 text-sm font-medium">{mention.brandName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(mention.sentiment)}`}>
            <div className="flex items-center gap-1">
              {getSentimentIcon(mention.sentiment)}
              <span className="capitalize">{mention.sentiment}</span>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => window.open(mention.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{mention.title}</h3>
      <p className="text-gray-700 text-sm mb-3 line-clamp-3">{mention.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
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
        
        <div className="flex gap-1">
          {mention.keywords.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentionCard;
