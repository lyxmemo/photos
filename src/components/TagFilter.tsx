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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectTag("")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          selectedTag === ""
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => onSelectTag(tag.name)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            selectedTag === tag.name
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {tag.name}
          <span className="ml-1 text-xs opacity-70">({tag.count})</span>
        </button>
      ))}
    </div>
  );
}
