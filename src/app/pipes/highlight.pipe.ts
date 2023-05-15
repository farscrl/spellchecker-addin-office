import { Pipe, PipeTransform } from '@angular/core';
import TextUtils from "../utils/text.utils";

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: any, args: string): unknown {
    if(!value || !args) return value;
    // the search term has to be enclosed by word boundaries. as the standard word boundaries (\b)
    // do not include special characters like àèì, the regex has to be written manually. see:
    // https://stackoverflow.com/a/56945933
    const re = new RegExp(`(?<![äöüÄÖÜàéèòìÀÉÈÒÌ\\w])(${TextUtils.escapeRegExp(args)})(?![äöüÄÖÜàéèòìÀÉÈÒÌ\\w])`, 'gm');
    value= value.replace(re, '<span class="highlighted-text">$1</span>');
    return value;
  }

}
