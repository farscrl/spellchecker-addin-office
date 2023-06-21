import Paragraph = Word.Paragraph;

export interface ISpellingError {
    paragraph: number;
    offset: number;
    length: number;
    word: string;
}
