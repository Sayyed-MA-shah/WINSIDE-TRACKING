import { supabaseAdmin } from '../supabase'
import { Customer } from '../types'

export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching customer:', error)
    return null
  }
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  try {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...customer,
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert([newCustomer])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating customer:', error)
    throw error
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw error
  }
}
