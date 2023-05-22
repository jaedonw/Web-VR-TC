import { ElementRef, Injectable } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';
import { io, Socket } from 'socket.io-client';
import { Message } from '../classes/message';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PeerService {
  endpoint = environment.apiEndpoint;
  peer: Peer;
  stream: Promise<MediaStream>;
  selfId: string;
  peerId: string;
  socket: Socket;
  socketCallback: Function;
  room: string = '';
  invitationId: string = '';

  // This value should be set to true if "join call" is clicked instead of create call
  shouldConnect: boolean = true;

  constructor() {}

  initPeer(): void {
    this.peer = new Peer(this.selfId);
  }

  setSocket(): void {
    this.socket = io(this.endpoint);
  }

  sendMessage(message: Message): void {
    this.socket.emit('message', { message, room: this.room });
  }

  setupConnection(
    peerVideo: ElementRef<HTMLVideoElement>,
    socketCallback: Function
  ): void {
    // Wait for the peer to connect to the PeerServer, then start receiving calls
    this.peer.on('open', (_id) => {
      this.socketCallback = socketCallback;
      this.startReceiving(peerVideo);
      if (this.shouldConnect) {
        this.connectToPeer(peerVideo);
      }
    });
  }

  startReceiving(peerVideo: ElementRef<HTMLVideoElement>): void {
    this.getSelfStream().then((stream: MediaStream) => {
      this.peer.on('call', (call: MediaConnection) => {
        call.answer(stream);
        this.room = this.selfId;
        this.socketCallback(this.socket, this.selfId);
        call.on('stream', (remoteStream) => {
          peerVideo.nativeElement.srcObject = remoteStream;
        });
        call.on('close', () => this.handleClose(peerVideo));
      });
    });
  }

  connectToPeer(peerVideo: ElementRef<HTMLVideoElement>): void {
    this.getSelfStream().then((stream: MediaStream) => {
      const call: MediaConnection = this.peer.call(this.peerId, stream);
      this.room = this.peerId;
      this.socketCallback(this.socket, this.peerId);
      call.on('stream', (remoteStream) => {
        peerVideo.nativeElement.srcObject = remoteStream;
      });
      call.on('close', () => this.handleClose(peerVideo));
    });
  }

  socketLeave(api: ApiService): void {
    api.me().subscribe({
      next: (result) => {
        this.socket.emit('leave', { user: result.username, room: this.room });
        if (!this.shouldConnect)
          this.socket.emit('host-leave', { room: this.room });
        else this.socket.emit('guest-leave', { room: this.room });
      },
      error: () => {
        return;
      },
    });
  }

  destroyPeer(): void {
    this.peer.destroy();
  }

  handleClose(peerVideo: ElementRef<HTMLVideoElement>): void {
    peerVideo.nativeElement.srcObject = null;
  }

  getSelfStream(): Promise<MediaStream> {
    if (!this.stream) {
      this.stream = navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    }
    return this.stream;
  }

  getSelfId(): string {
    return this.selfId;
  }

  setSelfId(id: string): void {
    this.selfId = id;
  }

  setPeerId(id: string): void {
    this.peerId = id;
  }

  setShouldConnect(shouldConnect: boolean): void {
    this.shouldConnect = shouldConnect;
  }

  setInvitationId(id: string): void {
    this.invitationId = id;
  }

  getInvitationId(): string {
    return this.invitationId;
  }

  getShouldConnect(): boolean {
    return this.shouldConnect;
  }
}
