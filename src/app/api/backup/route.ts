import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/db/backup-restore';
import { createClientBackup } from '@/lib/db/backup-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Backup API called');
    
    // Try admin backup first if service role key is available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('🔑 Service role key found, trying admin backup...');
      try {
        const result = await createBackup();
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: result.data,
            message: 'Admin backup created successfully'
          });
        } else {
          console.log('⚠️ Admin backup failed, falling back to client backup...');
        }
      } catch (adminError) {
        console.log('⚠️ Admin backup error, falling back to client backup:', adminError);
      }
    } else {
      console.log('🔄 No service role key, using client backup...');
    }
    
    // Fallback to client backup
    const clientResult = await createClientBackup();
    
    if (clientResult.success) {
      return NextResponse.json({
        success: true,
        data: clientResult.data,
        message: 'Client backup created successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: clientResult.error || 'Both admin and client backup failed'
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
