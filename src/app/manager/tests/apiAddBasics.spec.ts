import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Testers } from './testers';
import { TokenInterceptor } from '../../_services/token.interceptor';

function httpError(done, error) {
  console.log('ERROR: ', error);
  expect(error.status !== 500).toBeTruthy(error.message);
  done();
}

describe('Api Add requests', () => {
  let http: HttpClient;

  const usersActive = false;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true,
        },
      ],
      declarations: [],
    });

    http = TestBed.get(HttpClient);
  });

  /** *************************************************************************************
   * Add and remove
   * ************************************************************************************** */

  it('should add a site ', (done: DoneFn) => {
    const testName = 'Test Name site';
    const testDescription = 'Test Description site';

    const newSite = {
      site_id: 'vaca',
      name: testName,
      description: testDescription,
    };
    ApiFunctions.post(
      http,
      'sites',
      newSite,
      site => {
        expect(site).toBeDefined();
        Testers.validateSites([site], usersActive);

        expect(site.name).toBe(testName);
        expect(site.description).toBe(testDescription);
        done();
      },
      httpError.bind(this, done)
    );
  });

  it('should add a building', (done: DoneFn) => {
    const testName = 'Test Name building';
    const testDescription = 'Test Description building';

    const testCity = 'St. Gallen';
    const testCountry = 'Switzerland';
    const testPostal_code = '9000';
    const testStreet = 'Ruhbergstrasse';
    const testStreet_nr = '44';

    const newBuilding = {
      name: testName,
      description: testDescription,
      address: {
        city: testCity,
        country: testCountry,
        postal_code: testPostal_code,
        street: testStreet,
        street_nr: testStreet_nr,
      },
      building_references: [],
    };
    ApiFunctions.post(
      http,
      'buildings',
      newBuilding,
      building => {
        expect(building).toBeDefined();
        Testers.validateBuildings([building], usersActive);

        expect(building.name).toBe(testName);
        expect(building.description).toBe(testDescription);
        done();
      },
      httpError.bind(this, done)
    );
  });

  it('should add a unit', (done: DoneFn) => {
    const testName = 'Test Name unit';
    const testDescription = 'Test Description unit';

    const addressLine1 = '';
    const addressLine2 = '';
    const addressLine3 = '';

    const newBuilding = {
      name: testName,
      description: testDescription,
      address: {
        line1: addressLine1,
        line2: addressLine2,
        line3: addressLine3,
      },
    };
    ApiFunctions.post(
      http,
      'units',
      newBuilding,
      unit => {
        expect(unit).toBeDefined();
        Testers.validateUnits([unit], usersActive);

        expect(unit.name).toBe(testName);
        expect(unit.description).toBe(testDescription);

        done();
      },
      httpError.bind(this, done)
    );
  });

  it('should add a layout', (done: DoneFn) => {
    const testName = 'Test Name layout';
    const testDescription = 'Test Description layout';

    const newBuilding = {
      name: testName,
      description: testDescription,
      model_structure: {},
      movements: [],
    };
    ApiFunctions.post(
      http,
      'layouts',
      newBuilding,
      layout => {
        expect(layout).toBeDefined();
        Testers.validateLayouts([layout], usersActive);

        expect(layout.name).toBe(testName);
        expect(layout.description).toBe(testDescription);

        done();
      },
      httpError.bind(this, done)
    );
  });
});
