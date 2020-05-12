import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import * as firebase from 'firebase';
import { UsersService } from '../services/users.service';
import { PoloUser } from '../models/polouser.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isAuth: boolean;

  poloUser: PoloUser;

  constructor(private authService: AuthService,
              private usersService: UsersService) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(
      (user) => {
        if(user) {
          this.isAuth = true;

          this.poloUser = new PoloUser(0);
          this.usersService.getCurrentPoloUser(user).then(
            (poloUser: PoloUser) => {
              this.poloUser = poloUser;
            }
          );
        } else {
          this.isAuth = false;
        }
      }
    );
  }

  onSignOut() {
    this.authService.signOutUser();
  }

}
