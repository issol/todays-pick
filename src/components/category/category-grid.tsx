'use client';

import { useAppStore } from '@/stores/app-store';
import { CATEGORIES } from '@/lib/utils/constants';
import { CategoryChip } from './category-chip';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function CategoryGrid() {
  const { selectedCategories, toggleCategory, setCategories } = useAppStore();

  const allSelected = selectedCategories.length === CATEGORIES.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setCategories([CATEGORIES[0].id]);
    } else {
      setCategories(CATEGORIES.map((c) => c.id));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.length === 1 && selectedCategories.includes(categoryId)) {
      return;
    }
    toggleCategory(categoryId);
  };

  return (
    <div className="space-y-4">
      {/* Select All Button */}
      <div className="flex justify-between items-center">
        <Button
          variant={allSelected ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleAll}
          className="gap-2"
        >
          {allSelected && <Check className="w-4 h-4" />}
          전체 ({selectedCategories.length}/{CATEGORIES.length})
        </Button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.id}
            category={cat.label}
            iconName={cat.iconName}
            selected={selectedCategories.includes(cat.id)}
            onToggle={() => handleCategoryToggle(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
