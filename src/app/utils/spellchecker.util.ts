import { Hunspell, HunspellFactory, loadModule } from "hunspell-asm";
import tokenize from '@stdlib/nlp-tokenize';

export interface ITextWithPosition {
    offset: number;
    length: number;
    word: string;
}

export default class SpellcheckerUtil {


}
