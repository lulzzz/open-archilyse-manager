import KML from 'ol/format/KML';
import { get as getProjection } from 'ol/proj';

/**
 * function to download the final file
 */
const saveData = (() => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  return (fileName, data) => {
    const blob = new Blob([data], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

/**
 * Helper class to export Kml files
 */
export class KmlExport {
  /** API Layout object */
  layout;
  /** Layout to Building address */
  address;

  /** Selected simulation */
  currentSimulation;

  /** Selected floor to display */
  currentFloor;

  /** Floor array to display in the dropdown */
  floors;

  /** Feature to draw */
  feature;

  /** Detail map layer to take the elements from */
  detailSource;

  /** Map view */
  view;

  /** height to the ground */
  height;
  /** height to the sea */
  absolute_height;

  /**
   * Exports a kml File.
   */
  export(drawSimulation, name, extraFolders) {
    const introduction = `<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
          <Document>
            <name>${name}</name>
            <open>1</open>
            <description> ${this.address} </description>`;

    const originalSimulation = this.currentSimulation;
    const originalFloor = this.currentFloor;

    let content = '';
    const simulationsToExport = [
      'buildings',
      'grounds',
      'streets',
      'railroads',
      'parks',
      'trees',
      'lakes',
      'mountains',
      'rivers',
    ]; // , 'rivers', 'trees'

    for (let i = 0; i < simulationsToExport.length; i += 1) {
      this.currentSimulation = simulationsToExport[i];

      // There's no need from extra folder
      let contentFolder = extraFolders
        ? `<Folder><name>Simulation ${this.currentSimulation}</name>`
        : ``;

      // Only the original simulation is visible by default
      if (this.currentSimulation !== originalSimulation) {
        contentFolder += `<visibility>0</visibility>`;
      }
      for (let j = 0; j < this.floors.length; j += 1) {
        this.currentFloor = this.floors[j];
        drawSimulation(this.feature);
        const result = this.exportSimulationKML();
        if (j === 0) {
          if (i === 0) {
            content += result.camera;
          }
          contentFolder += result.camera;
        }
        contentFolder += result.data;
      }

      if (extraFolders) {
        contentFolder += `</Folder>`;
      }

      content += contentFolder;
    }

    const end = `
        </Document>
    </kml>`;

    saveData('Archilyse.kml', introduction + content + end);

    // Revert to the original simulation:
    this.currentSimulation = originalSimulation;
    this.currentFloor = originalFloor;
    drawSimulation(this.feature);
  }

  /**
   * Export only one simulation
   */
  exportSimulationKML() {
    const format = new KML();
    const features = this.detailSource.getFeatures();

    const result = format.writeFeaturesNode(features, {
      featureProjection: this.view.getProjection(),
      dataProjection: getProjection('EPSG:4326'),
    });

    const documents = result.childNodes[0];
    const featureLists = documents.childNodes;
    const height = this.height;
    const absolute_height = this.absolute_height;
    const heightStrSpace = `,${absolute_height} `;
    const heightStr = `,${absolute_height}`;

    let center = null;

    const placemarks = [];
    featureLists.forEach(feature => {
      const featureXML = feature.childNodes;
      const style = featureXML[0];
      const polygon = featureXML[1];

      const XXX = polygon.childNodes[0];
      const YYY = XXX.childNodes[0];
      const coordinateTag = YYY.childNodes[0];
      const coordinates = coordinateTag.childNodes[0];
      const coords = coordinates.nodeValue.split(' ');
      const coordinatesStr = coords.join(heightStrSpace) + heightStr;

      const hexagonColor = style.childNodes[0].childNodes[0].childNodes[0].data;

      if (center === null) {
        center = coords[0].split(',');
      }

      const hexagonColorXML = `<color>${hexagonColor}</color>`;
      const styleXML = `<Style><LineStyle>${hexagonColorXML}</LineStyle><PolyStyle>${hexagonColorXML}<fill>1</fill></PolyStyle></Style>`;
      const coordinatesXML = `<outerBoundaryIs><LinearRing><coordinates>${coordinatesStr}</coordinates></LinearRing></outerBoundaryIs>`;
      const polygonXML = `<Polygon><altitudeMode>absolute</altitudeMode>${coordinatesXML}</Polygon>`;

      // Documentation:
      // https://developers.google.com/kml/documentation/kmlreference#polystyle
      placemarks.push(`
        <Placemark>${styleXML}${polygonXML}</Placemark>`);
    });

    const lookAt = `<LookAt>
            <longitude>${center[0]}</longitude><latitude>${center[1]}</latitude>
            <altitude>${
              this.absolute_height
            }</altitude><heading>0</heading><tilt>50</tilt><range>30</range>
          </LookAt>`;

    return {
      camera: lookAt,
      data: `<Folder><name>${this.currentSimulation} simulation</name>
          <description> Analyzes the ${
            this.currentSimulation
          } visibility </description>${lookAt}${placemarks}
         </Folder>`,
    };
  }
}
