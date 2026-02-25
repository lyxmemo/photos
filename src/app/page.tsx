import { getPhotos, getAllTags } from "@/lib/data";
import Gallery from "@/components/Gallery";

export default function Home() {
  const photos = getPhotos();
  const tags = getAllTags();

  return <Gallery photos={photos} tags={tags} />;
}
