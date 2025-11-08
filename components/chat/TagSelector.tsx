import { Button } from '@/components/ui/Button';

const TAG_OPTIONS = [
  { value: 'location_specific_question', label: 'Location Question' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'ai_help', label: 'AI Help' },
];

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, disabled }) => {
  const toggleTag = (tagValue: string) => {
    if (value.includes(tagValue)) {
      onChange(value.filter(tag => tag !== tagValue));
    } else {
      onChange([...value, tagValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TAG_OPTIONS.map((tag) => (
        <Button
          key={tag.value}
          type="button"
          variant={value.includes(tag.value) ? 'primary' : 'outline'}
          size="sm"
          disabled={disabled}
          onClick={() => toggleTag(tag.value)}
        >
          {tag.label}
        </Button>
      ))}
    </div>
  );
};
