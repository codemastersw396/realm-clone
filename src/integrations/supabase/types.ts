export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievement_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category_id: string | null
          color: string | null
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_secret: boolean
          name: string
          rarity: Database["public"]["Enums"]["rarity_tier"]
          rewards: Json
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_secret?: boolean
          name: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          rewards?: Json
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category_id?: string | null
          color?: string | null
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_secret?: boolean
          name?: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          rewards?: Json
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "achievement_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          config: Json | null
          id: string
          key: string
          model: string
          name: string
          prompt: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          config?: Json | null
          id?: string
          key: string
          model?: string
          name: string
          prompt: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          config?: Json | null
          id?: string
          key?: string
          model?: string
          name?: string
          prompt?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ams_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          mime_type: string | null
          ticket_id: string
          uploader_id: string
          url: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number
          id?: string
          mime_type?: string | null
          ticket_id: string
          uploader_id: string
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          ticket_id?: string
          uploader_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ams_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ams_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ams_chat_messages: {
        Row: {
          author_id: string | null
          body: string
          bookmarked: boolean
          channel: Database["public"]["Enums"]["ams_chat_channel"]
          created_at: string
          id: string
          metadata: Json
          pinned: boolean
          role: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          bookmarked?: boolean
          channel?: Database["public"]["Enums"]["ams_chat_channel"]
          created_at?: string
          id?: string
          metadata?: Json
          pinned?: boolean
          role?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          bookmarked?: boolean
          channel?: Database["public"]["Enums"]["ams_chat_channel"]
          created_at?: string
          id?: string
          metadata?: Json
          pinned?: boolean
          role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ams_chat_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ams_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ams_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ams_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ams_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ams_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_value: string | null
          id: string
          kind: Database["public"]["Enums"]["ams_event_kind"]
          payload: Json
          ticket_id: string
          to_value: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_value?: string | null
          id?: string
          kind: Database["public"]["Enums"]["ams_event_kind"]
          payload?: Json
          ticket_id: string
          to_value?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_value?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["ams_event_kind"]
          payload?: Json
          ticket_id?: string
          to_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ams_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ams_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ams_tickets: {
        Row: {
          assignee_id: string | null
          category: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          deleted_at: string | null
          department: string | null
          description: string | null
          expected_resolution_at: string | null
          id: string
          metadata: Json
          priority: Database["public"]["Enums"]["ams_priority"]
          product: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ams_status"]
          subject: string
          tags: string[]
          team: string | null
          ticket_no: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          expected_resolution_at?: string | null
          id?: string
          metadata?: Json
          priority?: Database["public"]["Enums"]["ams_priority"]
          product?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ams_status"]
          subject: string
          tags?: string[]
          team?: string | null
          ticket_no?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          expected_resolution_at?: string | null
          id?: string
          metadata?: Json
          priority?: Database["public"]["Enums"]["ams_priority"]
          product?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ams_status"]
          subject?: string
          tags?: string[]
          team?: string | null
          ticket_no?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          trigger: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          trigger: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          trigger?: string
          updated_at?: string
        }
        Relationships: []
      }
      badge_collections: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          collection_id: string | null
          color: string | null
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          rarity: Database["public"]["Enums"]["rarity_tier"]
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          collection_id?: string | null
          color?: string | null
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          collection_id?: string | null
          color?: string | null
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "badge_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          name: string
          rewards: Json | null
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          rewards?: Json | null
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          rewards?: Json | null
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          name: string
          rewards: Json
          starts_at: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          xp_reward: number
        }
        Insert: {
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          rewards?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          rewards?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          allowed_roles: string[]
          created_at: string
          created_by: string | null
          id: string
          module: string
          title: string | null
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          module?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          module?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          sender_id: string | null
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          sender_id?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          cost_coins: number
          cost_tokens: number
          created_at: string
          decided_at: string | null
          decided_by: string | null
          fulfilled_at: string | null
          id: string
          notes: string | null
          reward_id: string
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_coins?: number
          cost_tokens?: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_coins?: number
          cost_tokens?: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          name: string
          rewards: Json | null
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          rewards?: Json | null
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          rewards?: Json | null
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      leaderboard_definitions: {
        Row: {
          created_at: string
          description: string | null
          formula: Json | null
          id: string
          metric: string
          name: string
          refresh_minutes: number
          scope: string
          scope_value: string | null
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          formula?: Json | null
          id?: string
          metric?: string
          name: string
          refresh_minutes?: number
          scope?: string
          scope_value?: string | null
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          formula?: Json | null
          id?: string
          metric?: string
          name?: string
          refresh_minutes?: number
          scope?: string
          scope_value?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          computed_at: string
          definition_id: string
          id: string
          rank: number
          score: number
          user_id: string
        }
        Insert: {
          computed_at?: string
          definition_id: string
          id?: string
          rank: number
          score?: number
          user_id: string
        }
        Update: {
          computed_at?: string
          definition_id?: string
          id?: string
          rank?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          level_number: number
          name: string
          rewards: Json
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          xp_required: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level_number: number
          name: string
          rewards?: Json
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_required: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level_number?: number
          name?: string
          rewards?: Json
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_required?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          cadence: Database["public"]["Enums"]["mission_cadence"]
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          name: string
          rewards: Json
          season_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          xp_reward: number
        }
        Insert: {
          cadence?: Database["public"]["Enums"]["mission_cadence"]
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          rewards?: Json
          season_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          cadence?: Database["public"]["Enums"]["mission_cadence"]
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          rewards?: Json
          season_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "missions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          template_id: string | null
          trigger: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          template_id?: string | null
          trigger: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          template_id?: string | null
          trigger?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string
          id: string
          key: string
          status: Database["public"]["Enums"]["entity_status"]
          title_template: string
          updated_at: string
        }
        Insert: {
          body_template: string
          channel?: string
          created_at?: string
          id?: string
          key: string
          status?: Database["public"]["Enums"]["entity_status"]
          title_template: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string
          id?: string
          key?: string
          status?: Database["public"]["Enums"]["entity_status"]
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role_title: string | null
          state: string | null
          team: string | null
          territory: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          role_title?: string | null
          state?: string | null
          team?: string | null
          territory?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role_title?: string | null
          state?: string | null
          team?: string | null
          territory?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          rewards: Json
          status: Database["public"]["Enums"]["entity_status"]
          steps: Json
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          rewards?: Json
          status?: Database["public"]["Enums"]["entity_status"]
          steps?: Json
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          rewards?: Json
          status?: Database["public"]["Enums"]["entity_status"]
          steps?: Json
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      ranks: {
        Row: {
          benefits: Json
          color: string | null
          created_at: string
          icon: string | null
          id: string
          min_xp: number
          name: string
          rank_number: number
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          benefits?: Json
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          min_xp: number
          name: string
          rank_number: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          benefits?: Json
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          min_xp?: number
          name?: string
          rank_number?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      reward_wallets: {
        Row: {
          balance: number
          kind: Database["public"]["Enums"]["wallet_kind"]
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          kind: Database["public"]["Enums"]["wallet_kind"]
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          kind?: Database["public"]["Enums"]["wallet_kind"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          cost_coins: number
          cost_tokens: number
          created_at: string
          created_by: string | null
          description: string | null
          eligibility: Json
          icon: string | null
          id: string
          image_url: string | null
          name: string
          rarity: Database["public"]["Enums"]["rarity_tier"]
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          stock: number | null
          updated_at: string
        }
        Insert: {
          cost_coins?: number
          cost_tokens?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligibility?: Json
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          stock?: number | null
          updated_at?: string
        }
        Update: {
          cost_coins?: number
          cost_tokens?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligibility?: Json
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string
          id: string
          name: string
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["entity_status"]
          theme: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          name: string
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["entity_status"]
          theme?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          name?: string
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          theme?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      trophies: {
        Row: {
          color: string | null
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          tier: Database["public"]["Enums"]["trophy_tier"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          tier?: Database["public"]["Enums"]["trophy_tier"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          tier?: Database["public"]["Enums"]["trophy_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          metadata: Json | null
          progress: number
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          metadata?: Json | null
          progress?: number
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          metadata?: Json | null
          progress?: number
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mission_progress: {
        Row: {
          completed_at: string | null
          id: string
          mission_id: string
          period_key: string | null
          progress: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mission_id: string
          period_key?: string | null
          progress?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          mission_id?: string
          period_key?: string | null
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_trophies: {
        Row: {
          earned_at: string
          id: string
          trophy_id: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          trophy_id: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          trophy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "trophies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          current_level: number
          current_rank: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_level?: number
          current_rank?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_level?: number
          current_rank?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_rules: {
        Row: {
          conditions: Json
          cooldown_seconds: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          max_per_day: number | null
          multiplier: number
          name: string
          source_id: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          xp_value: number
        }
        Insert: {
          conditions?: Json
          cooldown_seconds?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_per_day?: number | null
          multiplier?: number
          name: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_value?: number
        }
        Update: {
          conditions?: Json
          cooldown_seconds?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_per_day?: number | null
          multiplier?: number
          name?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_rules_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "xp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_sources: {
        Row: {
          created_at: string
          default_xp: number
          description: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_xp?: number
          description?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_xp?: number
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          rule_id: string | null
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          rule_id?: string | null
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          rule_id?: string | null
          source_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "xp_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "xp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_post_in_chat: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_chat_participant: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      ams_chat_channel:
        | "support"
        | "developer"
        | "qa"
        | "boss"
        | "ai"
        | "customer"
      ams_event_kind:
        | "created"
        | "updated"
        | "status_changed"
        | "assigned"
        | "reassigned"
        | "transferred"
        | "commented"
        | "internal_note"
        | "escalated"
        | "resolved"
        | "closed"
        | "reopened"
        | "archived"
        | "restored"
        | "attachment_added"
        | "attachment_removed"
      ams_priority: "low" | "medium" | "high" | "critical"
      ams_status:
        | "draft"
        | "submitted"
        | "assigned"
        | "accepted"
        | "in_progress"
        | "waiting_customer"
        | "waiting_developer"
        | "waiting_qa"
        | "testing"
        | "resolved"
        | "closed"
        | "reopened"
        | "cancelled"
        | "archived"
      app_role: "super_admin" | "admin" | "user"
      claim_status: "pending" | "approved" | "rejected" | "fulfilled"
      entity_status: "active" | "inactive" | "archived" | "draft"
      mission_cadence: "daily" | "weekly" | "monthly" | "seasonal"
      rarity_tier: "common" | "rare" | "epic" | "legendary" | "mythic"
      trophy_tier: "bronze" | "silver" | "gold" | "platinum"
      wallet_kind: "coins" | "tokens" | "rewards"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ams_chat_channel: [
        "support",
        "developer",
        "qa",
        "boss",
        "ai",
        "customer",
      ],
      ams_event_kind: [
        "created",
        "updated",
        "status_changed",
        "assigned",
        "reassigned",
        "transferred",
        "commented",
        "internal_note",
        "escalated",
        "resolved",
        "closed",
        "reopened",
        "archived",
        "restored",
        "attachment_added",
        "attachment_removed",
      ],
      ams_priority: ["low", "medium", "high", "critical"],
      ams_status: [
        "draft",
        "submitted",
        "assigned",
        "accepted",
        "in_progress",
        "waiting_customer",
        "waiting_developer",
        "waiting_qa",
        "testing",
        "resolved",
        "closed",
        "reopened",
        "cancelled",
        "archived",
      ],
      app_role: ["super_admin", "admin", "user"],
      claim_status: ["pending", "approved", "rejected", "fulfilled"],
      entity_status: ["active", "inactive", "archived", "draft"],
      mission_cadence: ["daily", "weekly", "monthly", "seasonal"],
      rarity_tier: ["common", "rare", "epic", "legendary", "mythic"],
      trophy_tier: ["bronze", "silver", "gold", "platinum"],
      wallet_kind: ["coins", "tokens", "rewards"],
    },
  },
} as const
