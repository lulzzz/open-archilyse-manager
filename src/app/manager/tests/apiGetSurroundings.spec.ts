import { TestBed } from '@angular/core/testing';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Testers } from './testers';

function httpError(done, error) {
  console.log('ERROR', error);
  expect(false).toBeTruthy(error.message);
  done();
}

describe('Api get surroundings requests', () => {
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

  it('should get the building surroundings', (done: DoneFn) => {
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
              'buildings/' + firstBuilding.building_id + '/surroundings',
              surroundings => {
                console.log('surroundings', surroundings);
                Testers.validateSurroundings(surroundings);

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

  it('should add a building, get the surroundings and then remove it', (done: DoneFn) => {
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
        Testers.validateBuildings([building], usersActive);

        expect(building.name).toBe(testName);
        expect(building.description).toBe(testDescription);

        const buildingId = building.building_id;

        ApiFunctions.get(
          http,
          'buildings/' + buildingId + '/surroundings',
          surroundings => {
            console.log('surroundings', surroundings);

            Testers.validateSurroundings(surroundings);

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
      },
      httpError.bind(this, done)
    );
  });
});
