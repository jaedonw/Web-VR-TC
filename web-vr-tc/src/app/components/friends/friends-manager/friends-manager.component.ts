import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputDialogComponent } from '../../dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../classes/user';

@Component({
  selector: 'app-friends-manager',
  templateUrl: './friends-manager.component.html',
  styleUrls: ['./friends-manager.component.scss'],
})
export class FriendsManagerComponent {
  @Input() friends: User[];
  @Input() friendRequests: User[];
  @Output() sendFriendRequest = new EventEmitter<string>();
  @Output() getFriendRequests = new EventEmitter();
  @Output() acceptFriendRequest = new EventEmitter<string>();
  @Output() removeFriend = new EventEmitter<string>();
  @Output() getFriends = new EventEmitter();

  showAll: boolean = true;
  friendRequestUsername: string;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    if (!this.showAll) {
      this.getFriendRequests.emit();
    } else {
      this.getFriends.emit();
    }
  }

  openAddFriendDialog(): void {
    let dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        title: 'Add Friend',
        message: 'Enter a username.',
        inputLabel: 'Username',
        cancelText: 'Cancel',
        actionText: 'Send Friend Request',
        inputData: this.friendRequestUsername,
      },
    });

    dialogRef.afterClosed().subscribe((username) => {
      if (username) {
        this.sendFriendRequest.emit(username);
      }
    });
  }

  acceptRequest(senderId: string): void {
    this.acceptFriendRequest.emit(senderId);
  }

  removeUserFriend(friendId: string): void {
    this.removeFriend.emit(friendId);
  }
}
