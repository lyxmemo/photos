"use client";

interface Tag {
  name: string;
  count: number;
}

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

export default function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        onClick={() => onSelectTag("")}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
          selectedTag === ""
            ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        }`}
      >
        全部
      </button>
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => onSelectTag(tag.name)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
            selectedTag === tag.name
              ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          {tag.name}
          <span className="ml-1 opacity-50">{tag.count}</span>
        </button>
      ))}
    </div>
  );
}
