import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-buy-premium-dialog',
  templateUrl: './buy-premium-dialog.component.html',
  styleUrls: ['./buy-premium-dialog.component.scss'],
})
export class BuyPremiumDialogComponent {
  constructor(private apiService: ApiService) {}

  getPremium(): void {
    this.apiService.getPremium().subscribe({
      next: (url) => {
        window.location = url;
      },
      error: (err) => {},
    });
  }
}
