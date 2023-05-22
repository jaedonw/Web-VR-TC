import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { VideoCallComponent } from './pages/video-call/video-call.component';
import { ApiService } from './services/api.service';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PremiumGuard } from './guards/premium.guard';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ApiService],
  },
  {
    path: 'call',
    component: VideoCallComponent,
    canActivate: [ApiService],
  },
  {
    path: 'credits',
    component: CreditsComponent,
  },
  {
    path: 'success',
    component: PaymentSuccessComponent,
    canActivate: [PremiumGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
