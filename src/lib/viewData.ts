// Location coordinates (approximate lat/lng for equirectangular projection)
// These cover Republic of China era locations
export const LOCATION_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  "缅甸": { lat: 21.5, lng: 96.5, label: "缅甸" },
  "昆明": { lat: 25.0, lng: 102.7, label: "昆明" },
  "全州": { lat: 25.9, lng: 111.0, label: "全州" },
  "芷江": { lat: 27.4, lng: 109.7, label: "芷江" },
  "巴黎": { lat: 48.9, lng: 2.3, label: "巴黎" },
  "Fushun": { lat: 41.9, lng: 123.9, label: "抚顺" },
  "Shenyang": { lat: 41.8, lng: 123.4, label: "沈阳" },
};

export interface NetworkNode {
  id: string;
  name: string;
  photoCount: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  photos: { id: string; title: string; filename: string }[];
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

interface PhotoLike {
  id: string;
  title: string;
  filename: string;
  people: string[];
}

export function buildNetworkData(photos: PhotoLike[]): NetworkData {
  const peopleCounts = new Map<string, number>();
  const edgeMap = new Map<string, { id: string; title: string; filename: string }[]>();

  for (const photo of photos) {
    const people = photo.people;
    for (const person of people) {
      peopleCounts.set(person, (peopleCounts.get(person) || 0) + 1);
    }
    // Create edges between all pairs
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const key = [people[i], people[j]].sort().join("|||");
        const existing = edgeMap.get(key) || [];
        existing.push({ id: photo.id, title: photo.title, filename: photo.filename });
        edgeMap.set(key, existing);
      }
    }
  }

  const nodes: NetworkNode[] = Array.from(peopleCounts.entries()).map(([name, photoCount]) => ({
    id: name,
    name,
    photoCount,
  }));

  const edges: NetworkEdge[] = Array.from(edgeMap.entries()).map(([key, photos]) => {
    const [source, target] = key.split("|||");
    return { source, target, photos };
  });

  return { nodes, edges };
}
