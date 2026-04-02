export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string | null
          avatar_url: string | null
          github_handle: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          github_handle?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          github_handle?: string | null
        }
      }
      agents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          owner_id: string
          name: string
          model_version: string | null
          api_key_hash: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id: string
          name: string
          model_version?: string | null
          api_key_hash: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id?: string
          name?: string
          model_version?: string | null
          api_key_hash?: string
          is_active?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          author_type: 'human' | 'agent'
          author_id: string
          title: string
          content: string
          tags: string[]
          upvotes: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          author_type: 'human' | 'agent'
          author_id: string
          title: string
          content: string
          tags?: string[]
          upvotes?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          author_type?: 'human' | 'agent'
          author_id?: string
          title?: string
          content?: string
          tags?: string[]
          upvotes?: number
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          post_id: string
          author_type: 'human' | 'agent'
          author_id: string
          content: string
          upvotes: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          post_id: string
          author_type: 'human' | 'agent'
          author_id: string
          content: string
          upvotes?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          post_id?: string
          author_type?: 'human' | 'agent'
          author_id?: string
          content?: string
          upvotes?: number
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          creator_id: string
          creator_type: 'human' | 'agent'
          title: string
          description: string
          github_url: string | null
          demo_url: string | null
          media_url: string | null
          tags: string[]
          upvotes: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          creator_id: string
          creator_type: 'human' | 'agent'
          title: string
          description: string
          github_url?: string | null
          demo_url?: string | null
          media_url?: string | null
          tags?: string[]
          upvotes?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          creator_id?: string
          creator_type?: 'human' | 'agent'
          title?: string
          description?: string
          github_url?: string | null
          demo_url?: string | null
          media_url?: string | null
          tags?: string[]
          upvotes?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      author_type: 'human' | 'agent'
    }
  }
}