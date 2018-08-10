import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../apiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function httpError(done, error) {
  console.log('ERROR', error);
  expect(false).toBeTruthy(error.message);
  done();
}

describe('Api get simulation requests', () => {
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
   * Get simulations
   * ************************************************************************************** */

  it('should get the building simulation', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'buildings',
      buildings => {
        expect(Array.isArray(buildings)).toBeTruthy();

        console.log('buildings', buildings);
        const firstBuilding = buildings[0];

        ApiFunctions.get(
          http,
          'buildings/' + firstBuilding.building_id,
          building => {
            console.log('building', building);
            expect(building).toEqual(firstBuilding);

            ApiFunctions.get(
              http,
              'buildings/' + firstBuilding.building_id + '/simulations',
              simulations => {
                console.log('simulations', simulations);
                done();
              },
              httpError.bind(this, done)
            );
          },
          httpError.bind(this, done)
        );
      },
      httpError.bind(this, done)
    );
  });

  it('should get the layout simulation', (done: DoneFn) => {
    ApiFunctions.get(
      http,
      'layouts',
      layouts => {
        expect(Array.isArray(layouts)).toBeTruthy();
        const firstLayout = layouts[0];

        ApiFunctions.get(
          http,
          'layouts/' + firstLayout.layout_id,
          layout => {
            expect(layout).toEqual(firstLayout);

            ApiFunctions.get(
              http,
              'layouts/' + firstLayout.layout_id + '/simulations',
              simulations => {
                console.log('simulations', simulations);
                done();
              },
              httpError.bind(this, done)
            );
          },
          httpError.bind(this, done)
        );
      },
      httpError.bind(this, done)
    );
  });
});
