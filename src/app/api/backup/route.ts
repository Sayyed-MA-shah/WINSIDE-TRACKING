import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/db/backup-restore';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Backup API called');
    
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
