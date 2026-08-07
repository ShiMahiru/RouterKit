export interface ThoughtMetadata {
  date: string;
  images?: string[];
  audio?: string;
}

export interface Thought {
  slug: string;
  metadata: ThoughtMetadata;
  content: string;
}