import { Component } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() {
    // Your web app's Firebase configuration
    var firebaseConfig = {
      apiKey: "AIzaSyAzm71y1ZjKLbW7N0bYcWqzSTK2ewWCykA",
      authDomain: "polo-production.firebaseapp.com",
      databaseURL: "https://polo-production.firebaseio.com",
      projectId: "polo-production",
      storageBucket: "polo-production.appspot.com",
      messagingSenderId: "326901133147",
      appId: "1:326901133147:web:e0eea4478c35a345c8747e",
      measurementId: "G-W8W33KSYQQ"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
  }
}
