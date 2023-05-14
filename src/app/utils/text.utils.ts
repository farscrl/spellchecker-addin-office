export default class TextUtils {
    static getContext(searchTerm: string, text: string): string | undefined {
        // this regex looks up for 3 words before the searchTerm word and 3 words after it
        // the search term has to be enclosed by word boundaries. as the standard word boundaries (\b)
        // do not include special characters like àèì, the regex has to be written manually. see:
        // https://stackoverflow.com/a/56945933
        const regExpString = String.raw`(([a-z]+[^a-z]+)|([^a-z]+[a-z]+)){0,3}(?<![äöüÄÖÜàéèòìÀÉÈÒÌ\w])(${searchTerm})(?![äöüÄÖÜàéèòìÀÉÈÒÌ\w])(([a-z]+[^a-z]+)|([^a-z]+[a-z]+)){0,3}`;
        const regExp = new RegExp(regExpString, 'gm');
        return text.match(regExp)?.[0];
    }
}
