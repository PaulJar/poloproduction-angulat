import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { PoloUser } from '../models/polouser.model';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  poloUser = new PoloUser(0);

  constructor() { }

  createPoloUser(user: firebase.User) {
    firebase.database().ref('users/' + user.uid).set({
      pseudo: user.displayName,
      email: user.email,
      avatarUrl: user.photoURL,
      polodollars: 0
    }, function(error) {
      if (error) {
        console.log('Erreur de création PoloUser ! : ' + error);
      } else {
        console.log('Création PoloUser OK !');
      }
    });
  }

  updatePoloUserFromFirebaseUser(user: firebase.User) {
    // A user entry.
    var userData = {
      pseudo: user.displayName,
      email: user.email,
      avatarUrl: user.photoURL,
      polodollars: 0
    };

    // Write the new user's data in the users list
    var updates = {};
    updates['/users/' + user.uid] = userData;

    firebase.database().ref().update(updates, function(error) {
      if (error) {
        console.log('Erreur d\'update PoloUser ! : ' + error);
      } else {
        console.log('Update PoloUser OK !');
      }
    });
  }

  getCurrentPoloUser(user: firebase.User) {
    return new Promise(
      (resolve, reject) => {
        firebase.database().ref('/users/' + user.uid).once('value').then(
          (data: DataSnapshot) => {
            resolve(data.val());
          }, (error) => {
            reject(error);
          }
        );
      }
    );
  }
}
