import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable()
export class AuthService {

  constructor() { }

  actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    // url: 'https://www.example.com/finishSignUp?cartId=1234',
//    url: 'https://polo-production.web.app/auth/signup',
    url: 'http://localhost:4200/auth/verified',

    // This must be true.
    handleCodeInApp: true,
  };

  createNewUser(email: string, password: string) {
      return new Promise(
        (resolve, reject) => {
          firebase.auth().createUserWithEmailAndPassword(email, password).then(
            () => {
              var user = firebase.auth().currentUser;
              console.log('Création Firebase User OK !');
              resolve(user);
            },
            (error) => {
              console.log('Erreur de création Firebase User ! : ' + error);
              reject(error);
            }
          );
        }
      );
  }

  createNewUserByEmail(email: string) {
      return new Promise(
        (resolve, reject) => {
          firebase.auth().sendSignInLinkToEmail(email, this.actionCodeSettings).then(
            () => {
              window.localStorage.setItem('emailForSignIn', email);
              resolve();
            },
            (error) => {
              reject(error);
            }
          );
        }
      );
  }

  signInUser(email: string, password: string) {
      return new Promise(
        (resolve, reject) => {
          firebase.auth().signInWithEmailAndPassword(email, password).then(
            () => {
              resolve();
            },
            (error) => {
              reject(error);
            }
          );
        }
      );
  }

  signOutUser() {
      firebase.auth().signOut();
  }

  getCurrentUser() {
    return firebase.auth().currentUser;
  }

  sendPasswordResetEmail(emailAddress: string) {
      firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
        // Email sent.
      }).catch(function(error) {
        // An error happened.
      });
  }

  sendEmailVerification() {
      return new Promise(
        (resolve, reject) => {
          var user = firebase.auth().currentUser;

          user.sendEmailVerification()
          .then(function() {
            resolve();
          }).catch(function(error) {
            reject(error);
          });
        }
      );
  }

  updateDisplayName(pseudo: string) {
      return new Promise(
        (resolve, reject) => {
          var user = firebase.auth().currentUser;

          user.updateProfile({
            displayName: pseudo
          }).then(function() {
            console.log('Update Firebase User OK !');
            resolve(user);
          }).catch(function(error) {
            console.log('Erreur d\'update Firebase User ! : ' + error);
            reject(error);
          });
        }
      );
  }

  uploadFile(file: File) {

      // remove existing picture
      this.removeProfilePic();

      // upload new picture + update user profile
      return new Promise(
        (resolve, reject) => {
          var user = firebase.auth().currentUser;
          var uid = user.uid;
          const almostUniqueFileName = Date.now().toString();
          const upload = firebase.storage().ref()
            .child('avatars/' + uid + "_" + file.name).put(file);

          // Register three observers:
          // 1. 'state_changed' observer, called any time the state changes
          // 2. Error observer, called on failure
          // 3. Completion observer, called on successful completion
          upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
              // Observe state change events such as progress, pause, and resume
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log('Upload is paused');
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log('Upload is running');
                  break;
              }
            },
            (error) => {
              // Handle unsuccessful uploads
              console.log('Erreur de chargement ! : ' + error);
              reject();
            },
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              upload.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                user.updateProfile({
                  photoURL: downloadURL
                }).then(function() {
                  console.log('Update Firebase User OK !');
                  resolve();
                }).catch(function(error) {
                  console.log('Erreur d\'update Firebase User ! : ' + error);
                  reject(error);
                });
              });
            }
          );
        }
      );
  }

  removeProfilePic() {
    var user = firebase.auth().currentUser;
    var photoUrl = user.photoURL;
    if(photoUrl) {
      const storageRef = firebase.storage().refFromURL(photoUrl);
      storageRef.delete().then(
        () => {
          console.log('Photo removed!');
        },
        (error) => {
          console.log('Could not remove photo! : ' + error);
        }
      );
    }
  }
}
