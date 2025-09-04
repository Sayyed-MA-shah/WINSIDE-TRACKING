import { NextRequest, NextResponse } from 'next/server';
import { restoreFromBackup, validateBackupFile } from '@/lib/db/backup-restore';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Restore API called');
    
    const body = await request.json();
    const { backupData, confirmRestore } = body;
    
    // Safety check - require explicit confirmation
    if (!confirmRestore) {
      return NextResponse.json({
        success: false,
        error: 'Restore requires explicit confirmation'
      }, { status: 400 });
    }
    
    // Validate backup file
    const validation = validateBackupFile(backupData);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid backup file',
        details: validation.errors
      }, { status: 400 });
    }
    
    console.log('✅ Backup file validated');
    console.log('⚠️  Starting SAFE restore - no data will be deleted');
    
    const result = await restoreFromBackup(backupData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        summary: result.summary,
        message: 'Restore completed successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Restore API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Restore failed'
    }, { status: 500 });
  }
}
