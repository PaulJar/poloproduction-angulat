import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { BookListComponent } from './book-list/book-list.component';
import { SingleBookComponent } from './book-list/single-book/single-book.component';
import { BookFormComponent } from './book-list/book-form/book-form.component';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './services/auth.service';
import { BooksService } from './services/books.service';
import { AuthGuardService } from './services/auth-guard.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { WelcomeComponent } from './auth/welcome/welcome.component';
import { SigninforgottenComponent } from './auth/signinforgotten/signinforgotten.component';
import { CasinoComponent } from './casino/casino.component';
import { RankingComponent } from './ranking/ranking.component';
import { ShopComponent } from './shop/shop.component';
import { ChartsModule } from 'ng2-charts';

const appRoutes: Routes = [
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: 'auth/signinforgotten', component: SigninforgottenComponent },
  { path: 'welcome', canActivate: [AuthGuardService], component: WelcomeComponent },
  { path: 'casino', canActivate: [AuthGuardService], component: CasinoComponent },
  { path: 'ranking', canActivate: [AuthGuardService], component: RankingComponent },
  { path: 'shop', canActivate: [AuthGuardService], component: ShopComponent },
  { path: 'books', canActivate: [AuthGuardService], component: BookListComponent },
  { path: 'books/new', canActivate: [AuthGuardService], component: BookFormComponent },
  { path: 'books/view/:id', canActivate: [AuthGuardService], component: SingleBookComponent },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' }
];

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    SigninComponent,
    BookListComponent,
    SingleBookComponent,
    BookFormComponent,
    HeaderComponent,
    WelcomeComponent,
    SigninforgottenComponent,
    CasinoComponent,
    RankingComponent,
    ShopComponent
  ],
  imports: [
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientModule,
      RouterModule.forRoot(appRoutes),
      ChartsModule
    ],
  providers: [AuthService, BooksService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
