'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { 
  TrendingUp, 
  MessageSquare, 
  Users, 
  AlertCircle,
  BarChart3,
  Settings,
  Search,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reddit Social Listening</h1>
                  <p className="text-gray-600">Track what your customers say on Reddit</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keywords
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Mentions</p>
                      <p className="text-2xl font-bold text-gray-900">847</p>
                      <p className="text-xs text-green-600">↑ 12% from last week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Positive Sentiment</p>
                      <p className="text-2xl font-bold text-gray-900">68%</p>
                      <p className="text-xs text-green-600">↑ 5% from last week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Subreddits</p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                      <p className="text-xs text-blue-600">3 new this week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Alerts</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                      <p className="text-xs text-orange-600">2 need attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Mentions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Mentions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        subreddit: 'r/webdev',
                        title: 'Looking for no-code solutions like mvpagency',
                        sentiment: 'positive',
                        score: 15,
                        comments: 8,
                        time: '2 hours ago'
                      },
                      {
                        id: 2,
                        subreddit: 'r/entrepreneur',
                        title: 'Has anyone tried mvpagency for building MVPs?',
                        sentiment: 'neutral',
                        score: 7,
                        comments: 12,
                        time: '4 hours ago'
                      },
                      {
                        id: 3,
                        subreddit: 'r/startups',
                        title: 'Webflow vs Bubble vs mvpagency - comparison',
                        sentiment: 'positive',
                        score: 23,
                        comments: 19,
                        time: '6 hours ago'
                      },
                    ].map((mention) => (
                      <div key={mention.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{mention.subreddit}</Badge>
                              <Badge 
                                variant={mention.sentiment === 'positive' ? 'default' : 'secondary'}
                                className={mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {mention.sentiment}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{mention.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>↑ {mention.score}</span>
                              <span>{mention.comments} comments</span>
                              <span>{mention.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Search className="h-4 w-4 mr-2" />
                    View All Mentions
                  </Button>
                </CardContent>
              </Card>

              {/* Keywords & Sentiment */}
              <div className="space-y-6">
                {/* Tracked Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Tracked Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'mvpagency', type: 'Own Brand', mentions: 45, color: 'bg-green-500' },
                        { name: 'webflow', type: 'Competitor', mentions: 123, color: 'bg-blue-500' },
                        { name: 'bubble', type: 'Competitor', mentions: 89, color: 'bg-emerald-500' },
                        { name: 'adalo', type: 'Competitor', mentions: 67, color: 'bg-yellow-500' },
                      ].map((keyword) => (
                        <div key={keyword.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${keyword.color}`} />
                            <div>
                              <p className="font-medium text-gray-900">{keyword.name}</p>
                              <p className="text-xs text-gray-500">{keyword.type}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{keyword.mentions}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Positive</span>
                        <span className="text-sm font-bold">68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-[68%]"></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Neutral</span>
                        <span className="text-sm font-bold">24%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-500 h-2 rounded-full w-[24%]"></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">Negative</span>
                        <span className="text-sm font-bold">8%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full w-[8%]"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
