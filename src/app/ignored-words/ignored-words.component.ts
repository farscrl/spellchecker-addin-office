import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDictionaryService } from "../services/user-dictionary.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-ignored-words',
  templateUrl: './ignored-words.component.html',
  styleUrls: ['./ignored-words.component.scss']
})
export class IgnoredWordsComponent implements OnInit, OnDestroy {

  words: string[] = [];

  private dictionarySubscription?: Subscription;

  constructor(private userDictionaryService: UserDictionaryService) {
  }

  ngOnInit() {
    this.dictionarySubscription = this.userDictionaryService.getAllEntriesObservable().subscribe(words => {
      this.words = words;
    });
  }

  ngOnDestroy() {
    if(this.dictionarySubscription) {
      this.dictionarySubscription.unsubscribe();
      this.dictionarySubscription = undefined;
    }
  }

  remove(word: string): void {
    this.userDictionaryService.removeFromDictionary(word);
  }
}
