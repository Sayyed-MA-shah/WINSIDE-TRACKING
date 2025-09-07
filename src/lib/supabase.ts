import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations only
// Only create admin client if service role key is available (server-side only)
export const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          article: string
          title: string
          category: string
          brand: 'greenhil' | 'harican' | 'byko'
          taxable: boolean
          attributes: string[]
          media_main: string | null
          archived: boolean
          wholesale: number
          retail: number
          club: number
          cost_before: number
          cost_after: number
          variants: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article: string
          title: string
          category: string
          brand: 'greenhil' | 'harican' | 'byko'
          taxable?: boolean
          attributes?: string[]
          media_main?: string | null
          archived?: boolean
          wholesale: number
          retail: number
          club: number
          cost_before: number
          cost_after: number
          variants?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article?: string
          title?: string
          category?: string
          brand?: 'greenhil' | 'harican' | 'byko'
          taxable?: boolean
          attributes?: string[]
          media_main?: string | null
          archived?: boolean
          wholesale?: number
          retail?: number
          club?: number
          cost_before?: number
          cost_after?: number
          variants?: any[]
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string
          company: string | null
          address: string
          type: 'retail' | 'wholesale' | 'club'
          total_orders: number
          total_spent: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone: string
          company?: string | null
          address: string
          type: 'retail' | 'wholesale' | 'club'
          total_orders?: number
          total_spent?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string
          company?: string | null
          address?: string
          type?: 'retail' | 'wholesale' | 'club'
          total_orders?: number
          total_spent?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_id: string
          customer_name: string | null
          date: string | null
          items: any[]
          subtotal: number
          discount: number | null
          tax: number
          total: number
          status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_status: 'paid' | 'unpaid' | 'partial' | null
          due_date: string | null
          notes: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          customer_id: string
          customer_name?: string | null
          date?: string | null
          items: any[]
          subtotal: number
          discount?: number | null
          tax: number
          total: number
          status?: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_status?: 'paid' | 'unpaid' | 'partial' | null
          due_date?: string | null
          notes?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_id?: string
          customer_name?: string | null
          date?: string | null
          items?: any[]
          subtotal?: number
          discount?: number | null
          tax?: number
          total?: number
          status?: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_status?: 'paid' | 'unpaid' | 'partial' | null
          due_date?: string | null
          notes?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
