import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import * as firebase from 'firebase';
import { UsersService } from '../services/users.service';
import { PoloUser } from '../models/polouser.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isAuth: boolean;

  poloUser: PoloUser;

  poloUserSubscription: Subscription;

  constructor(private authService: AuthService,
              private usersService: UsersService) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(
      (user) => {
        if(user) {
          this.isAuth = true;

          this.poloUser = new PoloUser();
          this.usersService.getCurrentPoloUser().then(
            (poloUser: PoloUser) => {
              this.poloUser = poloUser;
            }
          );
        } else {
          this.isAuth = false;
        }
      }
    );

    // Create a Subscription to a Subject
    this.poloUserSubscription = this.usersService.poloUserSubject.subscribe(
      (poloUser: PoloUser) => {
        this.poloUser = poloUser;
      }
    );
  }

  ngOnDestroy() {
    this.poloUserSubscription.unsubscribe();
  }

  onSignOut() {
    this.authService.signOutUser();
  }

}
