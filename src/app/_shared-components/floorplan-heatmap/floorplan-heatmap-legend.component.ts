import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import { getHexColorsAndLegend } from '../../_shared-libraries/SimData';

import * as d3 from 'd3';
import { DiagramService } from '../../_services';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-floorplan-heatmap-legend',
  templateUrl: './floorplan-heatmap-legend.component.html',
  styleUrls: ['./floorplan-heatmap-legend.component.scss'],
})
export class FloorplanHeatmapLegendComponent
  implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  @Input() legendId;
  @Input() hexData;
  @Input() color;
  @Input() unit;
  @Input() min;
  @Input() max;

  @Input() isCompare;

  bins;
  data;
  _drawHistogramPlot;
  uniqueId;
  subscription: Subscription;

  rangeScaleWrapper;
  rangeWrapper;
  rangeMin;
  rangeMax;
  rangeUnitWrapper;

  increments = [];
  rangeSelection = [];

  container;
  width;

  constructor(private diagramService: DiagramService) {}

  ngOnInit() {
    this.uniqueId = this.diagramService.getUniqueId();
    this.subscription = this.diagramService.eventData$.subscribe(eventData => {});
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.min && !changes.min.firstChange) || (changes.max && !changes.max.firstChange)) {
      this._drawHistogramPlot = null;
      this.setUpDiagram();
    } else if (changes.hexData && !changes.hexData.firstChange) {
      this.plot(this.hexData);
    }
  }

  ngAfterViewInit() {
    this.container = document.getElementById(this.legendId);
    this.width = this.container.offsetWidth;
    this.setUpDiagram();
  }

  setUpDiagram() {
    const colorsAndLegend = getHexColorsAndLegend(this.hexData, this.min, this.max, 9);
    // console.log(colorsAndLegend);
    const legend = colorsAndLegend.legend;

    this.bins = Object.keys(legend);
    this.data = this.bins.map(key => legend[key]);

    this.rangeMin = d3
      .select(`#${this.legendId}`)
      .selectAll('*')
      .remove();

    this.rangeScaleWrapper = d3
      .select(`#${this.legendId}`)
      .append('div')
      .attr('class', 'range-scale-wrapper')
      .attr('id', 'rangeScaleWrapper');

    this.rangeUnitWrapper = d3
      .select(`#${this.legendId}`)
      .append('div')
      .attr('class', 'range-unit-wrapper')
      .attr('id', 'rangeUnitWrapper')
      .html(this.unit);

    // create the div that will hold the minimum value
    this.rangeMin = this.rangeScaleWrapper
      .append('div')
      .attr('class', 'range-extreme')
      .attr('id', 'rangeMin')
      .text(() => {
        if (this.isCompare) {
          // Only absolute values in compare mode.
          return -Math.round(this.min);
        }
        return Math.round(this.min);
      });

    // create the div that will wrap the color range
    this.rangeWrapper = this.rangeScaleWrapper.append('div').attr('class', 'range-wrapper');

    // create the div that will hold the maximum value
    this.rangeMax = this.rangeScaleWrapper
      .append('div')
      .attr('class', 'range-extreme')
      .attr('id', 'rangeMax')
      .text(Math.round(this.max));

    d3.select(`#${this.legendId}`).on('click', () => {
      if (this.rangeSelection.length > 1) {
        this.removeSelection();
      }
    });

    this.plot(this.data);
  }

  plot(data) {
    if (this.data && this.data.length > 0) {
      this._drawHistogramPlot = this.rangeWrapper.data(data).call(this.drawHeatmapLegend, this);
    }
  }

  drawHeatmapLegend(selection, _this) {
    d3.select(`#range`).remove();
    const range = selection
      .append('div')
      .attr('class', 'range')
      .attr('id', 'range');

    _this.bins.map((a, i) => {
      range
        .append('div')
        .attr('index', Math.floor(i))
        .attr('class', 'increment')
        .style('background-color', _this.color[i])
        .on('click', function() {
          d3.event.stopPropagation();
          _this.onClick(this);
        })
        .on('mouseover', function() {
          _this.mouseEnter(this);
        })
        .on('mouseout', function() {
          _this.mouseExit(this);
        });
    });

    _this.increments = Array.from(d3.selectAll(`.increment`)._groups[0]);
  }

  mouseEnter(svgColumn) {
    // const index = parseInt(svgColumn.getAttribute('index'), 10);
    // const data = this.bins[index];
    // const foo = {
    //   min: data,
    //   current: data,
    //   max: null,
    // };
    // console.log(foo);
    // this.diagramService.eventFired(this.uniqueId, foo);
  }

  mouseExit() {
    // this.diagramService.noEventFired(this.uniqueId);
  }

  removeSelection() {
    this.rangeSelection = [];
    this.increments.forEach(el => el.classList.remove('selected'));
    this.increments.forEach(el => el.classList.remove('range-active'));
    this.diagramService.noEventFired(this.uniqueId);
  }

  onClick(event) {
    const clickEnabled = false;
    if (clickEnabled) {
      if (this.rangeSelection.length < 1) {
        // this.rangeUnitWrapper.html('Select another value for the range');
      }

      if (this.rangeSelection.length === 1) {
        this.rangeUnitWrapper.html(this.unit);
      }

      if (this.rangeSelection.length > 1) {
        this.removeSelection();
        return;
      }

      this.rangeSelection = [...this.rangeSelection.splice(-1), event];

      this.constructSelectedRange(this.rangeSelection);

      event.classList.add('selected');
    }
  }

  constructSelectedRange(selected) {
    if (selected.length < 2) {
      return;
    }

    const indexes = selected.map(el => this.increments.indexOf(el)).sort();

    this.increments.forEach((el, i) => {
      if (i >= indexes[0] && i <= indexes[1]) {
        el.classList.add('selected');
      } else {
        el.classList.add('range-active');
      }
    });

    const range = {
      min: this.bins[indexes[0]],
      current: null,
      max: this.bins[indexes[1]],
    };

    this.diagramService.eventFired(this.uniqueId, range);
  }
}
