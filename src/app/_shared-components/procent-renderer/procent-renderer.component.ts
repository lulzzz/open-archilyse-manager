import { Component } from '@angular/core';

@Component({
  selector: 'app-procent-renderer',
  templateUrl: './procent-renderer.component.html',
  styleUrls: ['./procent-renderer.component.scss'],
})
export class ProcentRendererComponent {
  params: any;
  value: any;
  styles: any;

  // called on init
  agInit(params: any): void {
    this.params = params;
    this.value = parseInt(this.params.value, 10);

    // We prevent not set values or negative values be be rendered incorrectly
    if (!(this.value >= 0)) {
      this.value = 0;
    }

    this.styles = {
      width: this.value + '%',
      backgroundColor: '#2e67b1',
    };

    if (this.value <= 0) {
      this.styles.color = '#2c353e';
    } else {
      this.styles.color = '#ffffff';
    }

    /**
    if (this.value < 20) {
      this.styles.backgroundColor = '#ff8582';
    } else if (this.params.value < 60) {
      this.styles.backgroundColor = '#ffc975';
    } else if (this.params.value < 80) {
      this.styles.backgroundColor = '#b5d686';
    }
    */
  }
}
