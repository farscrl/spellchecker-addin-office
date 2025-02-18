import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import TextUtils from "../../utils/text.utils";
import { SpellcheckerService } from "../../services/spellchecker.service";
import { DialogRef, DialogService } from "@ngneat/dialog";
import { LemmaVersion } from "../../data/suggestion";
import { ReportWordService } from "../../services/report-word.service";
import { ITextWithPosition } from "@farscrl/rumantsch-language-tools/lib/models/data-structures";
import { ToastrService } from "ngx-toastr";

import { MatomoTrackerDirective } from 'ngx-matomo-client/core';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@Component({
    selector: 'app-error-legacy',
    templateUrl: './error-legacy.component.html',
    styleUrls: ['./error-legacy.component.scss'],
    imports: [MatomoTrackerDirective, HighlightPipe]
})
export class ErrorLegacyComponent {

    @Input()
    error?: ITextWithPosition;

    @Input()
    context?: string;

    @Input()
    showContext: boolean = true;

    @Output()
    highlightEvent = new EventEmitter();

    @Output()
    acceptSuggestionEvent = new EventEmitter<{ suggestion: string }>();

    @Output()
    ignoreWordEvent = new EventEmitter<{ word: string }>();

    isOpen = false;

    suggestions: string[] = [];

    @ViewChild('reportDialog') reportDialog?: TemplateRef<any>;
    dialogRef?: DialogRef;
    wordToReport?: string;

    constructor(
        private spellcheckerService: SpellcheckerService,
        private dialogService: DialogService,
        private reportWordService: ReportWordService,
        private toastr: ToastrService,
    ) {
    }

    getContext(word: string) {
        let ctxt = TextUtils.getContext(word, (this.context)!);
        if (ctxt) {
            ctxt = ctxt.replace(/()/i, '<img src="assets/icons/soft-return.svg" class="soft-return-icon" alt="Soft return icon"><br>');
        }
        return ctxt;
    }

    async toggle(): Promise<void> {
        if (!this.isOpen) {
            this.isOpen = true;
            this.suggestions = await this.spellcheckerService.getSuggestions(this.error!.word);
            this.sendHighlight()
        } else {
            this.isOpen = false;
        }
    }

    sendHighlight() {
        this.highlightEvent.emit();
    }

    acceptSuggestion(suggestion: string) {
        this.acceptSuggestionEvent.emit({suggestion});
    }

    ignoreWord(word: string) {
        this.ignoreWordEvent.emit({word});
    }

    reportWord(word: string) {
        this.wordToReport = word;
        this.dialogRef = this.dialogService.open(this.reportDialog!);
        this.dialogRef.afterClosed$.subscribe((result) => {
            if (!!result) {
                this.sendWordToServer(word);
            }
        });
    }

    sendWordToServer(word: string) {
        const lemmaVersion = new LemmaVersion();
        lemmaVersion.lemmaValues.RStichwort = word;
        lemmaVersion.lemmaValues.DStichwort = '';
        lemmaVersion.lemmaValues.contact_comment = 'Proposta via spellchecker Word';

        this.reportWordService.create(lemmaVersion).subscribe(data => {
            this.toastr.info("Tramess il pled «" + word + "» al Pledari Grond.");
        }, error => {
            console.error(error);
        });

    }
}
