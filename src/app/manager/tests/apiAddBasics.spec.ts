import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function httpError(done, error) {
  expect(error.status !== 500).toBeTruthy(error.message);
  done();
}

describe('Api Add requests', () => {
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
        expect(site.site_id).toBeDefined('id not defined');
        if (usersActive) expect(site.user).toBeDefined('User not defined');
        expect(site.updated).toBeDefined('Updated date not defined');
        expect(site.created).toBeDefined('Created date not defined');

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
      building_reference: {},
    };
    ApiFunctions.post(
      http,
      'buildings',
      newBuilding,
      building => {
        expect(building).toBeDefined();
        expect(building.building_id).toBeDefined('id not defined');
        if (usersActive) expect(building.user).toBeDefined('User not defined');
        expect(building.updated).toBeDefined('Updated date not defined');
        expect(building.created).toBeDefined('Created date not defined');

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
        expect(unit.unit_id).toBeDefined('id not defined');
        if (usersActive) expect(unit.user).toBeDefined('User not defined');
        expect(unit.updated).toBeDefined('Updated date not defined');
        expect(unit.created).toBeDefined('Created date not defined');

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
        expect(layout.layout_id).toBeDefined('id not defined');
        if (usersActive) expect(layout.user).toBeDefined('User not defined');
        expect(layout.updated).toBeDefined('Updated date not defined');
        expect(layout.created).toBeDefined('Created date not defined');

        expect(layout.name).toBe(testName);
        expect(layout.description).toBe(testDescription);

        done();
      },
      httpError.bind(this, done)
    );
  });
});
