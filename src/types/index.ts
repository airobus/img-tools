export interface GenerationResult {
  id: string
  prompt: string
  negativePrompt: string
  imageUrl: string
  createdAt: number
  status: 'generating' | 'completed' | 'failed'
  progress: number
} 