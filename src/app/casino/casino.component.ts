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
  selector: 'app-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.scss']
})
export class CasinoComponent implements OnInit, OnDestroy {

  isAuth: boolean;
  name: string;
  emailVerified: boolean;

  secondes: number;

  poloRouletteNumber: number;
  isRouletteReady: boolean;
  poloRouletteMsgWon: string;
  poloRoulettePPWon: number;

  poloUser: PoloUser;

  poloUsers: PoloUser[] = [];
  poloUsersSubscription: Subscription;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private usersService: UsersService,
              private router: Router) {
    setTimeout(
      () => {
        this.isRouletteReady = true;
      }, 2000
    );
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

    // Observable
    const counter = Observable.interval(1000);
    counter.subscribe(
      (value) => {
        this.secondes = value;
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
        console.log('Observable complete!');
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

  hasBadge(obj, badgeType: string){
    return obj!=null ? obj.hasOwnProperty(badgeType) : false;
  }

  onSubmitPoloRoulette() {
    let max: number = 99;
    this.poloRouletteNumber = Math.floor(Math.random() * Math.floor(max));
    this.isRouletteReady = false;

    this.poloRoulettePPWon = 0;
    switch(this.poloRouletteNumber) {
       case 9: {
          this.poloRoulettePPWon = 10;
          break;
       }
       case 42: {
          this.poloRoulettePPWon = 20;
          break;
       }
       case 66: {
          this.poloRoulettePPWon = 50;
          break;
       }
       case 77: {
          this.poloRoulettePPWon = 100;
          break;
       }
       default: {
          this.poloRoulettePPWon = 10;
          break;
       }
    }

    // add PoloDollar on database
    if(this.poloRoulettePPWon > 0) {
      var hasBaggeCascade = this.hasBadge(this.poloUser.badges, 'cascade');
      if(hasBaggeCascade) {
        this.poloRoulettePPWon = this.poloRoulettePPWon * 2;
      }
      this.usersService.addPolodollar(this.poloRoulettePPWon);
      this.poloRouletteMsgWon = "BRAVO ! Vous avez gagné ";
    }

    return new Promise(
      (resolve, reject) => {
        var hasBaggeRoche = this.hasBadge(this.poloUser.badges, 'roche');
        var timeout = hasBaggeRoche ? 1000 : 2000;
        setTimeout(
          () => {
            this.isRouletteReady = true;
            this.poloRouletteMsgWon = "";
            resolve(true);
          }, timeout
        );
      }
    );
  }

  redirectOnWelcome() {
    this.router.navigate(['/welcome']);
  }
}
