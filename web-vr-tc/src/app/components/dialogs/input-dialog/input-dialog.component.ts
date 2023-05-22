import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
})
export class InputDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      inputLabel: string;
      cancelText: string;
      actionText: string;
      inputData: string;
    }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
