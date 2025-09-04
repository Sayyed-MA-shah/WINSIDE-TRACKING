import { NextRequest, NextResponse } from 'next/server';
import { createClientBackup } from '@/lib/db/backup-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Client Backup API called');
    
    const result = await createClientBackup();
    
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
    console.error('Client Backup API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed'
    }, { status: 500 });
  }
}
