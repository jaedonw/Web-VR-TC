import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './pages/landing/landing.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FriendsManagerComponent } from './components/friends/friends-manager/friends-manager.component';
import { FriendCardComponent } from './components/friends/friend-card/friend-card.component';
import { HttpClientModule } from '@angular/common/http';
import { VideoCallComponent } from './pages/video-call/video-call.component';
import { CallControlsComponent } from './components/call-controls/call-controls.component';
import { FilterOptionsComponent } from './components/filter-options/filter-options.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputDialogComponent } from './components/dialogs/input-dialog/input-dialog.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/material.module';
import { NewMeetingDialogComponent } from './components/dialogs/new-meeting-dialog/new-meeting-dialog.component';
import { JoinMeetingDialogComponent } from './components/dialogs/join-meeting-dialog/join-meeting-dialog.component';
import { ApiService } from './services/api.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { BuyPremiumDialogComponent } from './components/dialogs/buy-premium-dialog/buy-premium-dialog.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    DashboardComponent,
    FriendsManagerComponent,
    FriendCardComponent,
    VideoCallComponent,
    CallControlsComponent,
    FilterOptionsComponent,
    CreditsComponent,
    InputDialogComponent,
    NewMeetingDialogComponent,
    JoinMeetingDialogComponent,
    BuyPremiumDialogComponent,
    PaymentSuccessComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    ColorPickerModule,
  ],
  providers: [ApiService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
