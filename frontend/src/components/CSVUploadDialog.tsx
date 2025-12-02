import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebts } from '@/hooks/useDebts';
import { showError, showSuccess } from '@/utils/toast';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';

const debtTypes = ['credit_card', 'personal_loan', 'student_loan', 'auto_loan', 'other'];

export const CSVUploadDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const { uploadCSVAsync, isUploading } = useDebts();
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { track } = useAnalytics();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError('Please select a file to upload.');
      return;
    }

    try {
      const data = await uploadCSVAsync(file);
      track(AnalyticsEvents.CSV_UPLOADED, { addedCount: data.addedCount, errorCount: data.errorCount });
      showSuccess(`Successfully added ${data.addedCount || 0} debt(s).`);
      if (data.errorCount > 0) {
        showError(`Skipped ${data.errorCount} invalid row(s).`);
      }
      setFile(null);
      setIsOpen(false);
    } catch (error: any) {
      showError(error?.message || 'Failed to upload CSV file.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Debts via CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your debt information. The file must contain the headers: debtType, balance, apr, minimumPayment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <a href="/debt_template.csv" download className="text-sm text-blue-500 hover:underline">
            Download template.csv
          </a>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload and Add Debts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};