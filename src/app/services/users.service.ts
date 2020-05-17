import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { PoloUser } from '../models/polouser.model';
import DataSnapshot = firebase.database.DataSnapshot;
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  poloUser = new PoloUser();
  // Create a Subject for a Subscription
  poloUserSubject = new Subject<PoloUser>();

  poloUsers: PoloUser[] = [];
  poloUsersSubject = new Subject<PoloUser[]>();

  constructor() {
    this.getPoloUser();
    this.getPoloUsers();
  }

  // Update the Subject, send it to Subscription
  emitPoloUser() {
    this.poloUserSubject.next(this.poloUser);
  }

  getPoloUser() {
    firebase.auth().onAuthStateChanged(
      (user) => {
        if(user) {
          firebase.database().ref('/users/' + user.uid)
            .on('value', (data: DataSnapshot) => {
                this.poloUser = data.val() ? data.val() : null;
              }
            );
        } else {
          console.log("Error on user constructor.");
        }
      }
    );
  }

  // Update the Subject, send it to Subscription
  emitPoloUsers() {
    this.poloUsersSubject.next(this.poloUsers);
  }

  getPoloUsers() {
    firebase.database().ref('/users')
        .on('value', (data: DataSnapshot) => {
          var objectUsers = data.val() ? data.val() : null; // contains the parent Object of objectKeys
          if(null!=objectUsers) {
            // objectUsers contains one object with string keys.
            // contrary to books, which contain array with numeric values (0, 1, 2...) as keys,
            // numeric values (0, 1, 2...) as keys are interpreted as array directly.
            // Here, we have to make the object an array

            // fill an array of objects
            this.poloUsers = [];
            var objectKeys = Object.keys(objectUsers); // objectKeys = all Objects refering to an objectKey
            for(var i=0; i<objectKeys.length; i++) {
              var k = objectKeys[i]; // one objectKey = one instance of the child Object
              this.poloUsers.push(objectUsers[k]);
            }

            // sort an array of objects in typescript
            this.poloUsers.sort((obj1, obj2) => {
                if (obj1.polodollars > obj2.polodollars) {
                    return -1;
                }

                if (obj1.polodollars < obj2.polodollars) {
                    return 1;
                }

                return 0;
            });

            // update the Subject, send it to Subscription
            this.emitPoloUsers();
          }
        }
        );
  }

  createPoloUser(user: firebase.User) {
    var stats: any[] = [];
    stats['chance'] = 0;
    stats['intelligence'] = 0;
    stats['rapidite'] = 0;
    firebase.database().ref('users/' + user.uid).set({
      pseudo: user.displayName,
      email: user.email,
      avatarUrl: user.photoURL,
      polodollars: 0,
      stats
    }, function(error) {
      if (error) {
        console.log('Erreur de création PoloUser ! : ' + error);
      } else {
        console.log('Création PoloUser OK !');
      }
    });
  }

  updatePoloUserFromFirebaseUser(user: firebase.User) {

    // Write the new user's data in the users list
    var updates = {};
    updates['/users/' + user.uid + '/pseudo'] = user.displayName;
    updates['/users/' + user.uid + '/email'] = user.email;
    updates['/users/' + user.uid + '/avatarUrl'] = user.photoURL;

    this.savePoloUser(updates);
  }

  getCurrentPoloUser() {
    var user = firebase.auth().currentUser;
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

  savePoloUser(updates) {
    firebase.database().ref().update(updates, function(error) {
      if (error) {
        console.log('Erreur d\'update PoloUser ! : ' + error);
      } else {
        console.log('Update PoloUser OK !');
      }
    });
  }

  addPolodollar(poloDollarToAdd: number, tableNumber: number) {

    var user = firebase.auth().currentUser;

    // Write the new user's data in the users list
    var updates = {};
    updates['/users/' + user.uid + '/polodollars'] = this.poloUser.polodollars + poloDollarToAdd;
    if(tableNumber==1){
      updates['/users/' + user.uid + '/stats/chance'] = this.poloUser.stats['chance'] + 1;
    } else if(tableNumber==2 && poloDollarToAdd>0){
      updates['/users/' + user.uid + '/stats/intelligence'] = this.poloUser.stats['intelligence'] + 1;
    } else if(tableNumber==3){
      updates['/users/' + user.uid + '/stats/rapidite'] = this.poloUser.stats['rapidite'] + 1;
    }

    this.savePoloUser(updates);
    this.emitPoloUser();
  }

  addBadge(badgeType: string) {

    var user = firebase.auth().currentUser;

    var poloDollarToRemove = 0;
    switch(badgeType) {
       case 'roche': {
          poloDollarToRemove = 200;
          break;
       }
       case 'cascade': {
          poloDollarToRemove = 500;
          break;
       }
       case 'terre': {
          poloDollarToRemove = 500;
          break;
       }
       default: {
          poloDollarToRemove = 0;
          break;
       }
    }

    // Write the new user's data in the users list
    var updates = {};
    updates['/users/' + user.uid + '/polodollars'] = this.poloUser.polodollars - poloDollarToRemove;
    updates['/users/' + user.uid + '/badges/' + badgeType] = true;

    this.savePoloUser(updates);
    this.emitPoloUser();
  }

}
