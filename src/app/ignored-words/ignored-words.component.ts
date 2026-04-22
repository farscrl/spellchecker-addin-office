import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDictionaryService } from "../services/user-dictionary.service";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";


@Component({
    selector: 'app-ignored-words',
    templateUrl: './ignored-words.component.html',
    styleUrls: ['./ignored-words.component.scss'],
    imports: []
})
export class IgnoredWordsComponent implements OnInit, OnDestroy {

    words: string[] = [];

    private dictionarySubscription?: Subscription;

    constructor(private userDictionaryService: UserDictionaryService, private toastr: ToastrService) {
    }

    ngOnInit() {
        this.dictionarySubscription = this.userDictionaryService.getAllEntriesObservable().subscribe(words => {
            this.words = words;
        });
    }

    ngOnDestroy() {
        if (this.dictionarySubscription) {
            this.dictionarySubscription.unsubscribe();
            this.dictionarySubscription = undefined;
        }
    }

    remove(word: string): void {
        this.userDictionaryService.removeFromDictionary(word);
    }

    async copyWords() {
        const string = this.words.join("\n");
        const success = await this.copyTextToClipboard(string);

        if (success) {
            this.toastr.info('Copià cun success las datas.');
        } else {
            this.toastr.error("Impussibel da copiar las datas en l’archiv provisoric.");
        }
    }

    /**
     * Helper method to handle cross-platform clipboard copying
     * specifically designed to bypass Word Add-in WebView2 limitations.
     */
    private async copyTextToClipboard(text: string): Promise<boolean> {
        // 1. modern API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn("Modern clipboard API failed, attempting fallback...", err);
                // Do not throw here, let it proceed to the fallback method below
            }
        }

        // 2. Fallback
        let textArea: HTMLTextAreaElement | null = null;

        try {
            textArea = document.createElement("textarea");
            textArea.value = text;

            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            return document.execCommand('copy');
        } catch (err) {
            console.error("Fallback clipboard copy failed:", err);
            return false;
        } finally {
            if (textArea && document.body.contains(textArea)) {
                document.body.removeChild(textArea);
            }
        }
    }
}

