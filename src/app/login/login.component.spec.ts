import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { UserService } from '../_services';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from '../app.module';
import { APP_BASE_HREF } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [AppModule],
        providers: [UserService, HttpClientModule, { provide: APP_BASE_HREF, useValue: '/' }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user and password', () => {
    const identity = fixture.nativeElement;

    const password = identity.querySelector('#password');
    const username = identity.querySelector('#email');

    expect(password).toBeTruthy();
    expect(username).toBeTruthy();
  });

  it('should have a submit button', () => {
    const identity = fixture.nativeElement;

    const submitButton = identity.querySelector('form button[type=submit]');

    expect(submitButton).toBeTruthy();
    expect(submitButton.textContent).toBeTruthy();
  });
});
