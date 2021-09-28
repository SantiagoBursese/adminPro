import { Component, Input } from '@angular/core';

import { MultiDataSet, Label, Color } from 'ng2-charts';

@Component({
  selector: 'app-dona',
  templateUrl: './dona.component.html',
  styles: [
  ]
})
export class DonaComponent {

  @Input () title :string = 'Sin titulo';

  @Input ('labels') public doughnutChartLabels: Label[] = ['Label', 'Label1', 'Label2'];
  @Input ('data') public doughnutChartData: MultiDataSet = [
    [350, 450, 100],
  ];
  public colors:Color[]= [
    {backgroundColor:['#9E120E','#FF5800','#FFB414']}
  ]

  

}
