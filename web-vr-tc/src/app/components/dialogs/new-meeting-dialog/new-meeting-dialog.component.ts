import { Component, Inject, Input } from '@angular/core';
import { User } from 'src/app/classes/user';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-new-meeting-dialog',
  templateUrl: './new-meeting-dialog.component.html',
  styleUrls: ['./new-meeting-dialog.component.scss'],
})
export class NewMeetingDialogComponent {
  @Input() friends: User[];
  selectedFriend: User;

  constructor(
    private dialogRef: MatDialogRef<NewMeetingDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      friends: User[];
    }
  ) {
    this.friends = data.friends;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSelect(change: MatSelectionListChange) {
    this.selectedFriend = change.options[0].value;
  }
}
