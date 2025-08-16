
export interface StorySegment {
  id: number;
  text: string;
  imageUrl: string;
}

export interface StoryResponse {
  story: string;
  choices: string[];
}
