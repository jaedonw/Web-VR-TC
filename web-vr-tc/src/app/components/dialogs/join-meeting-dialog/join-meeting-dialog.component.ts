import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-join-meeting-dialog',
  templateUrl: './join-meeting-dialog.component.html',
  styleUrls: ['./join-meeting-dialog.component.scss'],
})
export class JoinMeetingDialogComponent {
  @Input() invitations: any[] = [];
  meetingCode: string;
  selectedInvitation: any;

  constructor(
    private dialogRef: MatDialogRef<JoinMeetingDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      invitations: any[];
    }
  ) {
    this.invitations = data.invitations;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSelect(change: MatSelectionListChange) {
    this.selectedInvitation = change.options[0].value;
    this.meetingCode = change.options[0].value.meetingCode;
  }
}
