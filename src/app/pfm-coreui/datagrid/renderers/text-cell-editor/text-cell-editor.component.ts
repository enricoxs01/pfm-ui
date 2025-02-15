import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { TextInputComponent } from '../../../form-inputs/text-input/text-input.component';

@Component({
  selector: 'text-cell-editor',
  templateUrl: './text-cell-editor.component.html',
  styleUrls: ['./text-cell-editor.component.scss']
})
export class TextCellEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild(TextInputComponent) input: TextInputComponent;
  params: any;
  id: string;

  agInit(params: any): void {
    this.params = params;
    this.id = 'TextCellEditorComponent_' + this.params.rowIndex;
  }

  getValue(): any {
    return this.params.data[this.params.column.colId];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.params.focusOnEditMode) {
        this.input.setFocus();
      }
    });
  }
}
