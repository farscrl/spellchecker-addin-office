export default class TextUtils {
    static getContext(searchTerm: string, text: string): string | undefined {
        const regExpString = String.raw`(([a-z]+[^a-z]+)|([^a-z]+[a-z]+)){0,4}${searchTerm}(([a-z]+[^a-z]+)|([^a-z]+[a-z]+)){0,4}`;
        const regExp = new RegExp(regExpString, 'i');
        return text.match(regExp)?.[0];
    }
}
