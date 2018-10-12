import { Component, Input, OnChanges, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

import {
  areBoundsVertical,
  drawGeometriesFilter,
  geometriesToBounds,
  svgColorsMini,
} from '../../_shared-libraries/SimData';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-floorplan',
  templateUrl: './floorplan.component.html',
  styleUrls: ['./floorplan.component.scss'],
})
export class FloorplanComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() floorplanId;
  @Input() svgGeometries;
  @Input() bounds;

  svg;
  scale;

  width;
  height;

  startPosition;

  resize_sub;

  constructor() {
    /**
     * We need to redraw the diagram when the window resizes.
     */
    this.resize_sub = Observable.fromEvent(window, 'resize')
      .debounceTime(500)
      .subscribe(() => {
        this.initialize();
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.resize_sub) {
      this.resize_sub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    //
    setTimeout(this.initialize.bind(this), 100);
  }

  initialize() {
    this.bounds = geometriesToBounds(this.svgGeometries, ['seats', 'desks']);
    if (this.bounds[0] === null) {
      this.bounds = geometriesToBounds(this.svgGeometries);
      if (this.bounds[0] === null) {
        console.error('We were not able to get the bounds out of the geometries');
      } else {
        console.log('bounds based in all geometries');
      }
    }

    const isVertical = areBoundsVertical(this.bounds);

    this.cleanSVG();
    this.initialiseSVG(this.bounds);

    this.drawGeometries();

    if (this.svgGeometries['mask']) {
      const gaugePoints = this.svgGeometries['mask'];
      this.drawMask(gaugePoints);
    }
  }

  /**
   * Draw all the geometries taking in account the zIndex
   * Windows over everything and Lines over windows.
   */
  drawGeometries() {
    // Bottom geometries
    drawGeometriesFilter(this, this.svg, svgColorsMini, this.svgGeometries, null, [
      'gauge',
      'mask',
      'floors',
      'windows',
      'lines',
    ]);

    // Middle geometries
    drawGeometriesFilter(
      this,
      this.svg,
      svgColorsMini,
      this.svgGeometries,
      ['windows'],
      ['gauge', 'mask']
    );

    // Top geometries
    drawGeometriesFilter(
      this,
      this.svg,
      svgColorsMini,
      this.svgGeometries,
      ['lines'],
      ['gauge', 'mask']
    );
  }
  cleanSVG() {
    d3.select(`#${this.floorplanId} svg`).remove();
  }

  initialiseSVG(bounds) {
    const rectangle = d3
      .select(`#${this.floorplanId}`)
      .node()
      .getBoundingClientRect();

    this.width = rectangle.width;
    this.height = rectangle.height;

    let marginRelative = Math.floor(this.width / 20);
    if (marginRelative > 50) {
      marginRelative = 50;
    }

    const margin = {
      top: marginRelative,
      right: marginRelative,
      bottom: marginRelative,
      left: marginRelative,
    };

    const lengthX = bounds[2] - bounds[0];
    const lengthY = bounds[3] - bounds[1];

    this.startPosition = [bounds[0], bounds[3]];

    const ratioX = (this.width - (margin.left + margin.right)) / lengthX;
    const ratioY = (this.height - (margin.top + margin.bottom)) / lengthY;

    if (ratioX > ratioY) {
      this.scale = ratioY;
    } else {
      this.scale = ratioX;
    }

    // Create SVG element
    this.svg = d3
      .select(`#${this.floorplanId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  /**
   * Draws an array of pixels as a polygon (Array of pairs of x,y)
   * Adds color and opacity and metadata.
   * Behaviour is based on the metadata
   * @param {Array<Array<number>>} polygonVertecies
   * @param layer
   * @param color
   * @param {string} category
   * @param {number} poligonNr
   */
  drawPolygon(polygonVertecies: [number[]], layer, color, category: string, poligonNr: number) {
    const scaledVertecies = [];

    // Here we calculate the bounding box
    let boxX1 = null;
    let boxX2 = null;
    let boxY1 = null;
    let boxY2 = null;

    if (polygonVertecies) {
      for (let i = 0; i < polygonVertecies.length; i += 1) {
        const x = (polygonVertecies[i][0] - this.startPosition[0]) * this.scale;
        const y = -(polygonVertecies[i][1] - this.startPosition[1]) * this.scale;

        scaledVertecies.push([x, y]);

        if (!boxX1) {
          boxX1 = x;
          boxX2 = x;
          boxY1 = y;
          boxY2 = y;
        } else {
          if (x < boxX1) {
            boxX1 = x;
          }
          if (x > boxX2) {
            boxX2 = x;
          }
          if (y < boxY1) {
            boxY1 = y;
          }
          if (y > boxY2) {
            boxY2 = y;
          }
        }
      }
    } else {
      console.error('error', polygonVertecies, color, category, poligonNr);
    }

    const verteciesString = scaledVertecies.toString().split(',');

    if (scaledVertecies.length > 2) {
      const object = layer
        .append('polygon')
        .attr('points', verteciesString)
        .style('fill', color['fill'])
        .style('stroke', color['stroke'])
        .style('stroke-width', '1px')
        .style('opacity', color['opacity'])
        .style('z-index', color['zIndex']);

      if (category === 'seats') {
        object.attr('class', 'seat');
      } else if (category === 'desks') {
        object.attr('class', 'desk');
      } else if (category === 'windows') {
        object.attr('class', 'window');
      } else if (category === 'doors') {
        object.attr('class', 'door');
      } else if (category === 'mask') {
      }
    } else {
      console.error(
        'Wrong number of points: ',
        scaledVertecies,
        verteciesString,
        polygonVertecies,
        category
      );
    }
  }

  onMouseOver() {
    const a = d3.select(`#${this.floorplanId} svg`);
    a
      .transition(d3.easeLinear)
      .duration(3000)
      .attr('transform', 'scale(1.1,1.1) rotate(0) translate(0,0)');
  }

  onMouseOut() {
    const a = d3.select(`#${this.floorplanId} svg`);
    a
      .transition(d3.easeLinear)
      .duration(500)
      .attr('transform', 'scale(1,1) rotate(0) translate(0,0)');
  }

  /**
   * Draws the mask over all elements to border the office.
   * @param maskPoints
   */
  drawMask(maskPoints) {
    const color = {};

    color['fill'] = '#fafbfd';
    color['opacity'] = 1;

    this.drawPolygon(maskPoints, this.svg, color, 'mask', 0);
  }
}
