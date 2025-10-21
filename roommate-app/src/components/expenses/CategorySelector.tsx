import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  { value: 'GROCERIES', label: '🛒 Groceries' },
  { value: 'UTILITIES', label: '⚡ Utilities' },
  { value: 'RENT', label: '🏠 Rent' },
  { value: 'ENTERTAINMENT', label: '🎬 Entertainment' },
  { value: 'TRANSPORTATION', label: '🚗 Transportation' },
  { value: 'HEALTHCARE', label: '🏥 Healthcare' },
  { value: 'OTHER', label: '📦 Other' },
];

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CategorySelector({ value, onValueChange }: CategorySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}