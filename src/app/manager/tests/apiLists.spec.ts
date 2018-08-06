import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
        expect(Array.isArray(sites)).toBeTruthy();

        sites.forEach(site => {
          expect(site.site_id).toBeDefined('id not defined');
          if (usersActive) expect(site.user).toBeDefined('User not defined');
          expect(site.updated).toBeDefined('Updated date not defined');
          expect(site.created).toBeDefined('Created date not defined');
        });

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

        buildings.forEach(building => {
          expect(building.building_id).toBeDefined('id not defined');
          if (usersActive) expect(building.user).toBeDefined('User not defined');
          expect(building.updated).toBeDefined('Updated date not defined');
          expect(building.created).toBeDefined('Created date not defined');
        });

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

        units.forEach(unit => {
          expect(unit.unit_id).toBeDefined('id not defined');
          if (usersActive) expect(unit.user).toBeDefined('User not defined');
          expect(unit.updated).toBeDefined('Updated date not defined');
          expect(unit.created).toBeDefined('Created date not defined');
        });

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

        layouts.forEach(layout => {
          expect(layout.layout_id).toBeDefined('id not defined');
          if (usersActive) expect(layout.user).toBeDefined('User not defined');
          expect(layout.updated).toBeDefined('Updated date not defined');
          expect(layout.created).toBeDefined('Created date not defined');
        });

        done();
      },
      httpError.bind(this, done)
    );
  });
});
