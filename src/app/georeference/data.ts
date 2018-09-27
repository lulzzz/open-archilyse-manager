import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';

export const paddingToBuilding = [20, 20, 20, 20];
export const paddingToBuildings = [50, 50, 50, 50];

export const styleCurrent = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 255, 255, 0.8)',
  }),
  stroke: new OlStyleStroke({
    color: '#000000',
    width: 2,
  }),
});

export const styleNormal = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new OlStyleStroke({
    color: '#5a5a5a',
    width: 1,
  }),
});

export const styleNormalFaded = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 255, 255, 0.3)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(90, 90, 90, 0.9)',
    width: 3,
    lineCap: 'round',
  }),
});

export const styleSelected = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(110, 255, 110, 1)',
  }),
  stroke: new OlStyleStroke({
    color: '#ffffff',
    width: 3,
    lineCap: 'round',
  }),
});

export const styleOver = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(200, 200, 200, 0.6)',
  }),
  stroke: new OlStyleStroke({
    color: '#dddddd',
    width: 3,
    lineCap: 'round',
  }),
});

export const styleProbable = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(190, 110, 110, 0.8)',
  }),
  stroke: new OlStyleStroke({
    color: '#dddddd',
    width: 3,
    lineCap: 'round',
  }),
});

export const styleVeryProbable = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 110, 110, 0.8)',
  }),
  stroke: new OlStyleStroke({
    color: '#dddddd',
    width: 3,
    lineCap: 'round',
  }),
});

export const selectPreselected = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(110, 110, 255, 0.8)',
  }),
  stroke: new OlStyleStroke({
    color: '#dddddd',
    width: 3,
    lineCap: 'round',
  }),
});
