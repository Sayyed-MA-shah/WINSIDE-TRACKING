'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Shield, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { downloadBackup } from '@/lib/db/backup-restore';

export default function BackupRestorePage() {
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const handleBackup = async () => {
    setIsBackupLoading(true);
    setBackupResult(null);

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setBackupResult({
          success: true,
          message: 'Backup created successfully!',
          data: result.data
        });
        
        // Automatically download the backup file
        downloadBackup(result.data);
      } else {
        setBackupResult({
          success: false,
          message: result.error || 'Backup failed'
        });
      }
    } catch (error) {
      setBackupResult({
        success: false,
        message: 'Failed to create backup'
      });
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConfirmRestore(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile || !confirmRestore) return;

    setIsRestoreLoading(true);
    setRestoreResult(null);

    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupData,
          confirmRestore: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRestoreResult({
          success: true,
          message: 'Restore completed successfully!',
          summary: result.summary
        });
      } else {
        setRestoreResult({
          success: false,
          message: result.error || 'Restore failed'
        });
      }
    } catch (error) {
      setRestoreResult({
        success: false,
        message: 'Failed to restore backup'
      });
    } finally {
      setIsRestoreLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Restore</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Safely backup and restore your business data
          </p>
        </div>

        {/* Safety Notice */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>100% Safe Operations:</strong> Backup only reads your data. Restore only adds new data or updates existing records - never deletes anything.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Backup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Create Backup
              </CardTitle>
              <CardDescription>
                Download a complete backup of your customers, products, and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Reads all data safely
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No data modifications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Downloads JSON file
                </div>
              </div>

              <Button
                onClick={handleBackup}
                disabled={isBackupLoading}
                className="w-full"
              >
                {isBackupLoading ? (
                  <>
                    <Database className="mr-2 h-4 w-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Create Backup
                  </>
                )}
              </Button>

              {backupResult && (
                <Alert className={backupResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {backupResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={backupResult.success ? 'text-green-800' : 'text-red-800'}>
                    {backupResult.message}
                    {backupResult.success && backupResult.data && (
                      <div className="mt-2 text-sm">
                        <div>📊 {backupResult.data.metadata.totalCustomers} customers</div>
                        <div>📦 {backupResult.data.metadata.totalProducts} products</div>
                        <div>🧾 {backupResult.data.metadata.totalInvoices} invoices</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Restore Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                Restore from Backup
              </CardTitle>
              <CardDescription>
                Upload and restore data from a backup file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Safe restore mode
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No data deletion
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Updates existing records
                </div>
              </div>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {selectedFile && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-sm font-medium">Selected file:</div>
                    <div className="text-sm text-gray-600">{selectedFile.name}</div>
                  </div>

                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <div className="space-y-2">
                        <div><strong>Confirm Restore:</strong></div>
                        <div className="text-sm">
                          • Existing data will be preserved<br/>
                          • New records will be added<br/>
                          • Matching records will be updated<br/>
                          • No data will be deleted
                        </div>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={confirmRestore}
                            onChange={(e) => setConfirmRestore(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">I understand and confirm this safe restore</span>
                        </label>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Button
                onClick={handleRestore}
                disabled={!selectedFile || !confirmRestore || isRestoreLoading}
                className="w-full"
                variant={confirmRestore ? "default" : "secondary"}
              >
                {isRestoreLoading ? (
                  <>
                    <Database className="mr-2 h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Restore from Backup
                  </>
                )}
              </Button>

              {restoreResult && (
                <Alert className={restoreResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {restoreResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={restoreResult.success ? 'text-green-800' : 'text-red-800'}>
                    {restoreResult.message}
                    {restoreResult.success && restoreResult.summary && (
                      <div className="mt-2 text-sm space-y-1">
                        <div><strong>Summary:</strong></div>
                        <div>👥 Customers: {restoreResult.summary.customersAdded} added, {restoreResult.summary.customersUpdated} updated</div>
                        <div>📦 Products: {restoreResult.summary.productsAdded} added, {restoreResult.summary.productsUpdated} updated</div>
                        <div>🧾 Invoices: {restoreResult.summary.invoicesAdded} added, {restoreResult.summary.invoicesUpdated} updated</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📥 Creating Backups</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click "Create Backup" to download all your data</li>
                  <li>• File downloads automatically as JSON</li>
                  <li>• Store backup files safely (cloud storage recommended)</li>
                  <li>• Create backups regularly (weekly/monthly)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📤 Restoring Backups</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Select a backup JSON file</li>
                  <li>• Confirm the safe restore operation</li>
                  <li>• Existing data remains untouched</li>
                  <li>• New data gets added, duplicates get updated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
