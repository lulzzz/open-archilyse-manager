import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Testers} from './testers';

function httpError(done, error) {
  expect(error.status !== 500).toBeTruthy(error.message);
  done();
}

describe('Api List requests', () => {
  let http: HttpClient;

  const usersActive = false;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [],
    });

    http = TestBed.get(HttpClient);
  });

  /** *************************************************************************************
   * Lists
   * ************************************************************************************** */

  it('should get the site list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'sites',
      sites => {
        expect(Array.isArray(sites)).toBeTruthy();
        done();
      },
      httpError.bind(this, done)
    );
  });
  it('should get the building list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'buildings',
      buildings => {
        expect(Array.isArray(buildings)).toBeTruthy();
        done();
      },
      httpError.bind(this, done)
    );
  });
  it('should get the unit list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'units',
      units => {
        expect(Array.isArray(units)).toBeTruthy();
        done();
      },
      httpError.bind(this, done)
    );
  });
  it('should get the layout list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'layouts',
      layouts => {
        expect(Array.isArray(layouts)).toBeTruthy();
        done();
      },
      httpError.bind(this, done)
    );
  });

  /** *************************************************************************************
   * Lists in detail
   * ************************************************************************************** */

  it('should get the site list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'sites',
      sites => {
        Testers.validateSites(sites, usersActive);
        done();
      },
      httpError.bind(this, done)
    );
  });
  it('should get the building list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'buildings',
      buildings => {
        Testers.validateBuildings(buildings, usersActive);
        done();
      },
      httpError.bind(this, done)
    );
  });
  it('should get the unit list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'units',
      units => {
        Testers.validateUnits(units, usersActive);
        done();
      },
      httpError.bind(this, done)
    );
  });
  it('should get the layout list', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'layouts',
      layouts => {
        Testers.validateLayouts(layouts, usersActive);
        done();
      },
      httpError.bind(this, done)
    );
  });
});
