"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';
import BrandManagement from '@/components/settings/BrandManagement';
import KeywordManagement from '@/components/settings/KeywordManagement';
import NotificationSettingsComponent from '@/components/settings/NotificationSettings';
import { Brand, Keyword, NotificationSettings } from '@/components/settings/types';

const Settings = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState('settings');
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: 'RedditLens',
      website: 'https://redditlens.com',
      keywords: [
        { id: '1', name: 'redditlens', type: 'Own Brand', color: 'bg-blue-500' },
        { id: '2', name: 'social monitoring', type: 'Industry', color: 'bg-green-500' },
        { id: '3', name: 'brand tracking', type: 'Industry', color: 'bg-purple-500' }
      ],
      notifications: {
        email: true,
        slack: false,
        emailAddress: 'admin@redditlens.com'
      }
    }
  ]);
  
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', website: '' });

  const handleSaveBrand = () => {
    if (editingBrand) {
      setBrands(brands.map(brand => 
        brand.id === editingBrand.id ? editingBrand : brand
      ));
      setEditingBrand(null);
    }
  };

  const handleAddBrand = () => {
    if (newBrand.name && newBrand.website) {
      const brand: Brand = {
        id: Date.now().toString(),
        name: newBrand.name,
        website: newBrand.website,
        keywords: [],
        notifications: {
          email: false,
          slack: false
        }
      };
      setBrands([...brands, brand]);
      setNewBrand({ name: '', website: '' });
      setIsAddingBrand(false);
    }
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrands(brands.filter(brand => brand.id !== brandId));
  };

  const handleAddKeyword = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      const newKeyword: Keyword = {
        id: Date.now().toString(),
        name: '',
        type: 'Own Brand',
        color: 'bg-blue-500'
      };
      const updatedBrand = {
        ...brand,
        keywords: [...brand.keywords, newKeyword]
      };
      setBrands(brands.map(b => b.id === brandId ? updatedBrand : b));
    }
  };

  const handleRemoveKeyword = (brandId: string, keywordId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      const updatedBrand = {
        ...brand,
        keywords: brand.keywords.filter(k => k.id !== keywordId)
      };
      setBrands(brands.map(b => b.id === brandId ? updatedBrand : b));
    }
  };

  const handleUpdateKeyword = (brandId: string, keywordId: string, updates: Partial<Keyword>) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      const updatedBrand = {
        ...brand,
        keywords: brand.keywords.map(k => 
          k.id === keywordId ? { ...k, ...updates } : k
        )
      };
      setBrands(brands.map(b => b.id === brandId ? updatedBrand : b));
    }
  };

  const handleUpdateNotifications = (brandId: string, updates: Partial<NotificationSettings>) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      const updatedBrand = {
        ...brand,
        notifications: { ...brand.notifications, ...updates }
      };
      setBrands(brands.map(b => b.id === brandId ? updatedBrand : b));
    }
  };

  const handleViewChange = (view: string) => {
    if (view === 'feed') {
      router.push('/dashboard');
    } else {
      setActiveView(view);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>

          <Tabs defaultValue="brands" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="brands">Brands</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="brands" className="space-y-6">
              <BrandManagement
                brands={brands}
                setBrands={setBrands}
                editingBrand={editingBrand}
                setEditingBrand={setEditingBrand}
                isAddingBrand={isAddingBrand}
                setIsAddingBrand={setIsAddingBrand}
                newBrand={newBrand}
                setNewBrand={setNewBrand}
                handleSaveBrand={handleSaveBrand}
                handleAddBrand={handleAddBrand}
                handleDeleteBrand={handleDeleteBrand}
              />
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <KeywordManagement
                brands={brands}
                setBrands={setBrands}
                handleAddKeyword={handleAddKeyword}
                handleRemoveKeyword={handleRemoveKeyword}
                handleUpdateKeyword={handleUpdateKeyword}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettingsComponent
                brands={brands}
                setBrands={setBrands}
                handleUpdateNotifications={handleUpdateNotifications}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings; 