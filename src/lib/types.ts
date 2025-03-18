// src/lib/types.ts
export interface StoryRequest {
    genre: string;
    keywords: string;
    wordLength: number;
  }
  

  export interface Story {
    story_id: string;
    user_id: string;
    title: string;
    content: string;
    word_count: number;
    tokens_used: number;
    created_at: string;
    cost: number;
    prompt: string;
    stats: {
      cost: number;
      wordCount: number;
      tokensUsed: number;
      generationTime: number;
      tokensPerSecond: number;
    };
  }
  export interface ApiCallStats {
    callNumber: number;
    wordCount: number;
    tokensUsed: number;
    duration: number;
    cost: number;
  }