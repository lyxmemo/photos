import { getPhotos, getAllTags } from "@/lib/data";
import GalleryShell from "@/components/GalleryShell";

export default function Home() {
  const photos = getPhotos();
  const tags = getAllTags();

  return <GalleryShell photos={photos} tags={tags} />;
}
