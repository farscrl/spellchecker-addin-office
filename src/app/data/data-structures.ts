import Paragraph = Word.Paragraph;

export interface ISpellingError {
    paragraph: number;
    offset: number;
    length: number;
    word: string;
}

export interface ITextWithPosition {
    offset: number;
    length: number;
    word: string;
}

export interface ISpellError {
    id: any;
    error: string;
}
