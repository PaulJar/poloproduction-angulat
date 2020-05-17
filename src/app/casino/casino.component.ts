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
  poloUserSubscription: Subscription;

  pariePasForm: FormGroup;
  pariePasMise: number;
  pariePasResultat: number;
  pariePasMsgWon: string;
  pariePasPPWon: number;
  pariePasMsgErr: string;

  topRandom: number;
  leftRandom: number;
  displayRandom: boolean;
  flashMsgWon: string;
  flashPPWon: number;

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
        this.setRandomButtonPosition();
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
        console.log('Observable complete!');
      }
    );

    // Create a Subscription to a Subject
    this.poloUserSubscription = this.usersService.poloUserSubject.subscribe(
      (poloUser: PoloUser) => {
        this.poloUser = poloUser;
      }
    );

    this.initFormPariePas();

    this.setRandomButtonPosition();
  }

  ngOnDestroy() {
    // Remove Subscription on Polo User
    this.poloUserSubscription.unsubscribe();
  }

  redirectOnWelcome() {
    this.router.navigate(['/welcome']);
  }

  hasBadge(obj, badgeType: string){
    return obj!=null ? obj.hasOwnProperty(badgeType) : false;
  }

  onSubmitPoloRoulette() {
    let max: number = 99; // between 1 and 99
    this.poloRouletteNumber = Math.floor(Math.random() * Math.floor(max)) + 1;
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
          this.poloRoulettePPWon = 0;
          break;
       }
    }

    // add PoloDollar on database
    if(this.poloRoulettePPWon > 0) {
      var hasBaggeCascade = this.hasBadge(this.poloUser.badges, 'cascade');
      if(hasBaggeCascade) {
        this.poloRoulettePPWon = this.poloRoulettePPWon * 2;
      }
      this.usersService.addPolodollar(this.poloRoulettePPWon, 1);
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

  initFormPariePas() {
    this.pariePasForm = this.formBuilder.group({
      pariePasMise: [0, Validators.required]
    });
  }

  onSubmitPariePas() {
    let pariePasMise = this.pariePasForm.get('pariePasMise').value;
    if(pariePasMise > 10) {
      pariePasMise = 10;
    } else if (pariePasMise < 0) {
      pariePasMise = 0;
    }

    if(pariePasMise>this.poloUser.polodollars) {
      this.pariePasMsgErr = "Ne pariez pas au-dessus de vos moyens...";
    } else {
      this.pariePasMsgErr = "";

      let max: number = 4; // between 1 and 4
      this.pariePasResultat = Math.floor(Math.random() * Math.floor(max)) + 1;

      this.pariePasPPWon = 0;
      switch(this.pariePasResultat) {
         case 0: {
            this.pariePasPPWon = -pariePasMise;
            break;
         }
         case 1: {
            this.pariePasPPWon = -pariePasMise;
            break;
         }
         case 2: {
            this.pariePasPPWon = pariePasMise * 3;
            break;
         }
         case 3: {
            this.pariePasPPWon = -pariePasMise;
            break;
         }
         default: {
            this.pariePasPPWon = -pariePasMise;
            break;
         }
      }

      // add/remove PoloDollar on database
      this.usersService.addPolodollar(this.pariePasPPWon, 2);

      if(this.pariePasPPWon > 0) {
        this.pariePasMsgWon = "BRAVO ! Vous avez gagné ";
      } else if(this.pariePasPPWon < 0) {
        this.pariePasMsgWon = "Vous avez perdu ";
      }
    }
  }

  setRandomButtonPosition() {
    let maxTop: number = 9; // between 1 and 9
    this.topRandom = Math.floor(Math.random() * Math.floor(maxTop)) + 1;

    let maxLeft: number = 90; // between 1 and 90
    this.leftRandom = Math.floor(Math.random() * Math.floor(maxLeft)) + 1;

    let maxDisplay: number = 7; // between 1 and 7
    if(this.poloUser!=null) {
      var hasBaggeEclair = this.hasBadge(this.poloUser.badges, 'eclair');
      if(hasBaggeEclair){
        maxDisplay = 6; // between 1 and 6
      }
    }
    this.displayRandom = Math.floor(Math.random() * Math.floor(maxDisplay)) + 1 == 1 ? true : false;
  }

  onSubmitFlash() {
    let maxPPWin: number = 10; // between 1 and 10
    this.flashPPWon = Math.floor(Math.random() * Math.floor(maxPPWin)) + 1;

    // add/remove PoloDollar on database
    this.usersService.addPolodollar(this.flashPPWon, 3);

    this.flashMsgWon = "BRAVO ! Vous avez gagné ";
  }

}
