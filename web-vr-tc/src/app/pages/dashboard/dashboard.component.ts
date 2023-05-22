import { Component } from '@angular/core';
import { PeerService } from '../../services/peer.service';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { FriendsService } from '../../services/friends.service';
import { User } from '../../classes/user';
import { NewMeetingDialogComponent } from 'src/app/components/dialogs/new-meeting-dialog/new-meeting-dialog.component';
import { JoinMeetingDialogComponent } from 'src/app/components/dialogs/join-meeting-dialog/join-meeting-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from 'src/app/services/meeting.service';
import { ConfirmDialogComponent } from 'src/app/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  meetingCode: string;
  userId: string;
  friends: User[];
  friendRequests: User[];

  constructor(
    private peerService: PeerService,
    private router: Router,
    public dialog: MatDialog,
    private api: ApiService,
    private friendsService: FriendsService,
    private snackBar: MatSnackBar,
    private meetingService: MeetingService
  ) {
    peerService.initPeer();
    this.checkAuth();
  }

  createMeeting(): void {
    let dialogRef = this.dialog.open(NewMeetingDialogComponent, {
      data: {
        friends: this.friends,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const selfId = uuidv4();
        this.peerService.setSelfId(selfId);
        this.peerService.setShouldConnect(false);

        if (!result.isPublic) {
          this.meetingService
            .sendMeetingInvitation(this.userId, result.friend.id, selfId)
            .subscribe((invitation) => {
              this.peerService.setInvitationId(invitation.id);
            });
          this.router.navigate(['/call']);
        } else {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Meeting Code',
              message:
                'Share this code with your friends to join the meeting.\n' +
                selfId,
              cancelText: 'Close',
              actionText: 'Copy to clipboard',
              action: () => {
                navigator.clipboard.writeText(selfId);
                this.snackBar.open('Copied to clipboard', 'Close', {
                  duration: 2000,
                });
              },
            },
          });
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/call']);
          });
        }
      }
    });
  }

  joinMeeting(): void {
    this.meetingService
      .getMeetingInvitations(this.userId)
      .subscribe((result) => {
        let dialogRef = this.dialog.open(JoinMeetingDialogComponent, {
          data: {
            invitations: result.invitations,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.peerService.setShouldConnect(true);
            this.peerService.setPeerId(result.meetingCode);
            this.peerService.setSelfId(uuidv4());
            this.router.navigate(['/call']);
          }
        });
      });
  }

  checkAuth(): void {
    this.api.me().subscribe({
      next: (result) => {
        this.userId = result.id;
        this.getFriends();
        this.friendsService
          .getFriendRequests(this.userId)
          .subscribe((result) => {
            this.friendRequests = result.senders;
          });
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  getFriends(): void {
    this.friendsService.getFriends(this.userId).subscribe((result) => {
      this.friends = result.friends;
    });
  }

  sendFriendRequest(username: string): void {
    this.friendsService
      .sendFriendRequest(this.userId, username)
      .subscribe((recipient) => {
        this.snackBar.open(
          `Friend request sent to ${recipient.username}`,
          'Close'
        );
        setTimeout(() => {
          this.snackBar.dismiss();
        }, 5000);
      });
  }

  getFriendRequests(): void {
    this.friendsService.getFriendRequests(this.userId).subscribe((result) => {
      this.friendRequests = result.senders;
    });
  }

  acceptFriendRequest(senderId: string): void {
    this.friendsService
      .acceptFriendRequest(this.userId, senderId)
      .subscribe((result) => {
        this.getFriendRequests();
      });
  }

  removeFriend(friendId: string): void {
    this.friendsService
      .removeFriend(this.userId, friendId)
      .subscribe((result) => {
        this.getFriendRequests();
        this.getFriends();
      });
  }
}
