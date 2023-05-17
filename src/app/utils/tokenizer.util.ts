/**
 * This is a modified version of the Stdlib tokenizer, optimized for Romansh languages.
 * Original: https://github.com/stdlib-js/nlp-tokenize/blob/main/lib/main.js
 * Changes:
 *  - Replaced abbreviation list
 *  - removed concatenation list
 *  - extended prefix/suffix regex list
 *  - add ability to ignore punctuation
 *
 *
 * Original license:
 *
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const REGEXP_PREFIXES = /^([,()\[\]{}*<>«»„"”‟“'‘`!?%\/|:;\-–+…©]|\.{1,3})/gi;
const REGEXP_SUFFIXES =  /([,()\[\]{}*<>«»„"”‟“'‘`!?%\/|:;\-–+…©]|\.{1,3})$/gi;

const EMOJI_LIST = {
    "^_^": ["^_^"],
    "=D": ["=D"],
    ";-p": [";-p"],
    ":O": [":O"],
    ":-/": [":-/"],
    "xD": ["xD"],
    "V_V": ["V_V"],
    ";(": [";("],
    "(:": ["(:"],
    "\")": ["\")"],
    ":Y": [":Y"],
    ":]": [":]"],
    ":3": [":3"],
    ":(": [":("],
    ":-)": [":-)"],
    "=3": ["=3"],
    ":))": [":))"],
    ":>": [":>"],
    ";p": [";p"],
    ":p": [":p"],
    "=[[": ["=[["],
    "xDD": ["xDD"],
    "<333": ["<333"],
    "<33": ["<33"],
    ":P": [":P"],
    "o.O": ["o.O"],
    "<3": ["<3"],
    ";-)": [";-)"],
    ":)": [":)"],
    "-_-": ["-_-"],
    ":')": [":')"],
    "o_O": ["o_O"],
    ";)": [";)"],
    "=]": ["=]"],
    "(=": ["(="],
    "-__-": ["-__-"],
    ":/": [":/"],
    ":0": [":0"],
    "(^_^)": ["(^_^)"],
    ";D": [";D"],
    "o_o": ["o_o"],
    ":((": [":(("],
    "=)": ["=)"]
};

const ABBREVIATION_LIST = {
    "p.pl.": ["p.pl."],
    "P.pl.": ["P.pl."],
    "e.u.v.": ["e.u.v."],
    "E.u.v.": ["E.u.v."],
};

export class TokenizerUtil {
    static tokenize(stringToTokenize: string, keepPunctuation = false, keepWhitespace = false): string[] {
        let subWords: string[];
        let words: string[];
        let tokens: string[];
        let word;

        if (!stringToTokenize) {
            return [];
        }

        if ( keepWhitespace ) {
            words = stringToTokenize.split(/(\s+)/);
        } else {
            words = stringToTokenize.split(/\s+/);
        }

        tokens = [];

        for (let i = 0; i < words.length; i++) {
            word = words[ i ];
            subWords = this.tokenizeSubstring(word, keepPunctuation);
            this.extendArray(tokens, subWords);
        }
        return tokens;
    }

    private static tokenizeSubstring(substring: string, keepPunctuation = false): string[] {
        let prefixes: string[] = [];
        let suffixes: string[] = [];
        let match;
        let done = false;
        let result: string[] = [];

        do {
            if (
                // @ts-ignore
                !EMOJI_LIST[substring] &&
                // @ts-ignore
                !ABBREVIATION_LIST[substring]
            ) {
                match = substring.split(REGEXP_PREFIXES);
                if ( match.length > 1 ) {
                    prefixes.push( match[ 1 ] );
                    substring = match[ 2 ];
                }
                else {
                    match = substring.split(REGEXP_SUFFIXES);
                    if ( match.length > 1 ) {
                        substring = match[ 0 ];
                        suffixes.unshift( match[ 1 ] );
                    } else {
                        done = true;
                    }
                }
            }
            else {
                done = true;
            }
        } while (!done);

        if (keepPunctuation) {
            result = prefixes;
        }

        if (substring) {
            result.push(substring);
        }

        if (keepPunctuation) {
            this.extendArray(result, suffixes);
        }
        return result;
    }

    private static extendArray(baseArray: string[], extension: string[]): string[] {
        for (let i = 0; i < extension.length; i++) {
            baseArray.push(extension[i]);
        }
        return baseArray;
    }
}
