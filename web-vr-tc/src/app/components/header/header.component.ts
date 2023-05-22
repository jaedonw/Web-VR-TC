import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { FuncService } from 'src/app/services/func.service';
import { BuyPremiumDialogComponent } from '../dialogs/buy-premium-dialog/buy-premium-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isAuth: boolean = false;
  showPopover: boolean = false;
  isUserPremium: boolean = false;

  constructor(
    private api: ApiService,
    private func: FuncService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.func.disableAllButtons();
    this.checkAuth();
  }

  logout(): void {
    this.func.disableAllButtons();
    this.api.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.isAuth = false;
        this.func.enableAllButtons();
      },
    });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  routeHome(): void {
    if (this.isAuth) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  checkAuth(): void {
    this.api.me().subscribe({
      next: (result) => {
        this.isAuth = true;
        this.isUserPremium = result.premiumEnabled;
        this.func.enableAllButtons();
      },
      error: () => {
        this.isAuth = false;
        this.func.enableAllButtons();
      },
    });
  }

  openBuyPremiumDialog(): void {
    const dialogRef = this.dialog.open(BuyPremiumDialogComponent, {});
  }
}
