import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';

/** Padding when displaying only one building in the map */
export const paddingToBuilding = [20, 20, 20, 20];

/** Padding when displaying many buildings in the map */
export const paddingToBuildings = [50, 50, 50, 50];

/** Map style definition, current building */
export const styleCurrent = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 255, 255, 0.8)',
  }),
  stroke: new OlStyleStroke({
    color: '#000000',
    width: 2,
  }),
});

/** Map style definition, default building */
export const styleNormal = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new OlStyleStroke({
    color: '#5a5a5a',
    // width: 1,
  }),
});

/** Map style definition, faded building */
export const styleNormalFaded = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 255, 255, 0.3)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(90, 90, 90, 0.9)',
    width: 2,
    // lineCap: 'round',
  }),
});

/** Map style definition, selected building */
export const styleSelected = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(110,198,181, 0.45)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(110,198,181, 1)',
    width: 2,
    // lineCap: 'round',
  }),
});

/** Map style definition, mouse over building */
export const styleOver = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(200, 200, 200, 0.6)',
  }),
  stroke: new OlStyleStroke({
    color: '#dddddd',
    width: 2,
    // lineCap: 'round',
  }),
});

/** Map style definition, identified as probable building */
export const styleProbable = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(251,219,79, 0.45)', // $new_highlighted_yellow
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(251,219,79, 1)',
    width: 2,
    // lineCap: 'round',
  }),
});

/** Map style definition, identified as very probable building */
export const styleVeryProbable = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(242,117,123, 0.45)', // $new_highlighted_red
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(242,117,123, 1)',
    width: 2,
    // lineCap: 'round',
  }),
});

/** Map style definition, preselected building */
export const selectPreselected = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(98,88,165, 0.45)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(98,88,165, 1)',
    width: 2,
    // lineCap: 'round',
  }),
});
