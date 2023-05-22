import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  sendMeetingInvitation(
    inviterId: string,
    inviteeId: string,
    meetingCode: string
  ): Observable<any> {
    return this.http.post<any>(
      this.endpoint + `/api/meetings/invitations`,
      {
        inviterId,
        inviteeId,
        meetingCode,
      },
      { withCredentials: true }
    );
  }

  getMeetingInvitations(inviteeId: string): Observable<any> {
    return this.http.get<any>(
      this.endpoint + `/api/meetings/invitations?invitee=${inviteeId}`,
      { withCredentials: true }
    );
  }

  deleteMeetingInvitation(invitationId: string): Observable<any> {
    return this.http.delete<any>(
      this.endpoint + `/api/meetings/invitations/${invitationId}`,
      { withCredentials: true }
    );
  }
}
