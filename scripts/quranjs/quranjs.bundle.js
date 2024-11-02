(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quran = exports.QuranFont = exports.Language = exports.CharType = void 0;
var _humps = require("humps");
var C = exports.CharType = (f => (f.Word = "word", f.End = "end", f.Pause = "pause", f.Sajdah = "sajdah", f.RubElHizb = "rub-el-hizb", f))(C || {});
var m = exports.Language = (s => (s.ARABIC = "ar", s.ENGLISH = "en", s.URDU = "ur", s.BENGALI = "bn", s.TURKISH = "tr", s.SPANISH = "es", s.GERMAN = "de", s.BOSNIAN = "bs", s.RUSSIAN = "ru", s.ALBANIAN_AL = "al", s.FRENCH = "fr", s.DUTCH = "nl", s.TAMIL = "ta", s.TAJIK = "tg", s.INDONESIAN = "id", s.UZBEK = "uz", s.VIETNAMESE = "vi", s.CHINESE = "zh", s.ITALIAN = "it", s.JAPANESE = "ja", s.MALAYALAM = "ml", s.AMHARIC = "am", s.KAZAKH = "kk", s.PORTUGUESE = "pt", s.TAGALOG = "tl", s.THAI = "th", s.KOREAN = "ko", s.HINDI = "hi", s.KURDISH = "ku", s.HAUSA = "ha", s.AZERI = "az", s.SWAHILI = "sw", s.PERSIAN = "fa", s.SERBIAN = "sr", s.MARANAO = "mrn", s.AMAZIGH = "zgh", s.ASSAMESE = "as", s.BULGARIAN = "bg", s.CHECHEN = "ce", s.CZECH = "cs", s.DIVEHI = "dv", s.DHIVEHI = "dv", s.MALDIVIAN = "dv", s.FINNISH = "fi", s.GUJAARATI = "gu", s.HEBREW = "he", s.GEORGIAN = "ka", s.CENTRAL_KHMER = "km", s.GANDA = "lg", s.MARATHI = "mr", s.YORUBA = "yo", s.MALAY = "ms", s.NEPALI = "ne", s.SWEDISH = "sv", s.TELUGU = "te", s.TATAR = "tt", s.UIGHUR = "ug", s.UYGHUR = "ug", s.UKRAINIAN = "uk", s.NORWEGIAN = "no", s.OROMO = "om", s.POLISH = "pl", s.PASHTO = "ps", s.ROMANIAN = "ro", s.SINDHI = "sd", s.NORTHERN_SAMI = "se", s.SINHALA = "si", s.SINHALESE = "si", s.SOMALI = "so", s.ALBANIAN_SQ = "sq", s))(m || {}),
  S = exports.QuranFont = (i => (i.MadaniV1 = "code_v1", i.MadaniV2 = "code_v2", i.Uthmani = "text_uthmani", i))(S || {});
var h = e => e.startsWith("/") ? e.slice(1) : e;
var z = "https://api.quran.com/api/v4/",
  A = (e, r) => {
    let t = `${z}${h(e)}`;
    if (!r) return t;
    let i = (0, _humps.decamelizeKeys)(r),
      n = new URLSearchParams(Object.entries(i).filter(([, f]) => f !== void 0)).toString();
    return n ? `${t}?${n}` : t;
  },
  a = async (e, r = {}, t) => {
    if (t) {
      let f = await t(A(e, r));
      return (0, _humps.camelizeKeys)(f);
    }
    if (typeof globalThis.fetch != "function") throw new Error("Looks like there is no global fetch function. Take a look at https://quranjs.com/techniques#custom-fetcher for more info.");
    let i = await globalThis.fetch(A(e, r));
    if (!i.ok || i.status >= 400) throw new Error(`${i.status} ${i.statusText}`);
    let n = await i.json();
    return (0, _humps.camelizeKeys)(n);
  },
  c = (e = {}, r = {}) => {
    let t = {
      ...e
    };
    t.fetchFn && (t.fetchFn = void 0);
    let i = {
      ...r,
      ...t
    };
    if (i.fields) {
      let n = [];
      Object.entries(i.fields).forEach(([f, E]) => {
        E && n.push((0, _humps.decamelize)(f));
      }), i.fields = n.join(",");
    }
    return i;
  };
var H = {
    1: 7,
    2: 286,
    3: 200,
    4: 176,
    5: 120,
    6: 165,
    7: 206,
    8: 75,
    9: 129,
    10: 109,
    11: 123,
    12: 111,
    13: 43,
    14: 52,
    15: 99,
    16: 128,
    17: 111,
    18: 110,
    19: 98,
    20: 135,
    21: 112,
    22: 78,
    23: 118,
    24: 64,
    25: 77,
    26: 227,
    27: 93,
    28: 88,
    29: 69,
    30: 60,
    31: 34,
    32: 30,
    33: 73,
    34: 54,
    35: 45,
    36: 83,
    37: 182,
    38: 88,
    39: 75,
    40: 85,
    41: 54,
    42: 53,
    43: 89,
    44: 59,
    45: 37,
    46: 35,
    47: 38,
    48: 29,
    49: 18,
    50: 45,
    51: 60,
    52: 49,
    53: 62,
    54: 55,
    55: 78,
    56: 96,
    57: 29,
    58: 22,
    59: 24,
    60: 13,
    61: 14,
    62: 11,
    63: 11,
    64: 18,
    65: 12,
    66: 12,
    67: 30,
    68: 52,
    69: 52,
    70: 44,
    71: 28,
    72: 28,
    73: 20,
    74: 56,
    75: 40,
    76: 31,
    77: 50,
    78: 40,
    79: 46,
    80: 42,
    81: 29,
    82: 19,
    83: 36,
    84: 25,
    85: 22,
    86: 17,
    87: 19,
    88: 26,
    89: 30,
    90: 20,
    91: 15,
    92: 21,
    93: 11,
    94: 8,
    95: 8,
    96: 19,
    97: 5,
    98: 8,
    99: 8,
    100: 11,
    101: 11,
    102: 8,
    103: 3,
    104: 9,
    105: 5,
    106: 4,
    107: 7,
    108: 3,
    109: 6,
    110: 3,
    111: 5,
    112: 4,
    113: 5,
    114: 6
  },
  I = e => {
    let r = typeof e == "number" ? e : Number(e);
    return !(!r || r <= 0 || r > 114);
  },
  P = e => {
    let r = typeof e == "number" ? e : Number(e);
    return !(!r || r <= 0 || r > 30);
  },
  T = e => {
    let r = typeof e == "number" ? e : Number(e);
    return !(!r || r <= 0 || r > 240);
  },
  U = e => {
    let r = typeof e == "number" ? e : Number(e);
    return !(!r || r <= 0 || r > 60);
  },
  K = e => {
    let r = typeof e == "number" ? e : Number(e);
    return !(!r || r <= 0 || r > 604);
  },
  $ = e => {
    let [r, t] = e.trim().split(":");
    if (!r || !t || !I(r)) return !1;
    let i = Number(t),
      n = H[r];
    return !(!i || i <= 0 || i > n);
  },
  j = {
    isValidChapterId: I,
    isValidJuz: P,
    isValidRub: T,
    isValidHizb: U,
    isValidQuranPage: K,
    isValidVerseKey: $
  },
  o = j;
var p = {
    language: "ar"
  },
  M = async e => {
    let r = c(e, p),
      {
        chapters: t
      } = await a("/chapters", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  _ = async (e, r) => {
    if (!o.isValidChapterId(e)) throw new Error("Invalid chapter id");
    let t = c(r, p),
      {
        chapter: i
      } = await a(`/chapters/${e}`, t, r == null ? void 0 : r.fetchFn);
    return i;
  },
  k = async (e, r) => {
    if (!o.isValidChapterId(e)) throw new Error("Invalid chapter id");
    let t = c(r, p),
      {
        chapterInfo: i
      } = await a(`/chapters/${e}/info`, t, r == null ? void 0 : r.fetchFn);
    return i;
  },
  J = {
    findAll: M,
    findById: _,
    findInfoById: k
  },
  b = J;
var D = {
    language: "ar",
    perPage: 50,
    words: !1
  },
  d = (e = {}) => {
    let r = c(e, D);
    if (r.translations && (r.translations = r.translations.join(",")), r.tafsirs && (r.tafsirs = r.tafsirs.join(",")), r.wordFields) {
      let t = [];
      Object.entries(r.wordFields).forEach(([i, n]) => {
        n && t.push((0, _humps.decamelize)(i));
      }), r.wordFields = t.join(",");
    }
    if (r.translationFields) {
      let t = [];
      Object.entries(r.translationFields).forEach(([i, n]) => {
        n && t.push((0, _humps.decamelize)(i));
      }), r.translationFields = t.join(",");
    }
    return r.reciter && (r.audio = r.reciter, r.reciter = void 0), r;
  },
  W = async (e, r) => {
    if (!o.isValidVerseKey(e)) throw new Error("Invalid verse key");
    let t = d(r),
      i = `/verses/by_key/${e}`,
      {
        verse: n
      } = await a(i, t, r == null ? void 0 : r.fetchFn);
    return n;
  },
  g = async (e, r) => {
    if (!o.isValidChapterId(e)) throw new Error("Invalid chapter id");
    let t = d(r),
      i = `/verses/by_chapter/${e}`,
      {
        verses: n
      } = await a(i, t, r == null ? void 0 : r.fetchFn);
    return n;
  },
  q = async (e, r) => {
    if (!o.isValidQuranPage(e)) throw new Error("Invalid page");
    let t = d(r),
      i = `/verses/by_page/${e}`,
      {
        verses: n
      } = await a(i, t, r == null ? void 0 : r.fetchFn);
    return n;
  },
  Z = async (e, r) => {
    if (!o.isValidJuz(e)) throw new Error("Invalid juz");
    let t = d(r),
      i = `/verses/by_juz/${e}`,
      {
        verses: n
      } = await a(i, t, r == null ? void 0 : r.fetchFn);
    return n;
  },
  Y = async (e, r) => {
    if (!o.isValidHizb(e)) throw new Error("Invalid hizb");
    let t = d(r),
      i = `/verses/by_hizb/${e}`,
      {
        verses: n
      } = await a(i, t, r == null ? void 0 : r.fetchFn);
    return n;
  },
  Q = async e => {
    let r = d(e),
      {
        verse: t
      } = await a("/verses/random", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  X = {
    findByKey: W,
    findByChapter: g,
    findByPage: q,
    findByJuz: Z,
    findByHizb: Y,
    findRandom: Q
  },
  O = X;
var L = async e => {
    let {
      juzs: r
    } = await a("/juzs", void 0, e == null ? void 0 : e.fetchFn);
    return r;
  },
  ee = {
    findAll: L
  },
  V = ee;
var N = {
    language: "ar"
  },
  l = {
    language: "ar"
  },
  re = async (e, r) => {
    let t = c(r, N),
      {
        audioFiles: i
      } = await a(`/chapter_recitations/${e}`, t, r == null ? void 0 : r.fetchFn);
    return i;
  },
  te = async (e, r, t) => {
    if (!o.isValidChapterId(e)) throw new Error("Invalid chapter id");
    let i = c(t, N),
      {
        audioFile: n
      } = await a(`/chapter_recitations/${r}/${e}`, i, t == null ? void 0 : t.fetchFn);
    return n;
  },
  se = async (e, r, t) => {
    if (!o.isValidChapterId(e)) throw new Error("Invalid chapter id");
    let i = c(t, l);
    return await a(`/recitations/${r}/by_chapter/${e}`, i, t == null ? void 0 : t.fetchFn);
  },
  ie = async (e, r, t) => {
    if (!o.isValidJuz(e)) throw new Error("Invalid juz");
    let i = c(t, l);
    return await a(`/recitations/${r}/by_juz/${e}`, i, t == null ? void 0 : t.fetchFn);
  },
  ae = async (e, r, t) => {
    if (!o.isValidQuranPage(e)) throw new Error("Invalid page");
    let i = c(t, l);
    return await a(`/recitations/${r}/by_page/${e}`, i, t == null ? void 0 : t.fetchFn);
  },
  ne = async (e, r, t) => {
    if (!o.isValidRub(e)) throw new Error("Invalid rub");
    let i = c(t, l);
    return await a(`/recitations/${r}/by_rub/${e}`, i, t == null ? void 0 : t.fetchFn);
  },
  ce = async (e, r, t) => {
    if (!o.isValidHizb(e)) throw new Error("Invalid hizb");
    let i = c(t, l);
    return await a(`/recitations/${r}/by_hizb/${e}`, i, t == null ? void 0 : t.fetchFn);
  },
  oe = async (e, r, t) => {
    if (!o.isValidVerseKey(e)) throw new Error("Invalid verse key");
    let i = c(t, l);
    return await a(`/recitations/${r}/by_ayah/${e}`, i, t == null ? void 0 : t.fetchFn);
  },
  fe = {
    findAllChapterRecitations: re,
    findChapterRecitationById: te,
    findVerseRecitationsByChapter: se,
    findVerseRecitationsByJuz: ie,
    findVerseRecitationsByPage: ae,
    findVerseRecitationsByRub: ne,
    findVerseRecitationsByHizb: ce,
    findVerseRecitationsByKey: oe
  },
  w = fe;
var u = {
    language: "ar"
  },
  me = async e => {
    let r = c(e),
      {
        recitations: t
      } = await a("/resources/recitations", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  de = async e => {
    let r = c(e, u),
      {
        translations: t
      } = await a("/resources/translations", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  le = async e => {
    let r = c(e, u),
      {
        tafsirs: t
      } = await a("/resources/tafsirs", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  ue = async e => {
    let {
      recitationStyles: r
    } = await a("/resources/recitation_styles", void 0, e == null ? void 0 : e.fetchFn);
    return r;
  },
  pe = async e => {
    let r = c(e, u),
      {
        languages: t
      } = await a("/resources/languages", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  he = async e => {
    let r = c(e, u),
      {
        chapterInfos: t
      } = await a("/resources/chapter_infos", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  Re = async e => {
    let r = c(e, u),
      {
        verseMedia: t
      } = await a("/resources/verse_media", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  Ae = async e => {
    let r = c(e, u),
      {
        reciters: t
      } = await a("/resources/chapter_reciters", r, e == null ? void 0 : e.fetchFn);
    return t;
  },
  Ie = {
    findAllRecitations: me,
    findAllTranslations: de,
    findAllTafsirs: le,
    findAllRecitationStyles: ue,
    findAllLanguages: pe,
    findVerseMedia: Re,
    findAllChapterReciters: Ae,
    findAllChapterInfos: he
  },
  x = Ie;
var be = {
    language: "ar",
    size: 30
  },
  ye = async (e, r) => {
    let t = c({
        q: e,
        ...r
      }, be),
      {
        search: i
      } = await a("/search", t, r == null ? void 0 : r.fetchFn);
    return i;
  },
  Oe = {
    search: ye
  },
  F = Oe;
var Ve = {
    chapters: b,
    verses: O,
    juzs: V,
    audio: w,
    resources: x,
    search: F
  },
  v = Ve;
var Ne = {
    v4: v,
    utils: o
  },
  we = exports.quran = Ne;

},{"humps":4}],2:[function(require,module,exports){
const { quran, Language } = require('@quranjs/api/dist/index.js');

window.QuranJS = {
	"version": "v4",
	"Search": quran.v4.search, 
	"Verses": quran.v4.verses,
	"Chapters": quran.v4.chapters,
	"Juzs": quran.v4.juzs,
	"Audio": quran.v4.audio,
	"Language": Language
};
},{"@quranjs/api/dist/index.js":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var humps = require('humps');

var C=(f=>(f.Word="word",f.End="end",f.Pause="pause",f.Sajdah="sajdah",f.RubElHizb="rub-el-hizb",f))(C||{});var m=(s=>(s.ARABIC="ar",s.ENGLISH="en",s.URDU="ur",s.BENGALI="bn",s.TURKISH="tr",s.SPANISH="es",s.GERMAN="de",s.BOSNIAN="bs",s.RUSSIAN="ru",s.ALBANIAN_AL="al",s.FRENCH="fr",s.DUTCH="nl",s.TAMIL="ta",s.TAJIK="tg",s.INDONESIAN="id",s.UZBEK="uz",s.VIETNAMESE="vi",s.CHINESE="zh",s.ITALIAN="it",s.JAPANESE="ja",s.MALAYALAM="ml",s.AMHARIC="am",s.KAZAKH="kk",s.PORTUGUESE="pt",s.TAGALOG="tl",s.THAI="th",s.KOREAN="ko",s.HINDI="hi",s.KURDISH="ku",s.HAUSA="ha",s.AZERI="az",s.SWAHILI="sw",s.PERSIAN="fa",s.SERBIAN="sr",s.MARANAO="mrn",s.AMAZIGH="zgh",s.ASSAMESE="as",s.BULGARIAN="bg",s.CHECHEN="ce",s.CZECH="cs",s.DIVEHI="dv",s.DHIVEHI="dv",s.MALDIVIAN="dv",s.FINNISH="fi",s.GUJAARATI="gu",s.HEBREW="he",s.GEORGIAN="ka",s.CENTRAL_KHMER="km",s.GANDA="lg",s.MARATHI="mr",s.YORUBA="yo",s.MALAY="ms",s.NEPALI="ne",s.SWEDISH="sv",s.TELUGU="te",s.TATAR="tt",s.UIGHUR="ug",s.UYGHUR="ug",s.UKRAINIAN="uk",s.NORWEGIAN="no",s.OROMO="om",s.POLISH="pl",s.PASHTO="ps",s.ROMANIAN="ro",s.SINDHI="sd",s.NORTHERN_SAMI="se",s.SINHALA="si",s.SINHALESE="si",s.SOMALI="so",s.ALBANIAN_SQ="sq",s))(m||{}),S=(i=>(i.MadaniV1="code_v1",i.MadaniV2="code_v2",i.Uthmani="text_uthmani",i))(S||{});var h=e=>e.startsWith("/")?e.slice(1):e;var z="https://api.quran.com/api/v4/",A=(e,r)=>{let t=`${z}${h(e)}`;if(!r)return t;let i=humps.decamelizeKeys(r),n=new URLSearchParams(Object.entries(i).filter(([,f])=>f!==void 0)).toString();return n?`${t}?${n}`:t},a=async(e,r={},t)=>{if(t){let f=await t(A(e,r));return humps.camelizeKeys(f)}if(typeof globalThis.fetch!="function")throw new Error("Looks like there is no global fetch function. Take a look at https://quranjs.com/techniques#custom-fetcher for more info.");let i=await globalThis.fetch(A(e,r));if(!i.ok||i.status>=400)throw new Error(`${i.status} ${i.statusText}`);let n=await i.json();return humps.camelizeKeys(n)},c=(e={},r={})=>{let t={...e};t.fetchFn&&(t.fetchFn=void 0);let i={...r,...t};if(i.fields){let n=[];Object.entries(i.fields).forEach(([f,E])=>{E&&n.push(humps.decamelize(f));}),i.fields=n.join(",");}return i};var H={1:7,2:286,3:200,4:176,5:120,6:165,7:206,8:75,9:129,10:109,11:123,12:111,13:43,14:52,15:99,16:128,17:111,18:110,19:98,20:135,21:112,22:78,23:118,24:64,25:77,26:227,27:93,28:88,29:69,30:60,31:34,32:30,33:73,34:54,35:45,36:83,37:182,38:88,39:75,40:85,41:54,42:53,43:89,44:59,45:37,46:35,47:38,48:29,49:18,50:45,51:60,52:49,53:62,54:55,55:78,56:96,57:29,58:22,59:24,60:13,61:14,62:11,63:11,64:18,65:12,66:12,67:30,68:52,69:52,70:44,71:28,72:28,73:20,74:56,75:40,76:31,77:50,78:40,79:46,80:42,81:29,82:19,83:36,84:25,85:22,86:17,87:19,88:26,89:30,90:20,91:15,92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,101:11,102:8,103:3,104:9,105:5,106:4,107:7,108:3,109:6,110:3,111:5,112:4,113:5,114:6},I=e=>{let r=typeof e=="number"?e:Number(e);return !(!r||r<=0||r>114)},P=e=>{let r=typeof e=="number"?e:Number(e);return !(!r||r<=0||r>30)},T=e=>{let r=typeof e=="number"?e:Number(e);return !(!r||r<=0||r>240)},U=e=>{let r=typeof e=="number"?e:Number(e);return !(!r||r<=0||r>60)},K=e=>{let r=typeof e=="number"?e:Number(e);return !(!r||r<=0||r>604)},$=e=>{let[r,t]=e.trim().split(":");if(!r||!t||!I(r))return !1;let i=Number(t),n=H[r];return !(!i||i<=0||i>n)},j={isValidChapterId:I,isValidJuz:P,isValidRub:T,isValidHizb:U,isValidQuranPage:K,isValidVerseKey:$},o=j;var p={language:"ar"},M=async e=>{let r=c(e,p),{chapters:t}=await a("/chapters",r,e==null?void 0:e.fetchFn);return t},_=async(e,r)=>{if(!o.isValidChapterId(e))throw new Error("Invalid chapter id");let t=c(r,p),{chapter:i}=await a(`/chapters/${e}`,t,r==null?void 0:r.fetchFn);return i},k=async(e,r)=>{if(!o.isValidChapterId(e))throw new Error("Invalid chapter id");let t=c(r,p),{chapterInfo:i}=await a(`/chapters/${e}/info`,t,r==null?void 0:r.fetchFn);return i},J={findAll:M,findById:_,findInfoById:k},b=J;var D={language:"ar",perPage:50,words:!1},d=(e={})=>{let r=c(e,D);if(r.translations&&(r.translations=r.translations.join(",")),r.tafsirs&&(r.tafsirs=r.tafsirs.join(",")),r.wordFields){let t=[];Object.entries(r.wordFields).forEach(([i,n])=>{n&&t.push(humps.decamelize(i));}),r.wordFields=t.join(",");}if(r.translationFields){let t=[];Object.entries(r.translationFields).forEach(([i,n])=>{n&&t.push(humps.decamelize(i));}),r.translationFields=t.join(",");}return r.reciter&&(r.audio=r.reciter,r.reciter=void 0),r},W=async(e,r)=>{if(!o.isValidVerseKey(e))throw new Error("Invalid verse key");let t=d(r),i=`/verses/by_key/${e}`,{verse:n}=await a(i,t,r==null?void 0:r.fetchFn);return n},g=async(e,r)=>{if(!o.isValidChapterId(e))throw new Error("Invalid chapter id");let t=d(r),i=`/verses/by_chapter/${e}`,{verses:n}=await a(i,t,r==null?void 0:r.fetchFn);return n},q=async(e,r)=>{if(!o.isValidQuranPage(e))throw new Error("Invalid page");let t=d(r),i=`/verses/by_page/${e}`,{verses:n}=await a(i,t,r==null?void 0:r.fetchFn);return n},Z=async(e,r)=>{if(!o.isValidJuz(e))throw new Error("Invalid juz");let t=d(r),i=`/verses/by_juz/${e}`,{verses:n}=await a(i,t,r==null?void 0:r.fetchFn);return n},Y=async(e,r)=>{if(!o.isValidHizb(e))throw new Error("Invalid hizb");let t=d(r),i=`/verses/by_hizb/${e}`,{verses:n}=await a(i,t,r==null?void 0:r.fetchFn);return n},Q=async e=>{let r=d(e),{verse:t}=await a("/verses/random",r,e==null?void 0:e.fetchFn);return t},X={findByKey:W,findByChapter:g,findByPage:q,findByJuz:Z,findByHizb:Y,findRandom:Q},O=X;var L=async e=>{let{juzs:r}=await a("/juzs",void 0,e==null?void 0:e.fetchFn);return r},ee={findAll:L},V=ee;var N={language:"ar"},l={language:"ar"},re=async(e,r)=>{let t=c(r,N),{audioFiles:i}=await a(`/chapter_recitations/${e}`,t,r==null?void 0:r.fetchFn);return i},te=async(e,r,t)=>{if(!o.isValidChapterId(e))throw new Error("Invalid chapter id");let i=c(t,N),{audioFile:n}=await a(`/chapter_recitations/${r}/${e}`,i,t==null?void 0:t.fetchFn);return n},se=async(e,r,t)=>{if(!o.isValidChapterId(e))throw new Error("Invalid chapter id");let i=c(t,l);return await a(`/recitations/${r}/by_chapter/${e}`,i,t==null?void 0:t.fetchFn)},ie=async(e,r,t)=>{if(!o.isValidJuz(e))throw new Error("Invalid juz");let i=c(t,l);return await a(`/recitations/${r}/by_juz/${e}`,i,t==null?void 0:t.fetchFn)},ae=async(e,r,t)=>{if(!o.isValidQuranPage(e))throw new Error("Invalid page");let i=c(t,l);return await a(`/recitations/${r}/by_page/${e}`,i,t==null?void 0:t.fetchFn)},ne=async(e,r,t)=>{if(!o.isValidRub(e))throw new Error("Invalid rub");let i=c(t,l);return await a(`/recitations/${r}/by_rub/${e}`,i,t==null?void 0:t.fetchFn)},ce=async(e,r,t)=>{if(!o.isValidHizb(e))throw new Error("Invalid hizb");let i=c(t,l);return await a(`/recitations/${r}/by_hizb/${e}`,i,t==null?void 0:t.fetchFn)},oe=async(e,r,t)=>{if(!o.isValidVerseKey(e))throw new Error("Invalid verse key");let i=c(t,l);return await a(`/recitations/${r}/by_ayah/${e}`,i,t==null?void 0:t.fetchFn)},fe={findAllChapterRecitations:re,findChapterRecitationById:te,findVerseRecitationsByChapter:se,findVerseRecitationsByJuz:ie,findVerseRecitationsByPage:ae,findVerseRecitationsByRub:ne,findVerseRecitationsByHizb:ce,findVerseRecitationsByKey:oe},w=fe;var u={language:"ar"},me=async e=>{let r=c(e),{recitations:t}=await a("/resources/recitations",r,e==null?void 0:e.fetchFn);return t},de=async e=>{let r=c(e,u),{translations:t}=await a("/resources/translations",r,e==null?void 0:e.fetchFn);return t},le=async e=>{let r=c(e,u),{tafsirs:t}=await a("/resources/tafsirs",r,e==null?void 0:e.fetchFn);return t},ue=async e=>{let{recitationStyles:r}=await a("/resources/recitation_styles",void 0,e==null?void 0:e.fetchFn);return r},pe=async e=>{let r=c(e,u),{languages:t}=await a("/resources/languages",r,e==null?void 0:e.fetchFn);return t},he=async e=>{let r=c(e,u),{chapterInfos:t}=await a("/resources/chapter_infos",r,e==null?void 0:e.fetchFn);return t},Re=async e=>{let r=c(e,u),{verseMedia:t}=await a("/resources/verse_media",r,e==null?void 0:e.fetchFn);return t},Ae=async e=>{let r=c(e,u),{reciters:t}=await a("/resources/chapter_reciters",r,e==null?void 0:e.fetchFn);return t},Ie={findAllRecitations:me,findAllTranslations:de,findAllTafsirs:le,findAllRecitationStyles:ue,findAllLanguages:pe,findVerseMedia:Re,findAllChapterReciters:Ae,findAllChapterInfos:he},x=Ie;var be={language:"ar",size:30},ye=async(e,r)=>{let t=c({q:e,...r},be),{search:i}=await a("/search",t,r==null?void 0:r.fetchFn);return i},Oe={search:ye},F=Oe;var Ve={chapters:b,verses:O,juzs:V,audio:w,resources:x,search:F},v=Ve;var Ne={v4:v,utils:o},we=Ne;

exports.CharType = C;
exports.Language = m;
exports.QuranFont = S;
exports.quran = we;

},{"humps":4}],4:[function(require,module,exports){
// =========
// = humps =
// =========
// Underscore-to-camelCase converter (and vice versa)
// for strings and object keys

// humps is copyright © 2012+ Dom Christie
// Released under the MIT license.


;(function(global) {

  var _processKeys = function(convert, obj, options) {
    if(!_isObject(obj) || _isDate(obj) || _isRegExp(obj) || _isBoolean(obj) || _isFunction(obj)) {
      return obj;
    }

    var output,
        i = 0,
        l = 0;

    if(_isArray(obj)) {
      output = [];
      for(l=obj.length; i<l; i++) {
        output.push(_processKeys(convert, obj[i], options));
      }
    }
    else {
      output = {};
      for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
          output[convert(key, options)] = _processKeys(convert, obj[key], options);
        }
      }
    }
    return output;
  };

  // String conversion methods

  var separateWords = function(string, options) {
    options = options || {};
    var separator = options.separator || '_';
    var split = options.split || /(?=[A-Z])/;

    return string.split(split).join(separator);
  };

  var camelize = function(string) {
    if (_isNumerical(string)) {
      return string;
    }
    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return string.substr(0, 1).toLowerCase() + string.substr(1);
  };

  var pascalize = function(string) {
    var camelized = camelize(string);
    // Ensure 1st char is always uppercase
    return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
  };

  var decamelize = function(string, options) {
    return separateWords(string, options).toLowerCase();
  };

  // Utilities
  // Taken from Underscore.js

  var toString = Object.prototype.toString;

  var _isFunction = function(obj) {
    return typeof(obj) === 'function';
  };
  var _isObject = function(obj) {
    return obj === Object(obj);
  };
  var _isArray = function(obj) {
    return toString.call(obj) == '[object Array]';
  };
  var _isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };
  var _isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };
  var _isBoolean = function(obj) {
    return toString.call(obj) == '[object Boolean]';
  };

  // Performant way to determine if obj coerces to a number
  var _isNumerical = function(obj) {
    obj = obj - 0;
    return obj === obj;
  };

  // Sets up function which handles processing keys
  // allowing the convert function to be modified by a callback
  var _processor = function(convert, options) {
    var callback = options && 'process' in options ? options.process : options;

    if(typeof(callback) !== 'function') {
      return convert;
    }

    return function(string, options) {
      return callback(string, convert, options);
    }
  };

  var humps = {
    camelize: camelize,
    decamelize: decamelize,
    pascalize: pascalize,
    depascalize: decamelize,
    camelizeKeys: function(object, options) {
      return _processKeys(_processor(camelize, options), object);
    },
    decamelizeKeys: function(object, options) {
      return _processKeys(_processor(decamelize, options), object, options);
    },
    pascalizeKeys: function(object, options) {
      return _processKeys(_processor(pascalize, options), object);
    },
    depascalizeKeys: function () {
      return this.decamelizeKeys.apply(this, arguments);
    }
  };

  if (typeof define === 'function' && define.amd) {
    define(humps);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = humps;
  } else {
    global.humps = humps;
  }

})(this);

},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1RhYmlzaCBBbGkgQW5zYXJpL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkBxdXJhbmpzL3NyYy90eXBlcy9hcGkvV29yZC50cyIsInFpbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9AcXVyYW5qcy9hcGkvZGlzdC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9odW1wcy9odW1wcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0lPLElBQUEsTUFBQSxHQUFBLE9BQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSlA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFZlcnNlS2V5IH0gZnJvbSAnLi4vVmVyc2VLZXknO1xuaW1wb3J0IHsgVHJhbnNsYXRpb24gfSBmcm9tICcuL1RyYW5zbGF0aW9uJztcbmltcG9ydCB7IFRyYW5zbGl0ZXJhdGlvbiB9IGZyb20gJy4vVHJhbnNsaXRlcmF0aW9uJztcblxuZXhwb3J0IGVudW0gQ2hhclR5cGUge1xuICBXb3JkID0gJ3dvcmQnLFxuICBFbmQgPSAnZW5kJyxcbiAgUGF1c2UgPSAncGF1c2UnLFxuICBTYWpkYWggPSAnc2FqZGFoJyxcbiAgUnViRWxIaXpiID0gJ3J1Yi1lbC1oaXpiJyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JkIHtcbiAgaWQ/OiBudW1iZXI7XG4gIHBvc2l0aW9uOiBudW1iZXI7XG4gIGF1ZGlvVXJsOiBzdHJpbmc7XG4gIGNoYXJUeXBlTmFtZTogQ2hhclR5cGU7XG4gIGNvZGVWMT86IHN0cmluZztcbiAgY29kZVYyPzogc3RyaW5nO1xuICBwYWdlTnVtYmVyPzogbnVtYmVyO1xuICBsaW5lTnVtYmVyPzogbnVtYmVyO1xuICB0ZXh0Pzogc3RyaW5nO1xuICB0ZXh0VXRobWFuaT86IHN0cmluZztcbiAgdGV4dEluZG9wYWs/OiBzdHJpbmc7XG4gIHRleHRJbWxhZWk/OiBzdHJpbmc7XG4gIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvbjtcbiAgdHJhbnNsaXRlcmF0aW9uOiBUcmFuc2xpdGVyYXRpb247XG4gIGxvY2F0aW9uPzogc3RyaW5nOyAvLyBjaGFwdGVyOnZlcnNlOndvcmRcbiAgdmVyc2VLZXk/OiBWZXJzZUtleTtcbn1cbiIsImNvbnN0IHsgcXVyYW4sIExhbmd1YWdlIH0gPSByZXF1aXJlKCdAcXVyYW5qcy9hcGkvZGlzdC9pbmRleC5qcycpO1xyXG5cclxud2luZG93LlF1cmFuSlMgPSB7XHJcblx0XCJ2ZXJzaW9uXCI6IFwidjRcIixcclxuXHRcIlNlYXJjaFwiOiBxdXJhbi52NC5zZWFyY2gsIFxyXG5cdFwiVmVyc2VzXCI6IHF1cmFuLnY0LnZlcnNlcyxcclxuXHRcIkNoYXB0ZXJzXCI6IHF1cmFuLnY0LmNoYXB0ZXJzLFxyXG5cdFwiSnV6c1wiOiBxdXJhbi52NC5qdXpzLFxyXG5cdFwiQXVkaW9cIjogcXVyYW4udjQuYXVkaW8sXHJcblx0XCJMYW5ndWFnZVwiOiBMYW5ndWFnZVxyXG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxudmFyIGh1bXBzID0gcmVxdWlyZSgnaHVtcHMnKTtcblxudmFyIEM9KGY9PihmLldvcmQ9XCJ3b3JkXCIsZi5FbmQ9XCJlbmRcIixmLlBhdXNlPVwicGF1c2VcIixmLlNhamRhaD1cInNhamRhaFwiLGYuUnViRWxIaXpiPVwicnViLWVsLWhpemJcIixmKSkoQ3x8e30pO3ZhciBtPShzPT4ocy5BUkFCSUM9XCJhclwiLHMuRU5HTElTSD1cImVuXCIscy5VUkRVPVwidXJcIixzLkJFTkdBTEk9XCJiblwiLHMuVFVSS0lTSD1cInRyXCIscy5TUEFOSVNIPVwiZXNcIixzLkdFUk1BTj1cImRlXCIscy5CT1NOSUFOPVwiYnNcIixzLlJVU1NJQU49XCJydVwiLHMuQUxCQU5JQU5fQUw9XCJhbFwiLHMuRlJFTkNIPVwiZnJcIixzLkRVVENIPVwibmxcIixzLlRBTUlMPVwidGFcIixzLlRBSklLPVwidGdcIixzLklORE9ORVNJQU49XCJpZFwiLHMuVVpCRUs9XCJ1elwiLHMuVklFVE5BTUVTRT1cInZpXCIscy5DSElORVNFPVwiemhcIixzLklUQUxJQU49XCJpdFwiLHMuSkFQQU5FU0U9XCJqYVwiLHMuTUFMQVlBTEFNPVwibWxcIixzLkFNSEFSSUM9XCJhbVwiLHMuS0FaQUtIPVwia2tcIixzLlBPUlRVR1VFU0U9XCJwdFwiLHMuVEFHQUxPRz1cInRsXCIscy5USEFJPVwidGhcIixzLktPUkVBTj1cImtvXCIscy5ISU5EST1cImhpXCIscy5LVVJESVNIPVwia3VcIixzLkhBVVNBPVwiaGFcIixzLkFaRVJJPVwiYXpcIixzLlNXQUhJTEk9XCJzd1wiLHMuUEVSU0lBTj1cImZhXCIscy5TRVJCSUFOPVwic3JcIixzLk1BUkFOQU89XCJtcm5cIixzLkFNQVpJR0g9XCJ6Z2hcIixzLkFTU0FNRVNFPVwiYXNcIixzLkJVTEdBUklBTj1cImJnXCIscy5DSEVDSEVOPVwiY2VcIixzLkNaRUNIPVwiY3NcIixzLkRJVkVIST1cImR2XCIscy5ESElWRUhJPVwiZHZcIixzLk1BTERJVklBTj1cImR2XCIscy5GSU5OSVNIPVwiZmlcIixzLkdVSkFBUkFUST1cImd1XCIscy5IRUJSRVc9XCJoZVwiLHMuR0VPUkdJQU49XCJrYVwiLHMuQ0VOVFJBTF9LSE1FUj1cImttXCIscy5HQU5EQT1cImxnXCIscy5NQVJBVEhJPVwibXJcIixzLllPUlVCQT1cInlvXCIscy5NQUxBWT1cIm1zXCIscy5ORVBBTEk9XCJuZVwiLHMuU1dFRElTSD1cInN2XCIscy5URUxVR1U9XCJ0ZVwiLHMuVEFUQVI9XCJ0dFwiLHMuVUlHSFVSPVwidWdcIixzLlVZR0hVUj1cInVnXCIscy5VS1JBSU5JQU49XCJ1a1wiLHMuTk9SV0VHSUFOPVwibm9cIixzLk9ST01PPVwib21cIixzLlBPTElTSD1cInBsXCIscy5QQVNIVE89XCJwc1wiLHMuUk9NQU5JQU49XCJyb1wiLHMuU0lOREhJPVwic2RcIixzLk5PUlRIRVJOX1NBTUk9XCJzZVwiLHMuU0lOSEFMQT1cInNpXCIscy5TSU5IQUxFU0U9XCJzaVwiLHMuU09NQUxJPVwic29cIixzLkFMQkFOSUFOX1NRPVwic3FcIixzKSkobXx8e30pLFM9KGk9PihpLk1hZGFuaVYxPVwiY29kZV92MVwiLGkuTWFkYW5pVjI9XCJjb2RlX3YyXCIsaS5VdGhtYW5pPVwidGV4dF91dGhtYW5pXCIsaSkpKFN8fHt9KTt2YXIgaD1lPT5lLnN0YXJ0c1dpdGgoXCIvXCIpP2Uuc2xpY2UoMSk6ZTt2YXIgej1cImh0dHBzOi8vYXBpLnF1cmFuLmNvbS9hcGkvdjQvXCIsQT0oZSxyKT0+e2xldCB0PWAke3p9JHtoKGUpfWA7aWYoIXIpcmV0dXJuIHQ7bGV0IGk9aHVtcHMuZGVjYW1lbGl6ZUtleXMociksbj1uZXcgVVJMU2VhcmNoUGFyYW1zKE9iamVjdC5lbnRyaWVzKGkpLmZpbHRlcigoWyxmXSk9PmYhPT12b2lkIDApKS50b1N0cmluZygpO3JldHVybiBuP2Ake3R9PyR7bn1gOnR9LGE9YXN5bmMoZSxyPXt9LHQpPT57aWYodCl7bGV0IGY9YXdhaXQgdChBKGUscikpO3JldHVybiBodW1wcy5jYW1lbGl6ZUtleXMoZil9aWYodHlwZW9mIGdsb2JhbFRoaXMuZmV0Y2ghPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgRXJyb3IoXCJMb29rcyBsaWtlIHRoZXJlIGlzIG5vIGdsb2JhbCBmZXRjaCBmdW5jdGlvbi4gVGFrZSBhIGxvb2sgYXQgaHR0cHM6Ly9xdXJhbmpzLmNvbS90ZWNobmlxdWVzI2N1c3RvbS1mZXRjaGVyIGZvciBtb3JlIGluZm8uXCIpO2xldCBpPWF3YWl0IGdsb2JhbFRoaXMuZmV0Y2goQShlLHIpKTtpZighaS5va3x8aS5zdGF0dXM+PTQwMCl0aHJvdyBuZXcgRXJyb3IoYCR7aS5zdGF0dXN9ICR7aS5zdGF0dXNUZXh0fWApO2xldCBuPWF3YWl0IGkuanNvbigpO3JldHVybiBodW1wcy5jYW1lbGl6ZUtleXMobil9LGM9KGU9e30scj17fSk9PntsZXQgdD17Li4uZX07dC5mZXRjaEZuJiYodC5mZXRjaEZuPXZvaWQgMCk7bGV0IGk9ey4uLnIsLi4udH07aWYoaS5maWVsZHMpe2xldCBuPVtdO09iamVjdC5lbnRyaWVzKGkuZmllbGRzKS5mb3JFYWNoKChbZixFXSk9PntFJiZuLnB1c2goaHVtcHMuZGVjYW1lbGl6ZShmKSk7fSksaS5maWVsZHM9bi5qb2luKFwiLFwiKTt9cmV0dXJuIGl9O3ZhciBIPXsxOjcsMjoyODYsMzoyMDAsNDoxNzYsNToxMjAsNjoxNjUsNzoyMDYsODo3NSw5OjEyOSwxMDoxMDksMTE6MTIzLDEyOjExMSwxMzo0MywxNDo1MiwxNTo5OSwxNjoxMjgsMTc6MTExLDE4OjExMCwxOTo5OCwyMDoxMzUsMjE6MTEyLDIyOjc4LDIzOjExOCwyNDo2NCwyNTo3NywyNjoyMjcsMjc6OTMsMjg6ODgsMjk6NjksMzA6NjAsMzE6MzQsMzI6MzAsMzM6NzMsMzQ6NTQsMzU6NDUsMzY6ODMsMzc6MTgyLDM4Ojg4LDM5Ojc1LDQwOjg1LDQxOjU0LDQyOjUzLDQzOjg5LDQ0OjU5LDQ1OjM3LDQ2OjM1LDQ3OjM4LDQ4OjI5LDQ5OjE4LDUwOjQ1LDUxOjYwLDUyOjQ5LDUzOjYyLDU0OjU1LDU1Ojc4LDU2Ojk2LDU3OjI5LDU4OjIyLDU5OjI0LDYwOjEzLDYxOjE0LDYyOjExLDYzOjExLDY0OjE4LDY1OjEyLDY2OjEyLDY3OjMwLDY4OjUyLDY5OjUyLDcwOjQ0LDcxOjI4LDcyOjI4LDczOjIwLDc0OjU2LDc1OjQwLDc2OjMxLDc3OjUwLDc4OjQwLDc5OjQ2LDgwOjQyLDgxOjI5LDgyOjE5LDgzOjM2LDg0OjI1LDg1OjIyLDg2OjE3LDg3OjE5LDg4OjI2LDg5OjMwLDkwOjIwLDkxOjE1LDkyOjIxLDkzOjExLDk0OjgsOTU6OCw5NjoxOSw5Nzo1LDk4OjgsOTk6OCwxMDA6MTEsMTAxOjExLDEwMjo4LDEwMzozLDEwNDo5LDEwNTo1LDEwNjo0LDEwNzo3LDEwODozLDEwOTo2LDExMDozLDExMTo1LDExMjo0LDExMzo1LDExNDo2fSxJPWU9PntsZXQgcj10eXBlb2YgZT09XCJudW1iZXJcIj9lOk51bWJlcihlKTtyZXR1cm4gISghcnx8cjw9MHx8cj4xMTQpfSxQPWU9PntsZXQgcj10eXBlb2YgZT09XCJudW1iZXJcIj9lOk51bWJlcihlKTtyZXR1cm4gISghcnx8cjw9MHx8cj4zMCl9LFQ9ZT0+e2xldCByPXR5cGVvZiBlPT1cIm51bWJlclwiP2U6TnVtYmVyKGUpO3JldHVybiAhKCFyfHxyPD0wfHxyPjI0MCl9LFU9ZT0+e2xldCByPXR5cGVvZiBlPT1cIm51bWJlclwiP2U6TnVtYmVyKGUpO3JldHVybiAhKCFyfHxyPD0wfHxyPjYwKX0sSz1lPT57bGV0IHI9dHlwZW9mIGU9PVwibnVtYmVyXCI/ZTpOdW1iZXIoZSk7cmV0dXJuICEoIXJ8fHI8PTB8fHI+NjA0KX0sJD1lPT57bGV0W3IsdF09ZS50cmltKCkuc3BsaXQoXCI6XCIpO2lmKCFyfHwhdHx8IUkocikpcmV0dXJuICExO2xldCBpPU51bWJlcih0KSxuPUhbcl07cmV0dXJuICEoIWl8fGk8PTB8fGk+bil9LGo9e2lzVmFsaWRDaGFwdGVySWQ6SSxpc1ZhbGlkSnV6OlAsaXNWYWxpZFJ1YjpULGlzVmFsaWRIaXpiOlUsaXNWYWxpZFF1cmFuUGFnZTpLLGlzVmFsaWRWZXJzZUtleTokfSxvPWo7dmFyIHA9e2xhbmd1YWdlOlwiYXJcIn0sTT1hc3luYyBlPT57bGV0IHI9YyhlLHApLHtjaGFwdGVyczp0fT1hd2FpdCBhKFwiL2NoYXB0ZXJzXCIscixlPT1udWxsP3ZvaWQgMDplLmZldGNoRm4pO3JldHVybiB0fSxfPWFzeW5jKGUscik9PntpZighby5pc1ZhbGlkQ2hhcHRlcklkKGUpKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY2hhcHRlciBpZFwiKTtsZXQgdD1jKHIscCkse2NoYXB0ZXI6aX09YXdhaXQgYShgL2NoYXB0ZXJzLyR7ZX1gLHQscj09bnVsbD92b2lkIDA6ci5mZXRjaEZuKTtyZXR1cm4gaX0saz1hc3luYyhlLHIpPT57aWYoIW8uaXNWYWxpZENoYXB0ZXJJZChlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNoYXB0ZXIgaWRcIik7bGV0IHQ9YyhyLHApLHtjaGFwdGVySW5mbzppfT1hd2FpdCBhKGAvY2hhcHRlcnMvJHtlfS9pbmZvYCx0LHI9PW51bGw/dm9pZCAwOnIuZmV0Y2hGbik7cmV0dXJuIGl9LEo9e2ZpbmRBbGw6TSxmaW5kQnlJZDpfLGZpbmRJbmZvQnlJZDprfSxiPUo7dmFyIEQ9e2xhbmd1YWdlOlwiYXJcIixwZXJQYWdlOjUwLHdvcmRzOiExfSxkPShlPXt9KT0+e2xldCByPWMoZSxEKTtpZihyLnRyYW5zbGF0aW9ucyYmKHIudHJhbnNsYXRpb25zPXIudHJhbnNsYXRpb25zLmpvaW4oXCIsXCIpKSxyLnRhZnNpcnMmJihyLnRhZnNpcnM9ci50YWZzaXJzLmpvaW4oXCIsXCIpKSxyLndvcmRGaWVsZHMpe2xldCB0PVtdO09iamVjdC5lbnRyaWVzKHIud29yZEZpZWxkcykuZm9yRWFjaCgoW2ksbl0pPT57biYmdC5wdXNoKGh1bXBzLmRlY2FtZWxpemUoaSkpO30pLHIud29yZEZpZWxkcz10LmpvaW4oXCIsXCIpO31pZihyLnRyYW5zbGF0aW9uRmllbGRzKXtsZXQgdD1bXTtPYmplY3QuZW50cmllcyhyLnRyYW5zbGF0aW9uRmllbGRzKS5mb3JFYWNoKChbaSxuXSk9PntuJiZ0LnB1c2goaHVtcHMuZGVjYW1lbGl6ZShpKSk7fSksci50cmFuc2xhdGlvbkZpZWxkcz10LmpvaW4oXCIsXCIpO31yZXR1cm4gci5yZWNpdGVyJiYoci5hdWRpbz1yLnJlY2l0ZXIsci5yZWNpdGVyPXZvaWQgMCkscn0sVz1hc3luYyhlLHIpPT57aWYoIW8uaXNWYWxpZFZlcnNlS2V5KGUpKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmVyc2Uga2V5XCIpO2xldCB0PWQociksaT1gL3ZlcnNlcy9ieV9rZXkvJHtlfWAse3ZlcnNlOm59PWF3YWl0IGEoaSx0LHI9PW51bGw/dm9pZCAwOnIuZmV0Y2hGbik7cmV0dXJuIG59LGc9YXN5bmMoZSxyKT0+e2lmKCFvLmlzVmFsaWRDaGFwdGVySWQoZSkpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBjaGFwdGVyIGlkXCIpO2xldCB0PWQociksaT1gL3ZlcnNlcy9ieV9jaGFwdGVyLyR7ZX1gLHt2ZXJzZXM6bn09YXdhaXQgYShpLHQscj09bnVsbD92b2lkIDA6ci5mZXRjaEZuKTtyZXR1cm4gbn0scT1hc3luYyhlLHIpPT57aWYoIW8uaXNWYWxpZFF1cmFuUGFnZShlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhZ2VcIik7bGV0IHQ9ZChyKSxpPWAvdmVyc2VzL2J5X3BhZ2UvJHtlfWAse3ZlcnNlczpufT1hd2FpdCBhKGksdCxyPT1udWxsP3ZvaWQgMDpyLmZldGNoRm4pO3JldHVybiBufSxaPWFzeW5jKGUscik9PntpZighby5pc1ZhbGlkSnV6KGUpKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQganV6XCIpO2xldCB0PWQociksaT1gL3ZlcnNlcy9ieV9qdXovJHtlfWAse3ZlcnNlczpufT1hd2FpdCBhKGksdCxyPT1udWxsP3ZvaWQgMDpyLmZldGNoRm4pO3JldHVybiBufSxZPWFzeW5jKGUscik9PntpZighby5pc1ZhbGlkSGl6YihlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGhpemJcIik7bGV0IHQ9ZChyKSxpPWAvdmVyc2VzL2J5X2hpemIvJHtlfWAse3ZlcnNlczpufT1hd2FpdCBhKGksdCxyPT1udWxsP3ZvaWQgMDpyLmZldGNoRm4pO3JldHVybiBufSxRPWFzeW5jIGU9PntsZXQgcj1kKGUpLHt2ZXJzZTp0fT1hd2FpdCBhKFwiL3ZlcnNlcy9yYW5kb21cIixyLGU9PW51bGw/dm9pZCAwOmUuZmV0Y2hGbik7cmV0dXJuIHR9LFg9e2ZpbmRCeUtleTpXLGZpbmRCeUNoYXB0ZXI6ZyxmaW5kQnlQYWdlOnEsZmluZEJ5SnV6OlosZmluZEJ5SGl6YjpZLGZpbmRSYW5kb206UX0sTz1YO3ZhciBMPWFzeW5jIGU9PntsZXR7anV6czpyfT1hd2FpdCBhKFwiL2p1enNcIix2b2lkIDAsZT09bnVsbD92b2lkIDA6ZS5mZXRjaEZuKTtyZXR1cm4gcn0sZWU9e2ZpbmRBbGw6TH0sVj1lZTt2YXIgTj17bGFuZ3VhZ2U6XCJhclwifSxsPXtsYW5ndWFnZTpcImFyXCJ9LHJlPWFzeW5jKGUscik9PntsZXQgdD1jKHIsTikse2F1ZGlvRmlsZXM6aX09YXdhaXQgYShgL2NoYXB0ZXJfcmVjaXRhdGlvbnMvJHtlfWAsdCxyPT1udWxsP3ZvaWQgMDpyLmZldGNoRm4pO3JldHVybiBpfSx0ZT1hc3luYyhlLHIsdCk9PntpZighby5pc1ZhbGlkQ2hhcHRlcklkKGUpKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY2hhcHRlciBpZFwiKTtsZXQgaT1jKHQsTikse2F1ZGlvRmlsZTpufT1hd2FpdCBhKGAvY2hhcHRlcl9yZWNpdGF0aW9ucy8ke3J9LyR7ZX1gLGksdD09bnVsbD92b2lkIDA6dC5mZXRjaEZuKTtyZXR1cm4gbn0sc2U9YXN5bmMoZSxyLHQpPT57aWYoIW8uaXNWYWxpZENoYXB0ZXJJZChlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNoYXB0ZXIgaWRcIik7bGV0IGk9Yyh0LGwpO3JldHVybiBhd2FpdCBhKGAvcmVjaXRhdGlvbnMvJHtyfS9ieV9jaGFwdGVyLyR7ZX1gLGksdD09bnVsbD92b2lkIDA6dC5mZXRjaEZuKX0saWU9YXN5bmMoZSxyLHQpPT57aWYoIW8uaXNWYWxpZEp1eihlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGp1elwiKTtsZXQgaT1jKHQsbCk7cmV0dXJuIGF3YWl0IGEoYC9yZWNpdGF0aW9ucy8ke3J9L2J5X2p1ei8ke2V9YCxpLHQ9PW51bGw/dm9pZCAwOnQuZmV0Y2hGbil9LGFlPWFzeW5jKGUscix0KT0+e2lmKCFvLmlzVmFsaWRRdXJhblBhZ2UoZSkpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYWdlXCIpO2xldCBpPWModCxsKTtyZXR1cm4gYXdhaXQgYShgL3JlY2l0YXRpb25zLyR7cn0vYnlfcGFnZS8ke2V9YCxpLHQ9PW51bGw/dm9pZCAwOnQuZmV0Y2hGbil9LG5lPWFzeW5jKGUscix0KT0+e2lmKCFvLmlzVmFsaWRSdWIoZSkpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBydWJcIik7bGV0IGk9Yyh0LGwpO3JldHVybiBhd2FpdCBhKGAvcmVjaXRhdGlvbnMvJHtyfS9ieV9ydWIvJHtlfWAsaSx0PT1udWxsP3ZvaWQgMDp0LmZldGNoRm4pfSxjZT1hc3luYyhlLHIsdCk9PntpZighby5pc1ZhbGlkSGl6YihlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGhpemJcIik7bGV0IGk9Yyh0LGwpO3JldHVybiBhd2FpdCBhKGAvcmVjaXRhdGlvbnMvJHtyfS9ieV9oaXpiLyR7ZX1gLGksdD09bnVsbD92b2lkIDA6dC5mZXRjaEZuKX0sb2U9YXN5bmMoZSxyLHQpPT57aWYoIW8uaXNWYWxpZFZlcnNlS2V5KGUpKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmVyc2Uga2V5XCIpO2xldCBpPWModCxsKTtyZXR1cm4gYXdhaXQgYShgL3JlY2l0YXRpb25zLyR7cn0vYnlfYXlhaC8ke2V9YCxpLHQ9PW51bGw/dm9pZCAwOnQuZmV0Y2hGbil9LGZlPXtmaW5kQWxsQ2hhcHRlclJlY2l0YXRpb25zOnJlLGZpbmRDaGFwdGVyUmVjaXRhdGlvbkJ5SWQ6dGUsZmluZFZlcnNlUmVjaXRhdGlvbnNCeUNoYXB0ZXI6c2UsZmluZFZlcnNlUmVjaXRhdGlvbnNCeUp1ejppZSxmaW5kVmVyc2VSZWNpdGF0aW9uc0J5UGFnZTphZSxmaW5kVmVyc2VSZWNpdGF0aW9uc0J5UnViOm5lLGZpbmRWZXJzZVJlY2l0YXRpb25zQnlIaXpiOmNlLGZpbmRWZXJzZVJlY2l0YXRpb25zQnlLZXk6b2V9LHc9ZmU7dmFyIHU9e2xhbmd1YWdlOlwiYXJcIn0sbWU9YXN5bmMgZT0+e2xldCByPWMoZSkse3JlY2l0YXRpb25zOnR9PWF3YWl0IGEoXCIvcmVzb3VyY2VzL3JlY2l0YXRpb25zXCIscixlPT1udWxsP3ZvaWQgMDplLmZldGNoRm4pO3JldHVybiB0fSxkZT1hc3luYyBlPT57bGV0IHI9YyhlLHUpLHt0cmFuc2xhdGlvbnM6dH09YXdhaXQgYShcIi9yZXNvdXJjZXMvdHJhbnNsYXRpb25zXCIscixlPT1udWxsP3ZvaWQgMDplLmZldGNoRm4pO3JldHVybiB0fSxsZT1hc3luYyBlPT57bGV0IHI9YyhlLHUpLHt0YWZzaXJzOnR9PWF3YWl0IGEoXCIvcmVzb3VyY2VzL3RhZnNpcnNcIixyLGU9PW51bGw/dm9pZCAwOmUuZmV0Y2hGbik7cmV0dXJuIHR9LHVlPWFzeW5jIGU9PntsZXR7cmVjaXRhdGlvblN0eWxlczpyfT1hd2FpdCBhKFwiL3Jlc291cmNlcy9yZWNpdGF0aW9uX3N0eWxlc1wiLHZvaWQgMCxlPT1udWxsP3ZvaWQgMDplLmZldGNoRm4pO3JldHVybiByfSxwZT1hc3luYyBlPT57bGV0IHI9YyhlLHUpLHtsYW5ndWFnZXM6dH09YXdhaXQgYShcIi9yZXNvdXJjZXMvbGFuZ3VhZ2VzXCIscixlPT1udWxsP3ZvaWQgMDplLmZldGNoRm4pO3JldHVybiB0fSxoZT1hc3luYyBlPT57bGV0IHI9YyhlLHUpLHtjaGFwdGVySW5mb3M6dH09YXdhaXQgYShcIi9yZXNvdXJjZXMvY2hhcHRlcl9pbmZvc1wiLHIsZT09bnVsbD92b2lkIDA6ZS5mZXRjaEZuKTtyZXR1cm4gdH0sUmU9YXN5bmMgZT0+e2xldCByPWMoZSx1KSx7dmVyc2VNZWRpYTp0fT1hd2FpdCBhKFwiL3Jlc291cmNlcy92ZXJzZV9tZWRpYVwiLHIsZT09bnVsbD92b2lkIDA6ZS5mZXRjaEZuKTtyZXR1cm4gdH0sQWU9YXN5bmMgZT0+e2xldCByPWMoZSx1KSx7cmVjaXRlcnM6dH09YXdhaXQgYShcIi9yZXNvdXJjZXMvY2hhcHRlcl9yZWNpdGVyc1wiLHIsZT09bnVsbD92b2lkIDA6ZS5mZXRjaEZuKTtyZXR1cm4gdH0sSWU9e2ZpbmRBbGxSZWNpdGF0aW9uczptZSxmaW5kQWxsVHJhbnNsYXRpb25zOmRlLGZpbmRBbGxUYWZzaXJzOmxlLGZpbmRBbGxSZWNpdGF0aW9uU3R5bGVzOnVlLGZpbmRBbGxMYW5ndWFnZXM6cGUsZmluZFZlcnNlTWVkaWE6UmUsZmluZEFsbENoYXB0ZXJSZWNpdGVyczpBZSxmaW5kQWxsQ2hhcHRlckluZm9zOmhlfSx4PUllO3ZhciBiZT17bGFuZ3VhZ2U6XCJhclwiLHNpemU6MzB9LHllPWFzeW5jKGUscik9PntsZXQgdD1jKHtxOmUsLi4ucn0sYmUpLHtzZWFyY2g6aX09YXdhaXQgYShcIi9zZWFyY2hcIix0LHI9PW51bGw/dm9pZCAwOnIuZmV0Y2hGbik7cmV0dXJuIGl9LE9lPXtzZWFyY2g6eWV9LEY9T2U7dmFyIFZlPXtjaGFwdGVyczpiLHZlcnNlczpPLGp1enM6VixhdWRpbzp3LHJlc291cmNlczp4LHNlYXJjaDpGfSx2PVZlO3ZhciBOZT17djQ6dix1dGlsczpvfSx3ZT1OZTtcblxuZXhwb3J0cy5DaGFyVHlwZSA9IEM7XG5leHBvcnRzLkxhbmd1YWdlID0gbTtcbmV4cG9ydHMuUXVyYW5Gb250ID0gUztcbmV4cG9ydHMucXVyYW4gPSB3ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIi8vID09PT09PT09PVxuLy8gPSBodW1wcyA9XG4vLyA9PT09PT09PT1cbi8vIFVuZGVyc2NvcmUtdG8tY2FtZWxDYXNlIGNvbnZlcnRlciAoYW5kIHZpY2UgdmVyc2EpXG4vLyBmb3Igc3RyaW5ncyBhbmQgb2JqZWN0IGtleXNcblxuLy8gaHVtcHMgaXMgY29weXJpZ2h0IMKpIDIwMTIrIERvbSBDaHJpc3RpZVxuLy8gUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG5cbjsoZnVuY3Rpb24oZ2xvYmFsKSB7XG5cbiAgdmFyIF9wcm9jZXNzS2V5cyA9IGZ1bmN0aW9uKGNvbnZlcnQsIG9iaiwgb3B0aW9ucykge1xuICAgIGlmKCFfaXNPYmplY3Qob2JqKSB8fCBfaXNEYXRlKG9iaikgfHwgX2lzUmVnRXhwKG9iaikgfHwgX2lzQm9vbGVhbihvYmopIHx8IF9pc0Z1bmN0aW9uKG9iaikpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgdmFyIG91dHB1dCxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGwgPSAwO1xuXG4gICAgaWYoX2lzQXJyYXkob2JqKSkge1xuICAgICAgb3V0cHV0ID0gW107XG4gICAgICBmb3IobD1vYmoubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgICBvdXRwdXQucHVzaChfcHJvY2Vzc0tleXMoY29udmVydCwgb2JqW2ldLCBvcHRpb25zKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgb3V0cHV0ID0ge307XG4gICAgICBmb3IodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICAgIG91dHB1dFtjb252ZXJ0KGtleSwgb3B0aW9ucyldID0gX3Byb2Nlc3NLZXlzKGNvbnZlcnQsIG9ialtrZXldLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIFN0cmluZyBjb252ZXJzaW9uIG1ldGhvZHNcblxuICB2YXIgc2VwYXJhdGVXb3JkcyA9IGZ1bmN0aW9uKHN0cmluZywgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBzZXBhcmF0b3IgPSBvcHRpb25zLnNlcGFyYXRvciB8fCAnXyc7XG4gICAgdmFyIHNwbGl0ID0gb3B0aW9ucy5zcGxpdCB8fCAvKD89W0EtWl0pLztcblxuICAgIHJldHVybiBzdHJpbmcuc3BsaXQoc3BsaXQpLmpvaW4oc2VwYXJhdG9yKTtcbiAgfTtcblxuICB2YXIgY2FtZWxpemUgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICBpZiAoX2lzTnVtZXJpY2FsKHN0cmluZykpIHtcbiAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9bXFwtX1xcc10rKC4pPy9nLCBmdW5jdGlvbihtYXRjaCwgY2hyKSB7XG4gICAgICByZXR1cm4gY2hyID8gY2hyLnRvVXBwZXJDYXNlKCkgOiAnJztcbiAgICB9KTtcbiAgICAvLyBFbnN1cmUgMXN0IGNoYXIgaXMgYWx3YXlzIGxvd2VyY2FzZVxuICAgIHJldHVybiBzdHJpbmcuc3Vic3RyKDAsIDEpLnRvTG93ZXJDYXNlKCkgKyBzdHJpbmcuc3Vic3RyKDEpO1xuICB9O1xuXG4gIHZhciBwYXNjYWxpemUgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgY2FtZWxpemVkID0gY2FtZWxpemUoc3RyaW5nKTtcbiAgICAvLyBFbnN1cmUgMXN0IGNoYXIgaXMgYWx3YXlzIHVwcGVyY2FzZVxuICAgIHJldHVybiBjYW1lbGl6ZWQuc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBjYW1lbGl6ZWQuc3Vic3RyKDEpO1xuICB9O1xuXG4gIHZhciBkZWNhbWVsaXplID0gZnVuY3Rpb24oc3RyaW5nLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHNlcGFyYXRlV29yZHMoc3RyaW5nLCBvcHRpb25zKS50b0xvd2VyQ2FzZSgpO1xuICB9O1xuXG4gIC8vIFV0aWxpdGllc1xuICAvLyBUYWtlbiBmcm9tIFVuZGVyc2NvcmUuanNcblxuICB2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gIHZhciBfaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Yob2JqKSA9PT0gJ2Z1bmN0aW9uJztcbiAgfTtcbiAgdmFyIF9pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9O1xuICB2YXIgX2lzQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG4gIHZhciBfaXNEYXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBEYXRlXSc7XG4gIH07XG4gIHZhciBfaXNSZWdFeHAgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IFJlZ0V4cF0nO1xuICB9O1xuICB2YXIgX2lzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIFBlcmZvcm1hbnQgd2F5IHRvIGRldGVybWluZSBpZiBvYmogY29lcmNlcyB0byBhIG51bWJlclxuICB2YXIgX2lzTnVtZXJpY2FsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgb2JqID0gb2JqIC0gMDtcbiAgICByZXR1cm4gb2JqID09PSBvYmo7XG4gIH07XG5cbiAgLy8gU2V0cyB1cCBmdW5jdGlvbiB3aGljaCBoYW5kbGVzIHByb2Nlc3Npbmcga2V5c1xuICAvLyBhbGxvd2luZyB0aGUgY29udmVydCBmdW5jdGlvbiB0byBiZSBtb2RpZmllZCBieSBhIGNhbGxiYWNrXG4gIHZhciBfcHJvY2Vzc29yID0gZnVuY3Rpb24oY29udmVydCwgb3B0aW9ucykge1xuICAgIHZhciBjYWxsYmFjayA9IG9wdGlvbnMgJiYgJ3Byb2Nlc3MnIGluIG9wdGlvbnMgPyBvcHRpb25zLnByb2Nlc3MgOiBvcHRpb25zO1xuXG4gICAgaWYodHlwZW9mKGNhbGxiYWNrKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGNvbnZlcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZywgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHN0cmluZywgY29udmVydCwgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBodW1wcyA9IHtcbiAgICBjYW1lbGl6ZTogY2FtZWxpemUsXG4gICAgZGVjYW1lbGl6ZTogZGVjYW1lbGl6ZSxcbiAgICBwYXNjYWxpemU6IHBhc2NhbGl6ZSxcbiAgICBkZXBhc2NhbGl6ZTogZGVjYW1lbGl6ZSxcbiAgICBjYW1lbGl6ZUtleXM6IGZ1bmN0aW9uKG9iamVjdCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIF9wcm9jZXNzS2V5cyhfcHJvY2Vzc29yKGNhbWVsaXplLCBvcHRpb25zKSwgb2JqZWN0KTtcbiAgICB9LFxuICAgIGRlY2FtZWxpemVLZXlzOiBmdW5jdGlvbihvYmplY3QsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBfcHJvY2Vzc0tleXMoX3Byb2Nlc3NvcihkZWNhbWVsaXplLCBvcHRpb25zKSwgb2JqZWN0LCBvcHRpb25zKTtcbiAgICB9LFxuICAgIHBhc2NhbGl6ZUtleXM6IGZ1bmN0aW9uKG9iamVjdCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIF9wcm9jZXNzS2V5cyhfcHJvY2Vzc29yKHBhc2NhbGl6ZSwgb3B0aW9ucyksIG9iamVjdCk7XG4gICAgfSxcbiAgICBkZXBhc2NhbGl6ZUtleXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlY2FtZWxpemVLZXlzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoaHVtcHMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBodW1wcztcbiAgfSBlbHNlIHtcbiAgICBnbG9iYWwuaHVtcHMgPSBodW1wcztcbiAgfVxuXG59KSh0aGlzKTtcbiJdfQ==
