// ar
// تشفيل - on
// الرسومات البينية- charts
// قاءمة الكلمات المفتاحية - keyword list


// LanguageManager.js
export default class LanguageManager {
    constructor() {
        this.languages = {
            'en': {
                'css':{
                    'lang': 'en',
                    'dir': 'ltr',
                    'unicode-bidi': 'bidi-override',
                    // 'font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                    'font-family': 'Franklin Gothic Medium, Arial Narrow, Arial, sans-serif',
                    'font-size': '20px',
                    'font-weight': 'normal',
                },
                
                'words':{
                    'Kalimat On': 'Kalimat On',
                    'Charts': 'Charts',
                    'Keyword List': 'Keyword List',
                    'Language': 'Language',
                    'Arabic': 'Arabic',
                    'English': 'English',
                    'Search volume data' : 'Search volume data',
                }
            },
            'ar':{
                'css':{
                    'lang':'ar',
                    'dir': 'rtl',
                    // 'unicode-bidi': 'bidi-override',
                    'font-family': 'Tajawal, sans-serif',
                    'font-size': '40px',
                    'font-weight': 'bold',
                    
                },
                'words':{
                    'Kalimat On': 'تشفيل',
                    'Charts': 'الرسومات البينية',
                    'Keyword List': 'قاءمة الكلمات المفتاحية',
                    'Language': 'اللغة',
                    'Arabic': 'العربية',
                    'English': 'الانجليزية',

                }
            }
            // Add more languages as needed
        };

        // Set default language
        this.currentLanguage = 'en';
    }

    setLanguage(languageCode) {
        if (this.languages[languageCode]) {
            this.currentLanguage = languageCode;
        } else {
            console.error(`Language code ${languageCode} not found.`);
        }
    }

    getLocalizedString(word, prev_lang) {
        // console.log("key: ", key)
        // if(!this.languages[this.currentLanguage]['words'][key]) console.log("words not found")
        if(prev_lang == 'en'){
            return this.languages[this.currentLanguage]['words'][word];

        }else{
            const prev_words = this.languages[prev_lang]['words']
            const eng_word = Object.keys(prev_words).find(key => prev_words[key] === word)
            const translated = this.languages[this.currentLanguage]['words'][eng_word]
            console.log("translated: ", translated, "eng_word", eng_word, "word", word, "prev_lang", prev_lang)
            return translated
        }
        

        // return this.languages[this.currentLanguage]['words'][key];
    }
    tester(val, prev_lang){
        

        // console.log("eng_word: ", eng_word)
        // const wordInEng = this.languages['en']['words'][val]
    }
    getLocalizedCSS() {
        return this.languages[this.currentLanguage]['css'] || {};
    }

    getLocalizedList(words) {
        return words.map(word => {return this.getLocalizedString(word)})
    }

    applyLocalizedCSS(element) {
        const css = this.getLocalizedCSS()

        for (const [key, value] of Object.entries(css)) {

            if(!element.style[key]) element.style[key] = value
        }
    }
}
