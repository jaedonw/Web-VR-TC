import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../classes/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  // Get all friends
  getFriends(userId: string): Observable<{ friends: User[] }> {
    return this.http.get<{ friends: User[] }>(
      this.endpoint + `/api/users/${userId}/friends`,
      { withCredentials: true }
    );
  }

  // Send friend request
  sendFriendRequest(userId: string, username: string): Observable<User> {
    return this.http.post<User>(
      this.endpoint + `/api/users/${userId}/friends`,
      {
        username,
      },
      { withCredentials: true }
    );
  }

  // Get friend requests
  getFriendRequests(userId: string): Observable<{ senders: User[] }> {
    return this.http.get<{ senders: User[] }>(
      this.endpoint + `/api/users/${userId}/friend-requests`,
      { withCredentials: true }
    );
  }

  // Accept friend request
  acceptFriendRequest(userId: string, senderId: string): Observable<User> {
    return this.http.patch<User>(
      this.endpoint + `/api/users/${userId}/friends/${senderId}`,
      {},
      { withCredentials: true }
    );
  }

  // Remove friend
  removeFriend(userId: string, friendId: string) {
    return this.http.delete(
      this.endpoint + `/api/users/${userId}/friends/${friendId}`,
      { withCredentials: true }
    );
  }
}
