import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function postSiteExpectingToFail(http, newSite, done) {
  const url = 'sites';
  postExpectingToFail(http, url, newSite, done);
}
function postBuildingExpectingToFail(http, newBuilding, done) {
  const url = 'buildings';
  postExpectingToFail(http, url, newBuilding, done);
}
function postUnitExpectingToFail(http, newUnit, done) {
  const url = 'units';
  postExpectingToFail(http, url, newUnit, done);
}
function postLayoutExpectingToFail(http, newLayout, done) {
  const url = 'layouts';
  postExpectingToFail(http, url, newLayout, done);
}

function postExpectingToFail(http, url, newObject, done) {
  ApiFunctions.post(
    http,
    url,
    newObject,
    result => {
      console.log(result);
      expect(true).toBeFalsy('Request should have failed');
      done();
    },
    error => {
      console.log(error);
      expect(error.status).toBeDefined();
      expect(error.status !== 500).toBeTruthy();

      expect(error.code).toBeDefined();
      expect(error.message).toBeDefined();
      done();
    }
  );
}

describe('Api post requests failing', () => {
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
   * Wrong id's
   * ************************************************************************************** */

  it('should NOT add a site with site_id', (done: DoneFn) => {
    const testName = 'Test Name site';
    const testDescription = 'Test Description site';

    const newSite = {
      site_id: 'fake site id',
      name: testName,
      description: testDescription,
    };
    postSiteExpectingToFail(http, newSite, done);
  });

  it('should NOT add a building with building_id', (done: DoneFn) => {
    const testName = 'Test Name building';
    const testDescription = 'Test Description building';

    const newBuilding = {
      site_id: 'fake building id',
      name: testName,
      description: testDescription,
    };
    postBuildingExpectingToFail(http, newBuilding, done);
  });

  it('should NOT add a unit with unit_id', (done: DoneFn) => {
    const testName = 'Test Name unit';
    const testDescription = 'Test Description unit';

    const newUnit = {
      site_id: 'fake unit id',
      name: testName,
      description: testDescription,
    };
    postUnitExpectingToFail(http, newUnit, done);
  });

  it('should NOT add a layout with layout_id', (done: DoneFn) => {
    const testName = 'Test Name layout';
    const testDescription = 'Test Description layout';

    const newLayout = {
      layout_id: 'fake layout id',
      name: testName,
      description: testDescription,
    };
    postLayoutExpectingToFail(http, newLayout, done);
  });

  /** *************************************************************************************
   * Wrong names's
   * ************************************************************************************** */

  it('should NOT add a site with no name', (done: DoneFn) => {
    const testName = 'Test Name site';
    const testDescription = 'Test Description site';

    const newSite = {
      description: testDescription,
    };
    postSiteExpectingToFail(http, newSite, done);
  });

  it('should NOT add a building with building_id', (done: DoneFn) => {
    const testName = 'Test Name building';
    const testDescription = 'Test Description building';

    const newBuilding = {
      description: testDescription,
    };
    postBuildingExpectingToFail(http, newBuilding, done);
  });

  it('should NOT add a unit with unit_id', (done: DoneFn) => {
    const testName = 'Test Name unit';
    const testDescription = 'Test Description unit';

    const newUnit = {
      description: testDescription,
    };
    postUnitExpectingToFail(http, newUnit, done);
  });

  it('should NOT add a layout with layout_id', (done: DoneFn) => {
    const testName = 'Test Name layout';
    const testDescription = 'Test Description layout';

    const newLayout = {
      description: testDescription,
    };
    postLayoutExpectingToFail(http, newLayout, done);
  });
});
