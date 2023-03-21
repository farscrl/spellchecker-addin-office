import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: any, args: string): unknown {
    if(!value || !args) return value;
    const re = new RegExp("("+args+")", 'igm');
    value= value.replace(re, '<span class="highlighted-text">$1</span>');
    return value;
  }

}
