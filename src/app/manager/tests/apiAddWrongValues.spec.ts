import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function postSiteExpectingToFail(http, newSite, done) {
  ApiFunctions.post(
    http,
    'sites',
    newSite,
    site => {
      expect(true).toBeFalsy('Request should have failed');
      done();
    },
    error => {
      expect(error.code).toBeDefined();
      expect(error.message).toBeDefined();
      done();
    }
  );
}

describe('Api post request failing', () => {
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
});
