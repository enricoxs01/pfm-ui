import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';

@Component({
  selector: 'p5a',
  templateUrl: './p5a.component.html',
  styleUrls: ['./p5a.component.scss']
})
export class P5aComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
