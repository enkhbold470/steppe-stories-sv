// src/lib/types.ts
export interface StoryRequest {
    genre: string;
    keywords: string;
    wordLength: number;
  }
  
  export interface GeneratedStory {
    id: string;
    title: string;
    content: string;
    stats: {
      tokens: number;
      cost: number;
      time: number;
    };
    timestamp: Date;
    prompt: string;
  }