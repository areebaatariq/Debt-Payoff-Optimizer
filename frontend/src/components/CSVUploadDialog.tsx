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
import { useAppContext } from '@/contexts/AppContext';
import Papa from 'papaparse';
import { DebtTradeline } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

const debtTypes = ['credit_card', 'personal_loan', 'student_loan', 'auto_loan', 'other'];

export const CSVUploadDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const { addDebt } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      showError('Please select a file to upload.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let addedCount = 0;
        let errorCount = 0;

        results.data.forEach((row: any) => {
          const balance = parseFloat(row.balance);
          const apr = parseFloat(row.apr);
          const minimumPayment = parseFloat(row.minimumPayment);
          const debtType = row.debtType?.toLowerCase().replace(' ', '_');

          if (
            debtTypes.includes(debtType) &&
            !isNaN(balance) && balance > 0 &&
            !isNaN(apr) && apr >= 0 &&
            !isNaN(minimumPayment) && minimumPayment > 0
          ) {
            addDebt({
              debtType: debtType as DebtTradeline['debtType'],
              balance,
              apr,
              minimumPayment,
            });
            addedCount++;
          } else {
            errorCount++;
          }
        });

        if (addedCount > 0) {
          showSuccess(`Successfully added ${addedCount} debt(s).`);
        }
        if (errorCount > 0) {
          showError(`Skipped ${errorCount} invalid row(s). Please check your file and try again.`);
        }
        
        setFile(null);
        setIsOpen(false);
      },
      error: (error) => {
        showError(`Error parsing CSV file: ${error.message}`);
      },
    });
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
          <Button onClick={handleUpload} disabled={!file}>Upload and Add Debts</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};