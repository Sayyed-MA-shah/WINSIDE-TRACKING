import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/db/backup-restore';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Backup API called');
    
    // Check if required environment variables are available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Service role key not configured. Please configure SUPABASE_SERVICE_ROLE_KEY in your environment variables.'
      }, { status: 500 });
    }
    
    const result = await createBackup();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Backup created successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed'
    }, { status: 500 });
  }
}
