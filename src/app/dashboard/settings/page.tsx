"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';
import BrandManagement from '@/components/settings/BrandManagement';
import KeywordManagement from '@/components/settings/KeywordManagement';
import NotificationSettingsComponent from '@/components/settings/NotificationSettings';
import { Brand, Keyword, NotificationSettings } from '@/components/settings/types';
import { settingsService } from '@/lib/settings-service';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState('settings');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', website: '' });

  // Load brands from backend on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedBrands = await settingsService.getBrands();
      setBrands(fetchedBrands);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrand = async () => {
    if (editingBrand) {
      try {
        const updatedBrand = await settingsService.updateBrand(editingBrand);
        setBrands(brands.map(brand => 
          brand.id === editingBrand.id ? updatedBrand : brand
        ));
        setEditingBrand(null);
        toast({ title: 'Brand updated', description: 'Brand details updated successfully.' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update brand');
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update brand' });
        console.error('Error updating brand:', err);
      }
    }
  };

  const handleAddBrand = async () => {
    if (newBrand.name && newBrand.website) {
      try {
        const brand = await settingsService.createBrand(newBrand.name, newBrand.website);
        setBrands([...brands, brand]);
        setNewBrand({ name: '', website: '' });
        setIsAddingBrand(false);
        toast({ title: 'Brand created', description: 'Brand added successfully.' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create brand');
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create brand' });
        console.error('Error creating brand:', err);
      }
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      await settingsService.deleteBrand(brandId);
      setBrands(brands.filter(brand => brand.id !== brandId));
      toast({ title: 'Brand deleted', description: 'Brand deleted successfully.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand');
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete brand' });
      console.error('Error deleting brand:', err);
    }
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

  const handleUpdateKeyword = async (brandId: string, keywordId: string, updates: Partial<Keyword>) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      const updatedBrand = {
        ...brand,
        keywords: brand.keywords.map(k => 
          k.id === keywordId ? { ...k, ...updates } : k
        )
      };
      
      try {
        const savedBrand = await settingsService.updateKeywords(brandId, updatedBrand.keywords);
        setBrands(brands.map(b => b.id === brandId ? savedBrand : b));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update keyword');
        console.error('Error updating keyword:', err);
      }
    }
  };

  const handleUpdateNotifications = async (brandId: string, updates: Partial<NotificationSettings>) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      const updatedNotifications = { ...brand.notifications, ...updates };
      
      try {
        const savedBrand = await settingsService.updateNotifications(brandId, updatedNotifications);
        setBrands(brands.map(b => b.id === brandId ? savedBrand : b));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update notifications');
        console.error('Error updating notifications:', err);
      }
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading brands...</span>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 