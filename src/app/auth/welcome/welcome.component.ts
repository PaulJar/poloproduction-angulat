import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { PoloUser } from '../../models/polouser.model';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  isAuth: boolean;
  name: string;
  email: string;
  photoUrl: string;
  uid: string;
  emailVerified: boolean;

  secondes: number;

  poloRouletteNumber: number;
  isRouletteReady: boolean;

  pseudoForm: FormGroup;
  pseudo: string;
  isValidateMessagePseudo: boolean;
  errorMessagePseudo: string;

  isValidateMessageMailSent: boolean;
  errorMessageMail: string;

  avatarForm: FormGroup;
  fileIsUploading = false;
  fileUrl: string;
  fileUploaded = false;
  validateMessageAvatar: string;
  errorMessageAvatar: string;

  poloUser: PoloUser;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private usersService: UsersService,
              private router: Router) {
    setTimeout(
      () => {
        this.isRouletteReady = true;
      }, 4000
    );
  }

  public radarChartLabels = ['Chance', 'Intelligence', 'Rapidité'];
  public radarChartData = [
    {data: [0, 0, 0], label: 'Stats'}
  ];
  public radarChartType = 'radar';

  ngOnInit() {
    this.poloUser = new PoloUser();
    firebase.auth().onAuthStateChanged(
      (user) => {
        if(user) {
          this.isAuth = true;
          this.name = user.displayName;
          this.email = user.email;
          this.photoUrl = user.photoURL;
          this.emailVerified = user.emailVerified;
          this.uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                           // this value to authenticate with your backend server, if
                           // you have one. Use User.getToken() instead.

          this.poloUser = new PoloUser();
          this.usersService.getCurrentPoloUser().then(
            (poloUser: PoloUser) => {
              this.poloUser = poloUser;
              this.radarChartData = [
                  {data: [this.poloUser.stats['chance'], this.poloUser.stats['intelligence'], this.poloUser.stats['rapidite']], label: 'Stats'}
                ]
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

    this.initForm();
  }

  initForm() {
    this.pseudoForm = this.formBuilder.group({
      pseudo: ['', Validators.required]
    });
  }


  hasBadge(obj, badgeType: string){
    return obj!=null ? obj.hasOwnProperty(badgeType) : false;
  }

  onSubmitEmailVerification() {
    var user = firebase.auth().currentUser;
    this.isValidateMessageMailSent = true;

    this.authService.sendEmailVerification().then(
      () => {
        return new Promise(
          (resolve, reject) => {
            setTimeout(
              () => {
                this.isValidateMessageMailSent = false;
                resolve(true);
              }, 5000
            );
          }
        );
      },
      (error) => {
        this.errorMessagePseudo = error;
      }
    );
  }

  onSubmitPseudo() {
    const pseudo = this.pseudoForm.get('pseudo').value;
    this.isValidateMessagePseudo = true;

    this.authService.updateDisplayName(pseudo).then(
      (user: firebase.User) => {
        this.usersService.updatePoloUserFromFirebaseUser(user);
        return new Promise(
          (resolve, reject) => {
            setTimeout(
              () => {
                this.isValidateMessagePseudo = false;
                resolve(true);
              }, 1500
            );
          }
        );
      },
      (error) => {
        this.errorMessagePseudo = error;
      }
    );
  }

  onUploadFile(file: File) {
    this.fileIsUploading = true;
    this.authService.uploadFile(file).then(
      (url: string) => {
        this.fileUrl = url;
        this.fileIsUploading = false;
        this.fileUploaded = true;
        this.validateMessageAvatar = "Avatar updaté";

        var user = firebase.auth().currentUser;
        this.photoUrl = user.photoURL;
        this.usersService.updatePoloUserFromFirebaseUser(user);

        return new Promise(
          (resolve, reject) => {
            setTimeout(
              () => {
                this.validateMessageAvatar = "";
                resolve(true);
              }, 1500
            );
          }
        );
      },
      (error) => {
        this.errorMessageAvatar = error;
      }
    );
  }

  detectFiles(event) {
    this.onUploadFile(event.target.files[0]);
  }

  getColor() {
      if(this.emailVerified) {
        return 'green';
      } else {
        return 'red';
      }
  }
}
