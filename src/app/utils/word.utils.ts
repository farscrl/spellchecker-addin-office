// this code is based on https://github.com/divvun/divvun-gramcheck-web/blob/master/msoffice/src/utils/index.ts

export default class WordUtils {
    static async getParagraphRange(context: Word.RequestContext, paragraph: string): Promise<Word.Range> {
        const body = context.document.body;
        context.load(body);
        await context.sync();

        // NOTE: This had to be done because regex splitting is
        // not working ok with some browsers
        // And the reason it should be done like this is the desktop
        // version of Word which unlike the online one
        // cannot search for more than 255 chars at a time
        const chunks = WordUtils.splitStringToChunks(paragraph, 255);

        let fullRange: Word.Range | null = null;
        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];

            const paragraphRangeCollection = body.search(chunk, {
                matchCase: true,
            });

            const paragraphRange = paragraphRangeCollection.getFirstOrNullObject();
            paragraphRange.load('isNullObject');
            await context.sync();

            if (!paragraphRange || paragraphRange.isNullObject) {
                return Promise.reject(new Error('Could not find range for chunk: ' + chunk));
            }

            if (!fullRange) {
                fullRange = paragraphRange;
            } else {
                fullRange = fullRange.expandTo(paragraphRange);
            }
        }

        if (!fullRange) {
            return Promise.reject(new Error('Context paragraph not found'));
        }

        return fullRange;
    }

    static async getWordRange(context: Word.RequestContext, range: Word.Range, errorText: string): Promise<Word.Range> {
        range.load('text');
        await context.sync();

        const errorTextRangeCollection = range.search(errorText, {
            matchCase: true,
            matchWholeWord: true,
        });

        const foundErrorRange = errorTextRangeCollection.getFirstOrNullObject();
        foundErrorRange.load('isNullObject');
        await context.sync();

        if (!foundErrorRange || foundErrorRange.isNullObject) {
            return Promise.reject(new Error('The range for the error wasn\'t found'));
        }

        return foundErrorRange;
    }

    static splitStringToChunks(string: string, chunkLength: number): string[] {
        const chunks: string[] = [];

        let tempString: string = '';
        let counter: number = 1;
        for (const char of string) {
            const invalidChar = WordUtils.isInvalidSearchCharacter(char);
            if (counter > chunkLength || (counter > 0 && invalidChar)) {
                chunks.push(tempString);
                tempString = '';
                counter = 1;
            }
            if (!invalidChar) {
                tempString += char;
                counter++;
            }
        }

        chunks.push(tempString);

        return chunks;
    }

    static isInvalidSearchCharacter(char: string): boolean {
        const code = char.charCodeAt(0);
        return (code >= 0 && code <= 0x1F) || code === 0x7f || (code >= 0x80 && code <= 0x9F);
    }
}
