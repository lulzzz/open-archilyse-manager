import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function httpError(done, error) {
  expect(error.status !== 500).toBeTruthy(error.message);
  done();
}

describe('Api Add remove requests', () => {
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

  it('should add a site and then remove it', (done: DoneFn) => {
    const testName = 'Test Name site';
    const testDescription = 'Test Description site';

    const newSite = {
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

        const siteId = site.site_id;

        ApiFunctions.delete(
          http,
          'sites/' + siteId,
          siteDeleted => {
            expect(siteDeleted).toBe(siteId);
            done();
          },
          httpError.bind(this, done)
        );
      },
      httpError.bind(this, done)
    );
  });

  it('should add a building and then remove it', (done: DoneFn) => {
    const testName = 'Test Name building';
    const testDescription = 'Test Description building';

    const newBuilding = {
      name: testName,
      description: testDescription,
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

        const buildingId = building.building_id;

        ApiFunctions.delete(
          http,
          'buildings/' + buildingId,
          buildingDeleted => {
            expect(buildingDeleted).toBe(buildingId);
            done();
          },
          httpError.bind(this, done)
        );
      },
      httpError.bind(this, done)
    );
  });

  it('should add a unit and then remove it', (done: DoneFn) => {
    const testName = 'Test Name unit';
    const testDescription = 'Test Description unit';

    const newBuilding = {
      name: testName,
      description: testDescription,
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

        const unitId = unit.unit_id;

        ApiFunctions.delete(
          http,
          'units/' + unitId,
          unitDeleted => {
            expect(unitDeleted).toBe(unitId);
            done();
          },
          httpError.bind(this, done)
        );
      },
      httpError.bind(this, done)
    );
  });

  it('should add a layout and then remove it', (done: DoneFn) => {
    const testName = 'Test Name layout';
    const testDescription = 'Test Description layout';

    const newBuilding = {
      name: testName,
      description: testDescription,
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

        const layoutId = layout.layout_id;

        ApiFunctions.delete(
          http,
          'layouts/' + layoutId,
          layoutDeleted => {
            expect(layoutDeleted).toBe(layoutId);
            done();
          },
          httpError.bind(this, done)
        );
      },
      httpError.bind(this, done)
    );
  });
});
