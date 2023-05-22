import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-call-controls',
  templateUrl: './call-controls.component.html',
  styleUrls: ['./call-controls.component.scss'],
})
export class CallControlsComponent {
  @Output() toggleMute = new EventEmitter<void>();
  @Output() toggleDeafen = new EventEmitter<void>();
  @Output() toggleDisableVideo = new EventEmitter<void>();
  @Output() disconnect = new EventEmitter<void>();

  onMute(): void {
    if (!document.getElementById('deafen-btn')?.classList.contains('deafen')) {
      document.getElementById('mute-btn')?.classList.toggle('muted-microphone');
      this.toggleMute.emit();
    }
  }

  onDeafen(): void {
    document.getElementById('deafen-btn')?.classList.toggle('deafen');
    document.getElementById('mute-btn')?.classList.remove('muted-microphone');
    this.toggleDeafen.emit();
  }

  onDisableVideo(): void {
    document.getElementById('video-btn')?.classList.toggle('disabled-video');
    this.toggleDisableVideo.emit();
  }

  onDisconnect(): void {
    this.disconnect.emit();
  }
}
