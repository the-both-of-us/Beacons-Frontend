interface ThreadListItem {
  id: string;
  question: string;
  createdAt: string;
  hasAiResponse?: boolean;
}

interface ThreadListProps {
  items: ThreadListItem[];
  onSelect: (threadId: string) => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({ items, onSelect }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
        <p className="text-sm font-medium text-gray-600">No threads yet</p>
        <p className="text-xs text-gray-500">Tag a message with “Location Question” to start one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-gray-900">{item.question}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {item.hasAiResponse && <span className="text-blue-600">AI answer ready</span>}
          </div>
        </button>
      ))}
    </div>
  );
};
