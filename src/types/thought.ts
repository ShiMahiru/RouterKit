export interface ThoughtMetadata {
  date: string;
  images?: string[];
}

export interface Thought {
  slug: string;
  metadata: ThoughtMetadata;
  content: string;
}