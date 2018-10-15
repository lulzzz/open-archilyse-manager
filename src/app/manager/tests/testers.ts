import {} from 'jasmine';

/**
 * Helper class for the Unit tests
 */
export class Testers {
  /**
   * All the entities have at least [user, updated, created, name, description] we validate those fields
   * @param object
   */
  static validateCommon(object) {
    expect(object.user).toBeDefined('User not defined');

    expect(object.updated).toBeDefined('Updated date not defined');
    expect(object.created).toBeDefined('Created date not defined');

    expect(object.name).toBeDefined('Name not defined');
    expect(object.description).toBeDefined('Description not defined');
  }

  /**
   * We validate all the sites with [id] defined
   * @param sites
   */
  static validateSites(sites) {
    expect(Array.isArray(sites)).toBeTruthy();
    sites.forEach(site => {
      expect(site.site_id).toBeDefined('id not defined');
      this.validateCommon(site);
    });
  }

  /**
   * We validate all the buildings with [id] defined
   * @param buildings
   */
  static validateBuildings(buildings) {
    expect(Array.isArray(buildings)).toBeTruthy();
    buildings.forEach(building => {
      expect(building.building_id).toBeDefined('id not defined');
      this.validateCommon(building);
    });
  }

  /**
   * We validate all the units with [id] defined
   * @param units
   */
  static validateUnits(units) {
    expect(Array.isArray(units)).toBeTruthy();
    units.forEach(unit => {
      expect(unit.unit_id).toBeDefined('id not defined');
      this.validateCommon(unit);
    });
  }

  /**
   * We validate all the layouts with [id] defined
   * @param layouts
   */
  static validateLayouts(layouts) {
    expect(Array.isArray(layouts)).toBeTruthy();
    layouts.forEach(layout => {
      expect(layout.layout_id).toBeDefined('id not defined');
      this.validateCommon(layout);
    });
  }

  /**
   * We validate all the surroundings with [top_shot_id, candidates_ids, geojson: [crs, features, type]] defined
   * @param surroundings
   */
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
