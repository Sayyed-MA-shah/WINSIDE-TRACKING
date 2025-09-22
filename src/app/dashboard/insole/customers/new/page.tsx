'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Save,
  Heart,
  User
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { insoleDb } from '@/lib/db/insole-db';

export default function NewInsoleCustomer() {
  const router = useRouter();
  const { user } = useInsoleAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic - if provided)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        type: 'retail' as const,
        total_orders: 0,
        total_spent: 0,
        notes: formData.notes.trim() || undefined
      };

      await insoleDb.addCustomer(customerData);
      router.push('/dashboard/insole/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/insole/customers')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Customer</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer's full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="customer@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07123 456789"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter customer's address"
                    rows={3}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Include street address, city, postal code
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes about the customer"
                    rows={3}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Special requirements, preferences, medical conditions, etc.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/insole/customers')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Customer'}
                  </Button>
                </div>

                {/* Quick Action Hint */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    💡 Quick Tip
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    After creating this customer, you'll be able to create invoices for them directly 
                    from the customer list or start a new invoice and search for them by name.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}