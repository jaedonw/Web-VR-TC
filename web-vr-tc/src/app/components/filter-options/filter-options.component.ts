import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  styleUrls: ['./filter-options.component.scss'],
})
export class FilterOptionsComponent implements OnInit {
  @Input() isUserPremium: boolean;
  @Output() activateProp = new EventEmitter<string>();
  @Output() activateEnvironment = new EventEmitter<string>();
  @Output() activateColor = new EventEmitter<string>();
  color: string = '#ff0000';
  currentPreview: string = 'text-preview';

  constructor() {}

  ngOnInit(): void {}

  onActivateProp(prop: string): void {
    this.activateProp.emit(prop);
  }

  onActivateEnvironment(env: string): void {
    this.activateEnvironment.emit(env);
  }

  onActivateColorSelected(event: boolean): void {
    if (!event) {
      this.onActivateColor(this.color);
    }
  }

  onActivateColor(color: string): void {
    this.activateColor.emit(color);
  }

  onHoverPreview(visual: string): void {
    document.querySelector(`#${this.currentPreview}`).classList.add('hidden');
    this.currentPreview = visual;
    document.querySelector(`#${visual}`).classList.remove('hidden');
  }

  resetPreview(): void {
    document.querySelector(`#${this.currentPreview}`).classList.add('hidden');
    this.currentPreview = 'text-preview';
    document
      .querySelector(`#${this.currentPreview}`)
      .classList.remove('hidden');
  }
}
