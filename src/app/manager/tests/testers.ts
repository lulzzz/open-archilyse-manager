import {} from 'jasmine';

export class Testers {
  static validateCommon(object, usersActive: boolean) {
    if (usersActive) {
      expect(object.user).toBeDefined('User not defined');
    }
    expect(object.updated).toBeDefined('Updated date not defined');
    expect(object.created).toBeDefined('Created date not defined');

    expect(object.name).toBeDefined('Name not defined');
    expect(object.description).toBeDefined('Description not defined');
  }
  static validateSites(sites, usersActive: boolean) {
    expect(Array.isArray(sites)).toBeTruthy();
    sites.forEach(site => {
      expect(site.site_id).toBeDefined('id not defined');
      this.validateCommon(site, usersActive);
    });
  }
  static validateBuildings(buildings, usersActive: boolean) {
    expect(Array.isArray(buildings)).toBeTruthy();
    buildings.forEach(building => {
      expect(building.building_id).toBeDefined('id not defined');
      this.validateCommon(building, usersActive);
    });
  }
  static validateUnits(units, usersActive: boolean) {
    expect(Array.isArray(units)).toBeTruthy();
    units.forEach(unit => {
      expect(unit.unit_id).toBeDefined('id not defined');
      this.validateCommon(unit, usersActive);
    });
  }
  static validateLayouts(layouts, usersActive: boolean) {
    expect(Array.isArray(layouts)).toBeTruthy();
    layouts.forEach(layout => {
      expect(layout.layout_id).toBeDefined('id not defined');
      this.validateCommon(layout, usersActive);
    });
  }

  static validateSurroundings(surroundings) {
    // Top shot and candidates
    expect(surroundings.top_shot_id).toBeDefined();
    expect(surroundings.candidates_ids).toBeDefined();
    expect(Array.isArray(surroundings.candidates_ids)).toBeTruthy();

    // We check the geojson
    expect(surroundings.geojson).toBeDefined();
    expect(surroundings.geojson.crs).toBeDefined();
    expect(surroundings.geojson.features).toBeDefined();
    expect(Array.isArray(surroundings.geojson.features)).toBeTruthy();
    expect(surroundings.geojson.type).toBeDefined();
  }
}
