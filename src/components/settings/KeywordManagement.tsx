import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, MessageSquare, Save, X } from "lucide-react";
import { Brand, Keyword, NotificationSettings } from "./types";
import { settingsService } from '@/lib/settings-service';
import { toast } from '@/components/ui/use-toast';
import { useDashboard } from "@/contexts/DashboardContext";

interface KeywordManagementProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  handleAddKeyword: (brandId: string) => void;
  handleRemoveKeyword: (brandId: string, keywordId: string) => void;
  handleUpdateKeyword: (
    brandId: string,
    keywordId: string,
    updates: Partial<Keyword>
  ) => void;
}

const KeywordManagement = ({
  brands,
  setBrands,
  handleAddKeyword,
  handleRemoveKeyword,
  handleUpdateKeyword,
}: KeywordManagementProps) => {
  // Track which brand is adding a keyword and the new keyword value
  const [addingKeywordBrandId, setAddingKeywordBrandId] = useState<
    string | null
  >(null);
  const [newKeywordValue, setNewKeywordValue] = useState("");
  const [newKeywordType, setNewKeywordType] = useState<
    "Own Brand" | "Competitor" | "Industry"
  >("Own Brand");

  const { refreshBrands } = useDashboard();

  const handleShowAddKeyword = (brandId: string) => {
    setAddingKeywordBrandId(brandId);
    setNewKeywordValue("");
    setNewKeywordType("Own Brand");
  };

  const handleSaveNewKeyword = async (brandId: string) => {
    if (!newKeywordValue.trim()) return;
    const color = "bg-blue-500"; // You can randomize or pick based on type
    const newKeyword = {
      id: Date.now().toString(),
      name: newKeywordValue.trim(),
      type: newKeywordType,
      color,
      mentions: 'low',
    };
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    const updatedKeywords = [...brand.keywords, newKeyword];
    try {
      const savedBrand = await settingsService.updateKeywords(brandId, updatedKeywords);
      setBrands(brands.map(b => b.id === brandId ? savedBrand : b));
      refreshBrands();
      toast({ title: 'Keyword added', description: 'Keyword saved successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save keyword' });
      console.error('Error saving keyword:', err);
    }
    setAddingKeywordBrandId(null);
    setNewKeywordValue("");
    setNewKeywordType("Own Brand");
  };

  const handleCancelNewKeyword = () => {
    setAddingKeywordBrandId(null);
    setNewKeywordValue("");
    setNewKeywordType("Own Brand");
  };

  const handleRemoveKeywordWithNotification = async (brandId: string, keywordId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    const updatedKeywords = brand.keywords.filter(k => k.id !== keywordId);
    try {
      const savedBrand = await settingsService.updateKeywords(brandId, updatedKeywords);
      setBrands(brands.map(b => b.id === brandId ? savedBrand : b));
      refreshBrands();
      toast({ title: 'Keyword deleted', description: 'Keyword deleted successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete keyword' });
      console.error('Error deleting keyword:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Keywords by Brand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {brands.map((brand) => (
          <div key={brand.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{brand.name}</h3>
              <Button
                size="sm"
                onClick={() => handleShowAddKeyword(brand.id)}
                className="flex items-center gap-2"
                disabled={addingKeywordBrandId === brand.id}
              >
                <Plus className="h-4 w-4" />
                Add Keyword
              </Button>
            </div>

            <div className="space-y-2">
              {brand.keywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className={`w-3 h-3 rounded-full ${keyword.type === 'Own Brand' ? 'bg-blue-500' : keyword.type === 'Competitor' ? 'bg-red-500' : 'bg-green-500'}`} />
                  <Input
                    value={keyword.name}
                    onChange={(e) =>
                      handleUpdateKeyword(brand.id, keyword.id, {
                        name: e.target.value,
                      })
                    }
                    className="flex-1"
                    placeholder="Enter keyword"
                  />
                  <select
                    value={keyword.type}
                    onChange={(e) =>
                      handleUpdateKeyword(brand.id, keyword.id, {
                        type: e.target.value as any,
                      })
                    }
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="Own Brand">Own Brand</option>
                    <option value="Competitor">Competitor</option>
                    <option value="Industry">Industry</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveKeywordWithNotification(brand.id, keyword.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {/* New keyword input row */}
              {addingKeywordBrandId === brand.id && (
                <form
                  className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveNewKeyword(brand.id);
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <Input
                    value={newKeywordValue}
                    onChange={(e) => setNewKeywordValue(e.target.value)}
                    className="flex-1"
                    placeholder="Enter keyword"
                    autoFocus
                  />
                  <select
                    value={newKeywordType}
                    onChange={(e) => setNewKeywordType(e.target.value as any)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="Own Brand">Own Brand</option>
                    <option value="Competitor">Competitor</option>
                    <option value="Industry">Industry</option>
                  </select>
                  <Button type="submit" size="sm" className="btn">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCancelNewKeyword}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </form>
              )}
              {brand.keywords.length === 0 &&
                addingKeywordBrandId !== brand.id && (
                  <p className="text-gray-500 text-center py-4">
                    No keywords added yet. Click "Add Keyword" to get started.
                  </p>
                )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default KeywordManagement;
