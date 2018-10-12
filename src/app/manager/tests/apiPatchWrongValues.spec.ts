import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function patchSiteExpectingToFail(http, id, newSite, done) {
  const url = 'sites/' + id;
  patchExpectingToFail(http, url, newSite, done);
}
function patchBuildingExpectingToFail(http, id, newBuilding, done) {
  const url = 'buildings/' + id;
  patchExpectingToFail(http, url, newBuilding, done);
}
function patchUnitExpectingToFail(http, id, newUnit, done) {
  const url = 'units/' + id;
  patchExpectingToFail(http, url, newUnit, done);
}
function patchLayoutExpectingToFail(http, id, newLayout, done) {
  const url = 'layouts/' + id;
  patchExpectingToFail(http, url, newLayout, done);
}

function httpError(done, error) {
  console.log('ERROR', error);
  expect(false).toBeTruthy(error.message);
  done();
}

function patchExpectingToFail(http, url, newObject, done) {
  ApiFunctions.patch(
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
      expect(error.message).toBeDefined();
      done();
    }
  );
}

describe('Api patch requests failing', () => {
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

  it('should NOT patch a site with site_id wrong', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'sites',
      sites => {
        const firstSite = sites[0];
        const newValue = {
          site_id: 'fake site id',
        };
        patchSiteExpectingToFail(http, firstSite.site_id, newValue, done);
      },
      httpError.bind(this, done)
    );
  });
  it('should NOT patch a site with site_id correct', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'sites',
      sites => {
        const firstSite = sites[0];
        const newValue = {
          site_id: '012345678901234567890123',
        };
        patchSiteExpectingToFail(http, firstSite.site_id, newValue, done);
      },
      httpError.bind(this, done)
    );
  });

  it('should NOT patch a site with site_id null', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'sites',
      sites => {
        const firstSite = sites[0];
        const newValue = {
          site_id: '012345678901234567890123',
        };
        patchSiteExpectingToFail(http, firstSite.site_id, newValue, done);
      },
      httpError.bind(this, done)
    );
  });
});
