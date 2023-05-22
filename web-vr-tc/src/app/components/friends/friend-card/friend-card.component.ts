import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../classes/user';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.scss'],
})
export class FriendCardComponent {
  @Input() friend!: User;
  @Input() isRequest!: Boolean;
  @Output() acceptFriendRequest = new EventEmitter<string>();
  @Output() removeFriend = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  acceptRequest(): void {
    this.acceptFriendRequest.emit(this.friend.id);
  }

  removeUserFriend(): void {
    this.removeFriend.emit(this.friend.id);
  }
}
