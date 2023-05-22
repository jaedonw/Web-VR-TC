import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { PeerService } from '../../services/peer.service';
import { Router } from '@angular/router';
import { Message } from 'src/app/classes/message';
import { ApiService } from 'src/app/services/api.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { Socket } from 'socket.io-client';
import * as THREE from 'three';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
// This import is not used in the code, but it is required for the AFrame library to work
import { AFrame } from 'aframe';
import { User } from 'src/app/classes/user';
import { ConfirmDialogComponent } from 'src/app/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent implements AfterViewInit, OnDestroy {
  @ViewChild('selfVideo') selfVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('peerVideo') peerVideo: ElementRef<HTMLVideoElement>;

  chatOpen: boolean = false;
  newMessages: boolean = false;
  messages: Message[] = [];
  isInChat: boolean = false;
  isinBase: boolean = true;
  sender: boolean = false;
  colorSender: boolean = false;
  models: string[] = ['steve', 'dragon', 'person', 'robot'];
  model: string = 'person';
  myModel: string = 'person';
  modelYawOffset: any = {
    person: 0,
    dragon: 0,
    robot: 0,
    steve: 3.14,
  };
  user: User;
  isUserPremium: boolean = false;

  constructor(
    private api: ApiService,
    private peerService: PeerService,
    private router: Router,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Trying to access the call page directly
    if (!peerService.selfId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    peerService.setSocket();
    peerService.initPeer();
    this.registerModels();
    this.registerPositionListener();
    this.api.me().subscribe({
      next: (result) => {
        this.user = result;
        this.isUserPremium = result.premiumEnabled;
      },
    });
  }

  registerPositionListener(): void {
    delete AFRAME.components['position-listener'];
    AFRAME.registerComponent('position-listener', {
      schema: {
        position: { type: 'vec3', default: new THREE.Vector3(0, 0, -5) },
        yaw: { type: 'number', default: 0 },
        startingZ: { type: 'number', default: -5 },
        startingYaw: { type: 'number', default: 0 },
        firstTick: { type: 'boolean', default: true },
      },
      parent: this,

      tick: function () {
        if (!this.el.object3D.visible) return;

        let newYaw =
          this.el.object3D.rotation.y +
          this.data.startingYaw +
          this.parent.modelYawOffset[this.parent.myModel];

        const newPosition = new THREE.Vector3(
          this.el.object3D.position.x,
          this.el.object3D.position.y,
          this.el.object3D.position.z - this.data.startingZ
        );

        this.data.position.x = newPosition.x;
        this.data.position.z = newPosition.z;

        this.data.yaw = newYaw;
        this.parent.updatePosition(newPosition, newYaw);
      },
    });
  }

  ngAfterViewInit(): void {
    // Trying to access the call page directly
    if (!this.peerService.peer) return;

    this.peerService.getSelfStream().then((stream: MediaStream) => {
      this.selfVideo.nativeElement.srcObject = stream;
    });
    this.peerService.setupConnection(this.peerVideo, this.connectToChat);
  }

  ngOnDestroy(): void {
    if (this.isInChat) {
      this.isInChat = false;
      this.peerService.socketLeave(this.api);
      this.createMessage(' has left the chat', true);
    }

    if (this.peerService.peer) {
      this.peerService.peer.destroy();
      this.expireMeetingInvite();
    }
  }

  @HostListener('window:beforeunload')
  expireMeetingInvite(): void {
    if (this.peerService.getShouldConnect()) return;
    const invitationId = this.peerService.getInvitationId();
    if (invitationId) {
      this.meetingService
        .deleteMeetingInvitation(invitationId)
        .subscribe((result) => {
          this.peerService.setInvitationId('');
        });
    }
  }

  toggleMute(): void {
    this.peerService.getSelfStream().then((stream: MediaStream) => {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    });
  }

  toggleDeafen(): void {
    const alreadyDeafened = this.peerVideo.nativeElement.volume === 0;
    this.peerVideo.nativeElement.volume = !alreadyDeafened ? 0 : 1;
    this.peerService.getSelfStream().then((stream: MediaStream) => {
      stream
        .getAudioTracks()
        .forEach((track) =>
          alreadyDeafened
            ? (track.enabled = !track.enabled)
            : (track.enabled = false)
        );
    });
  }

  toggleDisableVideo(): void {
    this.peerService.getSelfStream().then((stream) => {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    });
  }

  disconnect(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Disconnect',
        message: 'Are you sure you want to disconnect?',
        cancelText: 'Cancel',
        actionText: 'Yes, take me to the dashboard',
      },
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.peerService.destroyPeer();
        if (this.isInChat) {
          this.isInChat = false;
          this.peerService.socketLeave(this.api);
          this.createMessage(' has left the chat', true);
        }
        this.router.navigate(['/dashboard']);
      }
    });
  }

  openMessages(): void {
    this.chatOpen = true;
  }

  closeMessages(): void {
    this.chatOpen = false;
    this.newMessages = false;
  }

  createMessage(message: string, isConnect: boolean = false): void {
    // Create a message object
    const msg = new Message();
    if (isConnect) {
      msg.content = this.user.username + message;
      msg.sender = 'system';
    } else {
      msg.content = message;
      msg.sender = this.user.username;
    }
    this.peerService.sendMessage(msg);
  }

  sendMessage() {
    // check if message is empty
    const message = document.querySelector(
      '#message-input-field'
    ) as unknown as HTMLInputElement;
    if (message.value === '') return;

    this.createMessage(message.value);

    message.value = '';
  }

  connectToChat = (socket: Socket, room: string) => {
    if (socket !== null && !this.isInChat) {
      socket.on('connect', () => {});
      socket.on('message', (msg: Message) => {
        this.messages.unshift(msg);
        if (!this.chatOpen) {
          this.newMessages = true;
        }
      });
      socket.on('disconnect', () => {});
      socket.on('prop', (type: string) => {
        if (type === 'base') {
          this.activateBaseVideo();
          this.isinBase = true;
          return;
        }
        this.activateState(type, this.sender);
        if (this.sender) {
          this.sender = false;
        }
      });
      socket.on('environment', (type: string) => {
        this.updatePresets(type);
      });
      socket.on('color', (color: string) => {
        if (!this.colorSender) {
          this.updateColor(color);
        }
        this.colorSender = false;
      });
      socket.on('host-leave', () => {
        this.peerService.destroyPeer();
        this.peerVideo.nativeElement.srcObject = null;
        const ref = this.snackBar.open(
          'Host has left the call. Press close to be redirected to the dashboard',
          'Close'
        );
        ref.afterDismissed().subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      });
      socket.on('guest-leave', () => {
        this.peerVideo.nativeElement.srcObject = null;
        this.snackBar.open('Guest has left the call', 'OK');
        setTimeout(() => {
          this.snackBar.dismiss();
        }, 3000);
        this.activateProp('base');
      });
      socket.on('move-peer-model', (newPeerPosition, newPeerYaw: any) => {
        document
          .querySelectorAll('.peer-video-container')
          .forEach((peerBox: any) => {
            if (!peerBox.object3D.visible) return;

            peerBox.setAttribute('position', {
              x: -newPeerPosition.x,
              y: peerBox.object3D.position.y,
              z: -newPeerPosition.z,
            });
            peerBox.setAttribute('rotation', {
              x: 0,
              y: THREE.MathUtils.radToDeg(newPeerYaw),
              z: 0,
            });
          });
      });
      this.isInChat = true;
      socket.emit('join', room);
      this.createMessage(' has joined the chat', true);
    }
  };

  activateBaseVideo(): void {
    document.querySelector('#peer-video')?.classList.remove('hidden');
  }

  deactivateBaseVideo(): void {
    document.querySelector('#peer-video')?.classList.add('hidden');
  }

  deactivateStates(): void {
    this.models.forEach((model) => {
      document
        .querySelector(`#${model}-model`)
        ?.setAttribute('visible', 'false');
    });
  }

  activateState(model: string, sender: boolean): void {
    if (this.isinBase) {
      this.deactivateBaseVideo();
      this.isinBase = false;
    }
    if (sender) return;

    setTimeout(() => {
      this.deactivateStates();
      document
        .querySelector(`#${model}-model`)
        ?.setAttribute('visible', 'true');
      this.model = model;
    }, 500);
  }

  activateProp(model: string): void {
    this.sender = true;
    this.peerService.socket.emit('prop', {
      room: this.peerService.room,
      type: model,
    });
    this.myModel = model;
  }

  activateEnvironment(env: string): void {
    this.peerService.socket.emit('environment', {
      room: this.peerService.room,
      type: env,
    });
  }

  activateColor(color: string): void {
    this.colorSender = true;
    this.peerService.socket.emit('color', {
      room: this.peerService.room,
      type: color,
    });
  }

  updatePosition(position: THREE.Vector3, yaw: number): void {
    this.peerService.socket.emit('move-peer-model', {
      room: this.peerService.room,
      position,
      yaw,
    });
  }

  updatePresets(preset: string): void {
    const sceneEl = document.querySelector('a-scene') as any;
    const environment = sceneEl.components.environment;

    environment.data.preset = preset;
    environment.update();
  }

  updateColor(color: string): void {
    if (color === 'default') {
      document.querySelector(`#${this.model}-model`).emit('color-reset');
    } else {
      document
        .querySelector(`#${this.model}-model`)
        .emit('color-change', { color: color });
    }
  }

  registerModels(): void {
    this.models.forEach((model) => {
      delete AFRAME.components[model];
      AFRAME.registerComponent(model, {
        schema: {
          colors: { current: 'array', default: [] },
        },
        init: function () {
          let el = this.el;
          let self = this;
          el.addEventListener('model-loaded', (e: any) => {
            let prop = el.getObject3D('mesh') as any;
            if (!prop) {
              return;
            }
            prop.traverse(function (node: any) {
              if (node.isMesh) {
                self.data.colors.push(node.material.color);
              }
            });
          });
          el.addEventListener('color-change', (e: any) => {
            let prop = el.getObject3D('mesh') as any;
            if (!prop) {
              return;
            }
            prop.traverse(function (node: any) {
              if (node.isMesh) {
                node.material.color = new THREE.Color(e.detail.color);
              }
            });
          });
          el.addEventListener('color-reset', (e: any) => {
            let prop = el.getObject3D('mesh') as any;
            if (!prop) {
              return;
            }
            const newColors: any[] = [];
            let currColor = null;
            prop.traverse(function (node: any) {
              if (node.isMesh) {
                currColor = self.data.colors.shift();
                node.material.color = currColor;
                newColors.push(currColor);
              }
            });
            self.data.colors = newColors;
          });
        },
      });
    });
  }
}
