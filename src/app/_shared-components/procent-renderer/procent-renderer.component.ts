import { Component, ViewEncapsulation } from '@angular/core';

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
    this.value = parseInt(this.params.value);

    this.styles = {
      width: this.value + '%',
      backgroundColor: '#81d688',
    };

    if (this.value < 20) {
      this.styles.backgroundColor = '#ff8582';
    } else if (this.params.value < 60) {
      this.styles.backgroundColor = '#ffc975';
    } else if (this.params.value < 80) {
      this.styles.backgroundColor = '#b5d686';
    }
  }
}
