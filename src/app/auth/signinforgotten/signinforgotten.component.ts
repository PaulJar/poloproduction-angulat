import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-signinforgotten',
  templateUrl: './signinforgotten.component.html',
  styleUrls: ['./signinforgotten.component.scss']
})
export class SigninforgottenComponent implements OnInit {

  signinFormForgotten: FormGroup;
  errorMessage: string;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.signinFormForgotten = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmitForgotten() {
    const email = this.signinFormForgotten.get('email').value;

    this.authService.sendPasswordResetEmail(email);
  }
}
