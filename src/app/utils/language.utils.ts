import { Language } from "../data/language";

export default class LanguageUtils {
    static getLangCodeFromLanguage(language: Language): string {
        switch (language) {
            case "puter":
                return "rm-puter";
            case "rumantschgrischun":
                return "rm-rumgr";
            case "sursilvan":
                return "rm-sursilv";
            case "sutsilvan":
                return "rm-sutsilv";
            case "surmiran":
                return "rm-surmiran";
            case "vallader":
                return "rm-vallader";
        }

        return "rm-rumgr";
    }
}
