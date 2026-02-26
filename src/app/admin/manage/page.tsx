"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Photo {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  tags: string[];
  date: string | null;
  people: string[];
  location: string | null;
  createdAt: string;
}

export default function ManagePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPeople, setEditPeople] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPhotos = async () => {
    const res = await fetch("/api/photos");
    const data = await res.json();
    setPhotos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const startEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setEditTitle(photo.title);
    setEditDescription(photo.description || "");
    setEditTags(photo.tags.join(", "));
    setEditDate(photo.date || "");
    setEditPeople(photo.people.join(", "));
    setEditLocation(photo.location || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);

    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const people = editPeople
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await fetch(`/api/photos/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription || null,
        tags,
        date: editDate || null,
        people,
        location: editLocation || null,
      }),
    });

    setEditingId(null);
    setSaving(false);
    fetchPhotos();
  };

  const deletePhoto = async (id: string) => {
    if (!confirm("确定要删除这张照片吗？")) return;

    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    fetchPhotos();
  };

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">管理照片</h1>

      {photos.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">暂无照片可管理。</p>
      ) : (
        <div className="space-y-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={`/images/${photo.filename}`}
                  alt={photo.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              {editingId === photo.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="标题"
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="描述"
                  />
                  <input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="标签（逗号分隔）"
                  />
                  <input
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="日期（如 1946, 1946-01, 1946-01-01）"
                  />
                  <input
                    value={editPeople}
                    onChange={(e) => setEditPeople(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="人物（逗号分隔）"
                  />
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="地点"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{photo.description}</p>
                    )}
                    {photo.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {photo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {(photo.date || photo.location || photo.people.length > 0) && (
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        {[
                          photo.date,
                          photo.location,
                          photo.people.length > 0 ? photo.people.join(", ") : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(photo)}
                      className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
