"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import MentionCard from '@/components/MentionCard';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Reddit mentions
  const mentions = [
    {
      id: '1',
      subreddit: 'webdev',
      author: 'techexpert123',
      title: 'Just discovered this amazing social monitoring tool',
      content: 'I\'ve been using this new Reddit monitoring platform and it\'s incredible for tracking brand mentions. The sentiment analysis is spot on and the interface is super clean.',
      url: 'https://reddit.com/r/webdev/comments/example1',
      score: 147,
      comments: 23,
      timestamp: '2 hours ago',
      sentiment: 'positive' as const,
      keywords: ['monitoring', 'brand']
    },
    {
      id: '2',
      subreddit: 'marketing',
      author: 'brandmanager99',
      title: 'Reddit brand monitoring tools comparison',
      content: 'Has anyone tried the new Reddit monitoring tools? I need something better than manual searching. Looking for real-time alerts and sentiment tracking.',
      url: 'https://reddit.com/r/marketing/comments/example2',
      score: 89,
      comments: 15,
      timestamp: '4 hours ago',
      sentiment: 'neutral' as const,
      keywords: ['reddit', 'tools']
    },
    {
      id: '3',
      subreddit: 'entrepreneur',
      author: 'startupfounder',
      title: 'Negative feedback about our product on Reddit',
      content: 'Just saw some harsh criticism of our platform on r/technology. The user complained about bugs and poor customer service. We need to address this quickly.',
      url: 'https://reddit.com/r/entrepreneur/comments/example3',
      score: 34,
      comments: 8,
      timestamp: '6 hours ago',
      sentiment: 'negative' as const,
      keywords: ['feedback', 'criticism']
    },
    {
      id: '4',
      subreddit: 'SaaS',
      author: 'saasbuilder',
      title: 'Best Reddit monitoring solutions for B2B',
      content: 'After testing multiple Reddit monitoring platforms, I found one that really stands out. Great for tracking competitor mentions and industry discussions.',
      url: 'https://reddit.com/r/SaaS/comments/example4',
      score: 256,
      comments: 41,
      timestamp: '8 hours ago',
      sentiment: 'positive' as const,
      keywords: ['b2b', 'competitor']
    }
  ];

  const filteredMentions = mentions.filter(mention =>
    mention.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mention.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mention.subreddit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFilter = () => {
    console.log('Add filter clicked');
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar (left) */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* MentionCard list (center, 2/3 width) */}
      <div className="w-2/3 p-6">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddFilter={handleAddFilter}
          onExport={handleExport}
        />
        <div className="space-y-4 mt-6">
          {filteredMentions.map((mention) => (
            <MentionCard key={mention.id} mention={mention} />
          ))}
          {filteredMentions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No mentions found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter panel (right, 1/3 width) */}
      <div className="w-1/3 border-l border-gray-200 bg-gray-50 p-8">
        {/* Placeholder for filter panel */}
        <div className="text-lg font-semibold mb-4">Filters</div>
        <div className="text-gray-500">(Filter options go here)</div>
      </div>
    </div>
  );
};

export default Dashboard;
