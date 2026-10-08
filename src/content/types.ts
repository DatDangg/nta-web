export type Locale = 'vi' | 'en';

export interface Solution {
  slug: string;
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  category: 'enterprise' | 'ai';
  useCases?: string[];
}

export interface Product {
  slug: string;
  title: string;
  description: string;
  screenshots: string[];
  downloadUrl?: string | null;
  features?: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  category: 'enterprise' | 'ai' | 'app-ai';
  sector?: string;
  client?: string;
  year: number;
  challenge: string;
  solution: string;
  result: string;
  gallery: { src: string; alt: string }[];
  related: string[];
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  cover: string;
  body: string;
}

export interface MdxDocument {
  frontmatter: Omit<Post, 'body'>;
  source: string;
}

export interface AboutData {
  mission: string;
  capabilities: string[];
  team: { name: string; role: string; image: string }[];
  milestones: { year: number; description: string }[];
  partners: { name: string; logo: string | null }[];
}

// ContactSubmission is transient and belongs to the API layer; see Layer 3.
