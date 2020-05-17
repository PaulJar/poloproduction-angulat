import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { PoloUser } from '../models/polouser.model';
import DataSnapshot = firebase.database.DataSnapshot;
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {

  isAuth: boolean;
  name: string;
  emailVerified: boolean;

  poloUser: PoloUser;
  poloUserSubscription: Subscription;

  poloUsers: PoloUser[] = [];
  poloUsersSubscription: Subscription;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private usersService: UsersService,
              private router: Router) {
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(
      (user) => {
        if(user) {
          // Firebase user
          this.isAuth = true;
          this.name = user.displayName;
          this.emailVerified = user.emailVerified;

          // Polo user
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

    // Add Subscription on Polo Users
    this.poloUsersSubscription = this.usersService.poloUsersSubject.subscribe(
      (poloUsers: PoloUser[]) => {
        this.poloUsers = poloUsers;
      }
    );

    // get PoloUsers from database and emit them on current list
    this.usersService.getPoloUsers();
    this.usersService.emitPoloUsers();
  }

  ngOnDestroy() {
    // Remove Subscription on Polo Users
    this.poloUsersSubscription.unsubscribe();
  }

  objectKeys(obj) {
    return Object.keys(obj);
  }

  objectValues(obj) {
     return Object.values(obj);
  }

  hasBadge(obj, badgeType: string){
    return obj!=null ? obj.hasOwnProperty(badgeType) : false;
  }

  redirectOnWelcome() {
    this.router.navigate(['/welcome']);
  }

  onBuyBadgeRoche() {
    // add Badge on datasbase
    this.usersService.addBadge('roche');
  }

  onBuyBadgeCascade() {
    // add Badge on datasbase
    this.usersService.addBadge('cascade');
  }

  onBuyBadgeTerre() {
    // add Badge on datasbase
    this.usersService.addBadge('terre');
  }

  onBuyBadgeEclair() {
    // add Badge on datasbase
    this.usersService.addBadge('eclair');
  }
}
