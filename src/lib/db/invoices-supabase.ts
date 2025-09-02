import { supabaseAdmin } from '../supabase'
import { Invoice } from '../types'

export async function getAllInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        customers (
          name,
          phone,
          company,
          address,
          type
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<string> {
  try {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      ...invoice,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert([newInvoice])
      .select()
      .single()
    
    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw error
  }
}
