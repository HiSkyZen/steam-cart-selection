// ==UserScript==
// @name         Cart Selection for Steam
// @name:ko      Cart Selection for Steam
// @name:ja      Cart Selection for Steam
// @name:zh-CN   Cart Selection for Steam
// @name:zh-TW   Cart Selection for Steam
// @description:ko  Steam 장바구니에서 원하는 항목만 골라 결제하고 나머지는 보존합니다.
// @description:ja  Steam カートから購入したい項目だけを選び、残りを保持したまま決済できます。
// @description:zh-CN  从 Steam 购物车中只选择要结算的项目，并保留其余项目。
// @description:zh-TW  從 Steam 購物車中只選擇要結帳的項目，並保留其餘項目。
// @namespace    https://github.com/HiSkyZen/steam-cart-selection
// @version      1.0.0
// @description  Select only the Steam cart items you want to check out while preserving the rest.
// @author       HiSkyZen
// @match        https://store.steampowered.com/cart*
// @match        https://store.steampowered.com/checkout*
// @match        https://checkout.steampowered.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      api.steampowered.com
// @homepageURL   https://github.com/HiSkyZen/steam-cart-selection
// @supportURL    https://github.com/HiSkyZen/steam-cart-selection/issues
// @updateURL     https://raw.githubusercontent.com/HiSkyZen/steam-cart-selection/main/cart-selection-for-steam.user.js
// @downloadURL   https://raw.githubusercontent.com/HiSkyZen/steam-cart-selection/main/cart-selection-for-steam.user.js
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const SCRIPT_NAME = 'Cart Selection for Steam';
  const RECOVERY_KEY = 'cfs_recovery_v1';
  const LEGACY_RECOVERY_KEY = 'ssc_recovery_v1';
  const LANGUAGE_KEY = 'cfs_language_v1';
  const UI_ID = 'ssc-panel';
  const CHECKOUT_UI_ID = 'ssc-checkout-banner';
  const API_BASE = 'https://api.steampowered.com';
  const STORE_CART_URL = 'https://store.steampowered.com/cart/';
  const CHECKOUT_BASE = 'https://checkout.steampowered.com/checkout/';

  const I18N = {
  "arabic": {
    "loading": "جارٍ تحميل سلة التسوق…",
    "selectAll": "تحديد الكل",
    "selectNone": "إلغاء التحديد",
    "refresh": "تحديث",
    "selectedCount": "تم تحديد {selected} من {total}",
    "selectedTotal": "إجمالي المحدد: {amount}",
    "priceUnavailable": "إجمالي المحدد: السعر غير متاح",
    "priceMissing": "إجمالي المحدد: {amount} + {count} بلا سعر",
    "checkout": "شراء المحدد",
    "processing": "جارٍ المعالجة…",
    "gift": "هدية",
    "private": "خاص",
    "recoveryPending": "هناك {count} عنصر من عملية الشراء الانتقائية السابقة بانتظار الاستعادة.",
    "restoreNow": "استعادة الآن",
    "discardBackup": "حذف النسخة الاحتياطية",
    "discardConfirm": "حذف نسخة الاستعادة الاحتياطية؟ لن تتم استعادة العناصر التي أزيلت تلقائيًا.",
    "readingCart": "جارٍ قراءة سلة حساب Steam…",
    "cartLoaded": "تم تحميل {count} عنصر.",
    "cartEmpty": "سلة التسوق فارغة.",
    "checkoutActive": "الشراء الانتقائي مفعّل:",
    "checkoutBanner": "يتم الاحتفاظ بـ {count} عنصر غير محدد لاستعادته بأمان. بعد إكمال الشراء أو إلغائه، ارجع إلى السلة واستعد العناصر.",
    "returnRestore": "العودة إلى السلة والاستعادة",
    "hide": "إخفاء",
    "menuRestore": "Cart Selection for Steam: استعادة العناصر المحفوظة",
    "restoring": "جارٍ استعادة {count} عنصر…",
    "restored": "تمت استعادة {count} عنصر.",
    "restoreFailed": "فشلت الاستعادة: {error}",
    "loadFailed": "فشل التحميل: {error}",
    "autoRestored": "تمت استعادة العناصر المحفوظة.",
    "autoRestoreFailed": "فشلت الاستعادة التلقائية: {error}",
    "noRecovery": "لا توجد عناصر محفوظة لاستعادتها.",
    "collapse": "طي",
    "tokenMissing": "تعذر العثور على رمز Web API لجلسة Steam المسجّل دخولها.",
    "previousRecovery": "لا تزال عناصر من عملية شراء انتقائية سابقة بانتظار الاستعادة. استعدها أولًا.",
    "selectOne": "حدد عنصرًا واحدًا على الأقل للشراء.",
    "fallbackConfirm": "لشراء {selected} عنصر فقط، يجب إزالة {parked} عنصر غير محدد مؤقتًا من سلة الحساب. لا يُحفظ للاستعادة سوى معرّفات العناصر وحالة الهدية/الخصوصية، ولا يُحفظ رمز تسجيل الدخول أبدًا. هل تريد المتابعة؟",
    "error": "خطأ: {error}"
  },
  "bulgarian": {
    "loading": "Зареждане на количката…",
    "selectAll": "Избиране на всички",
    "selectNone": "Изчистване на избора",
    "refresh": "Опресняване",
    "selectedCount": "Избрани {selected} / {total}",
    "selectedTotal": "Общо избрани: {amount}",
    "priceUnavailable": "Общо избрани: цената не е налична",
    "priceMissing": "Общо избрани: {amount} + {count} без цена",
    "checkout": "Купуване на избраните",
    "processing": "Обработване…",
    "gift": "Подарък",
    "private": "Частно",
    "recoveryPending": "{count} артикула от предишната избирателна покупка чакат възстановяване.",
    "restoreNow": "Възстановяване сега",
    "discardBackup": "Изтриване на архива",
    "discardConfirm": "Да се изтрие ли архивът за възстановяване? Премахнатите артикули няма да се възстановят автоматично.",
    "readingCart": "Четене на количката на Steam акаунта…",
    "cartLoaded": "Заредени артикули: {count}.",
    "cartEmpty": "Количката е празна.",
    "checkoutActive": "Избирателната покупка е активна:",
    "checkoutBanner": "{count} неизбрани артикула се пазят за безопасно възстановяване. След покупка или отказ се върнете в количката и ги възстановете.",
    "returnRestore": "Към количката и възстановяване",
    "hide": "Скриване",
    "menuRestore": "Cart Selection for Steam: възстановяване на запазени артикули",
    "restoring": "Възстановяване на {count} артикула…",
    "restored": "Възстановени артикули: {count}.",
    "restoreFailed": "Неуспешно възстановяване: {error}",
    "loadFailed": "Неуспешно зареждане: {error}",
    "autoRestored": "Запазените артикули са възстановени.",
    "autoRestoreFailed": "Автоматичното възстановяване е неуспешно: {error}",
    "noRecovery": "Няма запазени артикули за възстановяване.",
    "collapse": "Свиване",
    "tokenMissing": "Не беше намерен Web API токенът на влязлата Steam сесия.",
    "previousRecovery": "Артикули от предишна избирателна покупка все още чакат възстановяване. Първо ги възстановете.",
    "selectOne": "Изберете поне един артикул за покупка.",
    "fallbackConfirm": "За да купите само {selected} артикула, {parked} неизбрани артикула трябва временно да се премахнат от количката на акаунта. За възстановяване се пазят само ID и статус подарък/частно; токенът за вход никога не се пази. Продължаване?",
    "error": "Грешка: {error}"
  },
  "schinese": {
    "loading": "正在读取购物车…",
    "selectAll": "全选",
    "selectNone": "取消全选",
    "refresh": "刷新",
    "selectedCount": "已选择 {selected} / {total} 项",
    "selectedTotal": "所选合计：{amount}",
    "priceUnavailable": "所选合计：无法获取价格",
    "priceMissing": "所选合计：{amount} + {count} 项价格未知",
    "checkout": "结算所选项目",
    "processing": "处理中…",
    "gift": "礼物",
    "private": "私密",
    "recoveryPending": "上次选择性结算中有 {count} 项等待恢复。",
    "restoreNow": "立即恢复",
    "discardBackup": "丢弃备份",
    "discardConfirm": "丢弃恢复备份吗？已移除的项目将不会自动恢复。",
    "readingCart": "正在读取您的 Steam 帐户购物车…",
    "cartLoaded": "已加载 {count} 个购物车项目。",
    "cartEmpty": "购物车为空。",
    "checkoutActive": "选择性结算已启用：",
    "checkoutBanner": "正在保留 {count} 个未选项目以便安全恢复。完成或取消结算后，请返回购物车恢复它们。",
    "returnRestore": "返回购物车并恢复",
    "hide": "隐藏",
    "menuRestore": "Cart Selection for Steam：恢复暂存项目",
    "restoring": "正在恢复 {count} 个暂存项目…",
    "restored": "已恢复 {count} 个项目。",
    "restoreFailed": "恢复失败：{error}",
    "loadFailed": "加载失败：{error}",
    "autoRestored": "已恢复暂存项目。",
    "autoRestoreFailed": "自动恢复失败：{error}",
    "noRecovery": "没有需要恢复的暂存项目。",
    "collapse": "折叠",
    "tokenMissing": "无法找到已登录 Steam 的 Web API 令牌。",
    "previousRecovery": "上次选择性结算仍有项目等待恢复。请先恢复它们。",
    "selectOne": "请至少选择一个要结算的项目。",
    "fallbackConfirm": "若只结算所选的 {selected} 项，需要暂时从帐户购物车移除 {parked} 个未选项目。仅保存项目 ID 和礼物/私密状态用于恢复，不会保存登录令牌。继续吗？",
    "error": "错误：{error}"
  },
  "tchinese": {
    "loading": "正在讀取購物車…",
    "selectAll": "全選",
    "selectNone": "取消全選",
    "refresh": "重新整理",
    "selectedCount": "已選擇 {selected} / {total} 項",
    "selectedTotal": "所選合計：{amount}",
    "priceUnavailable": "所選合計：無法取得價格",
    "priceMissing": "所選合計：{amount} + {count} 項價格未知",
    "checkout": "結帳所選項目",
    "processing": "處理中…",
    "gift": "禮物",
    "private": "私人",
    "recoveryPending": "上次選擇性結帳中有 {count} 項等待還原。",
    "restoreNow": "立即還原",
    "discardBackup": "捨棄備份",
    "discardConfirm": "要捨棄還原備份嗎？已移除的項目將不會自動還原。",
    "readingCart": "正在讀取您的 Steam 帳戶購物車…",
    "cartLoaded": "已載入 {count} 個購物車項目。",
    "cartEmpty": "購物車是空的。",
    "checkoutActive": "選擇性結帳已啟用：",
    "checkoutBanner": "正在保留 {count} 個未選項目以便安全還原。完成或取消結帳後，請返回購物車還原它們。",
    "returnRestore": "返回購物車並還原",
    "hide": "隱藏",
    "menuRestore": "Cart Selection for Steam：還原暫存項目",
    "restoring": "正在還原 {count} 個暫存項目…",
    "restored": "已還原 {count} 個項目。",
    "restoreFailed": "還原失敗：{error}",
    "loadFailed": "載入失敗：{error}",
    "autoRestored": "已還原暫存項目。",
    "autoRestoreFailed": "自動還原失敗：{error}",
    "noRecovery": "沒有需要還原的暫存項目。",
    "collapse": "收合",
    "tokenMissing": "找不到已登入 Steam 的 Web API 權杖。",
    "previousRecovery": "上次選擇性結帳仍有項目等待還原。請先還原。",
    "selectOne": "請至少選擇一個要結帳的項目。",
    "fallbackConfirm": "若只結帳所選的 {selected} 項，需要暫時從帳戶購物車移除 {parked} 個未選項目。僅儲存項目 ID 與禮物/私人狀態以供還原，不會儲存登入權杖。繼續嗎？",
    "error": "錯誤：{error}"
  },
  "czech": {
    "loading": "Načítání košíku…",
    "selectAll": "Vybrat vše",
    "selectNone": "Zrušit výběr",
    "refresh": "Obnovit",
    "selectedCount": "Vybráno {selected} / {total}",
    "selectedTotal": "Součet vybraných: {amount}",
    "priceUnavailable": "Součet vybraných: cena není dostupná",
    "priceMissing": "Součet vybraných: {amount} + {count} bez ceny",
    "checkout": "Koupit vybrané",
    "processing": "Zpracování…",
    "gift": "Dárek",
    "private": "Soukromé",
    "recoveryPending": "{count} položek z předchozího selektivního nákupu čeká na obnovení.",
    "restoreNow": "Obnovit nyní",
    "discardBackup": "Zahodit zálohu",
    "discardConfirm": "Zahodit zálohu pro obnovení? Odebrané položky nebudou automaticky obnoveny.",
    "readingCart": "Načítání košíku účtu Steam…",
    "cartLoaded": "Načteno položek: {count}.",
    "cartEmpty": "Košík je prázdný.",
    "checkoutActive": "Selektivní nákup aktivní:",
    "checkoutBanner": "{count} nevybraných položek je uchováno pro bezpečné obnovení. Po dokončení nebo zrušení nákupu se vraťte do košíku a obnovte je.",
    "returnRestore": "Vrátit se do košíku a obnovit",
    "hide": "Skrýt",
    "menuRestore": "Cart Selection for Steam: obnovit odložené položky",
    "restoring": "Obnovování {count} odložených položek…",
    "restored": "Obnoveno položek: {count}.",
    "restoreFailed": "Obnovení se nezdařilo: {error}",
    "loadFailed": "Načtení se nezdařilo: {error}",
    "autoRestored": "Odložené položky byly obnoveny.",
    "autoRestoreFailed": "Automatické obnovení se nezdařilo: {error}",
    "noRecovery": "Žádné odložené položky k obnovení.",
    "collapse": "Sbalit",
    "tokenMissing": "Nepodařilo se najít Web API token přihlášené relace Steam.",
    "previousRecovery": "Položky z předchozího selektivního nákupu stále čekají na obnovení. Nejprve je obnovte.",
    "selectOne": "Vyberte alespoň jednu položku k nákupu.",
    "fallbackConfirm": "Chcete-li koupit pouze {selected} položek, je nutné dočasně odebrat {parked} nevybraných položek z košíku účtu. Pro obnovení se ukládají jen ID a stav dárek/soukromé; přihlašovací token se nikdy neukládá. Pokračovat?",
    "error": "Chyba: {error}"
  },
  "danish": {
    "loading": "Indlæser kurv…",
    "selectAll": "Vælg alle",
    "selectNone": "Ryd valg",
    "refresh": "Opdater",
    "selectedCount": "{selected} / {total} valgt",
    "selectedTotal": "Valgt total: {amount}",
    "priceUnavailable": "Valgt total: pris ikke tilgængelig",
    "priceMissing": "Valgt total: {amount} + {count} uden pris",
    "checkout": "Køb valgte",
    "processing": "Behandler…",
    "gift": "Gave",
    "private": "Privat",
    "recoveryPending": "{count} vare(r) fra det forrige selektive køb venter på gendannelse.",
    "restoreNow": "Gendan nu",
    "discardBackup": "Slet sikkerhedskopi",
    "discardConfirm": "Slet gendannelseskopien? Fjernede varer gendannes ikke automatisk.",
    "readingCart": "Læser din Steam-kontos kurv…",
    "cartLoaded": "{count} vare(r) indlæst.",
    "cartEmpty": "Din kurv er tom.",
    "checkoutActive": "Selektivt køb aktivt:",
    "checkoutBanner": "{count} ikke-valgte vare(r) gemmes til sikker gendannelse. Efter køb eller annullering skal du gå tilbage til kurven og gendanne dem.",
    "returnRestore": "Tilbage til kurven og gendan",
    "hide": "Skjul",
    "menuRestore": "Cart Selection for Steam: gendan parkerede varer",
    "restoring": "Gendanner {count} parkerede vare(r)…",
    "restored": "{count} vare(r) gendannet.",
    "restoreFailed": "Gendannelse mislykkedes: {error}",
    "loadFailed": "Indlæsning mislykkedes: {error}",
    "autoRestored": "Parkerede varer gendannet.",
    "autoRestoreFailed": "Automatisk gendannelse mislykkedes: {error}",
    "noRecovery": "Ingen parkerede varer at gendanne.",
    "collapse": "Fold sammen",
    "tokenMissing": "Web API-tokenet for den indloggede Steam-session blev ikke fundet.",
    "previousRecovery": "Varer fra et tidligere selektivt køb venter stadig på gendannelse. Gendan dem først.",
    "selectOne": "Vælg mindst én vare at købe.",
    "fallbackConfirm": "For kun at købe {selected} vare(r) skal {parked} ikke-valgte vare(r) midlertidigt fjernes fra kontoens kurv. Kun vare-ID’er og gave-/privatstatus gemmes til gendannelse; login-tokenet gemmes aldrig. Fortsæt?",
    "error": "Fejl: {error}"
  },
  "dutch": {
    "loading": "Winkelwagen laden…",
    "selectAll": "Alles selecteren",
    "selectNone": "Selectie wissen",
    "refresh": "Vernieuwen",
    "selectedCount": "{selected} / {total} geselecteerd",
    "selectedTotal": "Totaal geselecteerd: {amount}",
    "priceUnavailable": "Totaal geselecteerd: prijs niet beschikbaar",
    "priceMissing": "Totaal geselecteerd: {amount} + {count} zonder prijs",
    "checkout": "Selectie afrekenen",
    "processing": "Bezig…",
    "gift": "Cadeau",
    "private": "Privé",
    "recoveryPending": "{count} item(s) van de vorige selectieve aankoop wachten op herstel.",
    "restoreNow": "Nu herstellen",
    "discardBackup": "Back-up verwijderen",
    "discardConfirm": "Herstelback-up verwijderen? Verwijderde items worden niet automatisch hersteld.",
    "readingCart": "Steam-accountwinkelwagen lezen…",
    "cartLoaded": "{count} winkelwagenitem(s) geladen.",
    "cartEmpty": "Je winkelwagen is leeg.",
    "checkoutActive": "Selectief afrekenen actief:",
    "checkoutBanner": "{count} niet-geselecteerde item(s) worden bewaard voor veilig herstel. Keer na aankoop of annulering terug naar de winkelwagen en herstel ze.",
    "returnRestore": "Terug naar winkelwagen en herstellen",
    "hide": "Verbergen",
    "menuRestore": "Cart Selection for Steam: geparkeerde items herstellen",
    "restoring": "{count} geparkeerde item(s) herstellen…",
    "restored": "{count} item(s) hersteld.",
    "restoreFailed": "Herstellen mislukt: {error}",
    "loadFailed": "Laden mislukt: {error}",
    "autoRestored": "Geparkeerde items hersteld.",
    "autoRestoreFailed": "Automatisch herstel mislukt: {error}",
    "noRecovery": "Geen geparkeerde items om te herstellen.",
    "collapse": "Inklappen",
    "tokenMissing": "Het Web API-token van de aangemelde Steam-sessie is niet gevonden.",
    "previousRecovery": "Items van een eerdere selectieve aankoop wachten nog op herstel. Herstel ze eerst.",
    "selectOne": "Selecteer minstens één item om af te rekenen.",
    "fallbackConfirm": "Om alleen {selected} item(s) af te rekenen, moeten {parked} niet-geselecteerde item(s) tijdelijk uit de accountwinkelwagen worden verwijderd. Alleen item-ID’s en cadeau-/privéstatus worden voor herstel opgeslagen; het inlogtoken nooit. Doorgaan?",
    "error": "Fout: {error}"
  },
  "english": {
    "loading": "Loading cart…",
    "selectAll": "Select all",
    "selectNone": "Clear selection",
    "refresh": "Refresh",
    "selectedCount": "{selected} / {total} selected",
    "selectedTotal": "Selected total: {amount}",
    "priceUnavailable": "Selected total: price unavailable",
    "priceMissing": "Selected total: {amount} + {count} unpriced",
    "checkout": "Checkout selected",
    "processing": "Processing…",
    "gift": "Gift",
    "private": "Private",
    "recoveryPending": "{count} item(s) from the previous selective checkout are waiting to be restored.",
    "restoreNow": "Restore now",
    "discardBackup": "Discard backup",
    "discardConfirm": "Discard the recovery backup? Removed items will not be restored automatically.",
    "readingCart": "Reading your Steam account cart…",
    "cartLoaded": "Loaded {count} cart item(s).",
    "cartEmpty": "Your cart is empty.",
    "checkoutActive": "Selective checkout active:",
    "checkoutBanner": "{count} unselected item(s) are being kept for safe restoration. After completing or cancelling checkout, return to the cart and restore them.",
    "returnRestore": "Return to cart and restore",
    "hide": "Hide",
    "menuRestore": "Cart Selection for Steam: restore parked items",
    "restoring": "Restoring {count} parked item(s)…",
    "restored": "Restored {count} item(s).",
    "restoreFailed": "Restore failed: {error}",
    "loadFailed": "Load failed: {error}",
    "autoRestored": "Parked items restored.",
    "autoRestoreFailed": "Automatic restore failed: {error}",
    "noRecovery": "There are no parked items to restore.",
    "collapse": "Collapse",
    "tokenMissing": "Could not find the signed-in Steam Web API token.",
    "previousRecovery": "Items from a previous selective checkout are still waiting to be restored. Restore them first.",
    "selectOne": "Select at least one item to check out.",
    "fallbackConfirm": "To check out only {selected} item(s), {parked} unselected item(s) must be temporarily removed from the account cart. Only item IDs and gift/private flags are stored for recovery; your login token is never stored. Continue?",
    "error": "Error: {error}"
  },
  "finnish": {
    "loading": "Ladataan ostoskoria…",
    "selectAll": "Valitse kaikki",
    "selectNone": "Tyhjennä valinta",
    "refresh": "Päivitä",
    "selectedCount": "{selected} / {total} valittu",
    "selectedTotal": "Valittujen summa: {amount}",
    "priceUnavailable": "Valittujen summa: hintaa ei saatavilla",
    "priceMissing": "Valittujen summa: {amount} + {count} ilman hintaa",
    "checkout": "Osta valitut",
    "processing": "Käsitellään…",
    "gift": "Lahja",
    "private": "Yksityinen",
    "recoveryPending": "{count} kohdetta edellisestä valikoivasta ostosta odottaa palautusta.",
    "restoreNow": "Palauta nyt",
    "discardBackup": "Hylkää varmuuskopio",
    "discardConfirm": "Hylätäänkö palautusvarmuuskopio? Poistettuja kohteita ei palauteta automaattisesti.",
    "readingCart": "Luetaan Steam-tilin ostoskoria…",
    "cartLoaded": "Ladattiin {count} kohdetta.",
    "cartEmpty": "Ostoskori on tyhjä.",
    "checkoutActive": "Valikoiva osto aktiivinen:",
    "checkoutBanner": "{count} valitsematonta kohdetta säilytetään turvallista palautusta varten. Oston tai peruutuksen jälkeen palaa ostoskoriin ja palauta ne.",
    "returnRestore": "Palaa ostoskoriin ja palauta",
    "hide": "Piilota",
    "menuRestore": "Cart Selection for Steam: palauta sivuun siirretyt kohteet",
    "restoring": "Palautetaan {count} kohdetta…",
    "restored": "Palautettiin {count} kohdetta.",
    "restoreFailed": "Palautus epäonnistui: {error}",
    "loadFailed": "Lataus epäonnistui: {error}",
    "autoRestored": "Sivuun siirretyt kohteet palautettiin.",
    "autoRestoreFailed": "Automaattinen palautus epäonnistui: {error}",
    "noRecovery": "Ei palautettavia sivuun siirrettyjä kohteita.",
    "collapse": "Pienennä",
    "tokenMissing": "Kirjautuneen Steam-istunnon Web API -tunnusta ei löytynyt.",
    "previousRecovery": "Edellisen valikoivan oston kohteita odottaa vielä palautusta. Palauta ne ensin.",
    "selectOne": "Valitse vähintään yksi ostettava kohde.",
    "fallbackConfirm": "Jotta vain {selected} kohdetta ostetaan, {parked} valitsematonta kohdetta on poistettava tilin ostoskorista väliaikaisesti. Palautusta varten tallennetaan vain kohde-ID:t ja lahja-/yksityisyystila; kirjautumistunnusta ei koskaan tallenneta. Jatketaanko?",
    "error": "Virhe: {error}"
  },
  "french": {
    "loading": "Chargement du panier…",
    "selectAll": "Tout sélectionner",
    "selectNone": "Tout désélectionner",
    "refresh": "Actualiser",
    "selectedCount": "{selected} / {total} sélectionnés",
    "selectedTotal": "Total sélectionné : {amount}",
    "priceUnavailable": "Total sélectionné : prix indisponible",
    "priceMissing": "Total sélectionné : {amount} + {count} sans prix",
    "checkout": "Acheter la sélection",
    "processing": "Traitement…",
    "gift": "Cadeau",
    "private": "Privé",
    "recoveryPending": "{count} article(s) du paiement sélectif précédent attendent d’être restaurés.",
    "restoreNow": "Restaurer maintenant",
    "discardBackup": "Supprimer la sauvegarde",
    "discardConfirm": "Supprimer la sauvegarde de restauration ? Les articles retirés ne seront pas restaurés automatiquement.",
    "readingCart": "Lecture du panier de votre compte Steam…",
    "cartLoaded": "{count} article(s) chargé(s).",
    "cartEmpty": "Votre panier est vide.",
    "checkoutActive": "Paiement sélectif actif :",
    "checkoutBanner": "{count} article(s) non sélectionné(s) sont conservés pour une restauration sûre. Après achat ou annulation, revenez au panier pour les restaurer.",
    "returnRestore": "Revenir au panier et restaurer",
    "hide": "Masquer",
    "menuRestore": "Cart Selection for Steam : restaurer les articles mis de côté",
    "restoring": "Restauration de {count} article(s)…",
    "restored": "{count} article(s) restauré(s).",
    "restoreFailed": "Échec de la restauration : {error}",
    "loadFailed": "Échec du chargement : {error}",
    "autoRestored": "Articles mis de côté restaurés.",
    "autoRestoreFailed": "Échec de la restauration automatique : {error}",
    "noRecovery": "Aucun article mis de côté à restaurer.",
    "collapse": "Réduire",
    "tokenMissing": "Impossible de trouver le jeton Web API de la session Steam connectée.",
    "previousRecovery": "Des articles d’un paiement sélectif précédent attendent encore d’être restaurés. Restaurez-les d’abord.",
    "selectOne": "Sélectionnez au moins un article à acheter.",
    "fallbackConfirm": "Pour n’acheter que {selected} article(s), {parked} article(s) non sélectionné(s) doivent être retirés temporairement du panier du compte. Seuls les identifiants et états cadeau/privé sont sauvegardés pour la restauration ; le jeton de connexion n’est jamais enregistré. Continuer ?",
    "error": "Erreur : {error}"
  },
  "german": {
    "loading": "Warenkorb wird geladen…",
    "selectAll": "Alle auswählen",
    "selectNone": "Auswahl aufheben",
    "refresh": "Aktualisieren",
    "selectedCount": "{selected} / {total} ausgewählt",
    "selectedTotal": "Ausgewählte Summe: {amount}",
    "priceUnavailable": "Ausgewählte Summe: Preis nicht verfügbar",
    "priceMissing": "Ausgewählte Summe: {amount} + {count} ohne Preis",
    "checkout": "Auswahl kaufen",
    "processing": "Wird verarbeitet…",
    "gift": "Geschenk",
    "private": "Privat",
    "recoveryPending": "{count} Artikel aus dem vorherigen selektiven Kauf warten auf Wiederherstellung.",
    "restoreNow": "Jetzt wiederherstellen",
    "discardBackup": "Sicherung verwerfen",
    "discardConfirm": "Wiederherstellungssicherung verwerfen? Entfernte Artikel werden nicht automatisch wiederhergestellt.",
    "readingCart": "Steam-Warenkorb wird gelesen…",
    "cartLoaded": "{count} Warenkorbartikel geladen.",
    "cartEmpty": "Ihr Warenkorb ist leer.",
    "checkoutActive": "Selektiver Kauf aktiv:",
    "checkoutBanner": "{count} nicht ausgewählte Artikel werden zur sicheren Wiederherstellung aufbewahrt. Kehren Sie nach Abschluss oder Abbruch zum Warenkorb zurück und stellen Sie sie wieder her.",
    "returnRestore": "Zum Warenkorb und wiederherstellen",
    "hide": "Ausblenden",
    "menuRestore": "Cart Selection for Steam: zurückgestellte Artikel wiederherstellen",
    "restoring": "{count} zurückgestellte Artikel werden wiederhergestellt…",
    "restored": "{count} Artikel wiederhergestellt.",
    "restoreFailed": "Wiederherstellung fehlgeschlagen: {error}",
    "loadFailed": "Laden fehlgeschlagen: {error}",
    "autoRestored": "Zurückgestellte Artikel wiederhergestellt.",
    "autoRestoreFailed": "Automatische Wiederherstellung fehlgeschlagen: {error}",
    "noRecovery": "Keine zurückgestellten Artikel zum Wiederherstellen.",
    "collapse": "Einklappen",
    "tokenMissing": "Das Web-API-Token der angemeldeten Steam-Sitzung wurde nicht gefunden.",
    "previousRecovery": "Artikel aus einem vorherigen selektiven Kauf warten noch auf Wiederherstellung. Bitte zuerst wiederherstellen.",
    "selectOne": "Wählen Sie mindestens einen Artikel zum Kauf aus.",
    "fallbackConfirm": "Um nur {selected} Artikel zu kaufen, müssen {parked} nicht ausgewählte Artikel vorübergehend aus dem Kontowarenkorb entfernt werden. Zur Wiederherstellung werden nur Artikel-IDs und Geschenk-/Privatstatus gespeichert; das Login-Token wird nie gespeichert. Fortfahren?",
    "error": "Fehler: {error}"
  },
  "greek": {
    "loading": "Φόρτωση καλαθιού…",
    "selectAll": "Επιλογή όλων",
    "selectNone": "Κατάργηση επιλογής",
    "refresh": "Ανανέωση",
    "selectedCount": "{selected} / {total} επιλεγμένα",
    "selectedTotal": "Σύνολο επιλεγμένων: {amount}",
    "priceUnavailable": "Σύνολο επιλεγμένων: μη διαθέσιμη τιμή",
    "priceMissing": "Σύνολο επιλεγμένων: {amount} + {count} χωρίς τιμή",
    "checkout": "Αγορά επιλεγμένων",
    "processing": "Επεξεργασία…",
    "gift": "Δώρο",
    "private": "Ιδιωτικό",
    "recoveryPending": "{count} αντικείμενα από την προηγούμενη επιλεκτική αγορά περιμένουν επαναφορά.",
    "restoreNow": "Επαναφορά τώρα",
    "discardBackup": "Διαγραφή αντιγράφου",
    "discardConfirm": "Να διαγραφεί το αντίγραφο επαναφοράς; Τα αφαιρεμένα αντικείμενα δεν θα επανέλθουν αυτόματα.",
    "readingCart": "Ανάγνωση καλαθιού λογαριασμού Steam…",
    "cartLoaded": "Φορτώθηκαν {count} αντικείμενα.",
    "cartEmpty": "Το καλάθι σας είναι άδειο.",
    "checkoutActive": "Επιλεκτική αγορά ενεργή:",
    "checkoutBanner": "{count} μη επιλεγμένα αντικείμενα φυλάσσονται για ασφαλή επαναφορά. Μετά την ολοκλήρωση ή ακύρωση, επιστρέψτε στο καλάθι και επαναφέρετέ τα.",
    "returnRestore": "Επιστροφή στο καλάθι και επαναφορά",
    "hide": "Απόκρυψη",
    "menuRestore": "Cart Selection for Steam: επαναφορά φυλαγμένων αντικειμένων",
    "restoring": "Επαναφορά {count} αντικειμένων…",
    "restored": "Επαναφέρθηκαν {count} αντικείμενα.",
    "restoreFailed": "Αποτυχία επαναφοράς: {error}",
    "loadFailed": "Αποτυχία φόρτωσης: {error}",
    "autoRestored": "Τα φυλαγμένα αντικείμενα επαναφέρθηκαν.",
    "autoRestoreFailed": "Αποτυχία αυτόματης επαναφοράς: {error}",
    "noRecovery": "Δεν υπάρχουν αντικείμενα για επαναφορά.",
    "collapse": "Σύμπτυξη",
    "tokenMissing": "Δεν βρέθηκε το Web API token της συνδεδεμένης συνεδρίας Steam.",
    "previousRecovery": "Αντικείμενα από προηγούμενη επιλεκτική αγορά περιμένουν ακόμη επαναφορά. Επαναφέρετέ τα πρώτα.",
    "selectOne": "Επιλέξτε τουλάχιστον ένα αντικείμενο για αγορά.",
    "fallbackConfirm": "Για αγορά μόνο {selected} αντικειμένων, {parked} μη επιλεγμένα αντικείμενα πρέπει να αφαιρεθούν προσωρινά από το καλάθι λογαριασμού. Αποθηκεύονται μόνο αναγνωριστικά και κατάσταση δώρου/ιδιωτικού για επαναφορά· το token σύνδεσης δεν αποθηκεύεται ποτέ. Συνέχεια;",
    "error": "Σφάλμα: {error}"
  },
  "hungarian": {
    "loading": "Kosár betöltése…",
    "selectAll": "Összes kijelölése",
    "selectNone": "Kijelölés törlése",
    "refresh": "Frissítés",
    "selectedCount": "{selected} / {total} kijelölve",
    "selectedTotal": "Kijelöltek összege: {amount}",
    "priceUnavailable": "Kijelöltek összege: az ár nem érhető el",
    "priceMissing": "Kijelöltek összege: {amount} + {count} ár nélkül",
    "checkout": "Kijelöltek megvásárlása",
    "processing": "Feldolgozás…",
    "gift": "Ajándék",
    "private": "Privát",
    "recoveryPending": "Az előző szelektív vásárlásból {count} elem vár visszaállításra.",
    "restoreNow": "Visszaállítás most",
    "discardBackup": "Biztonsági mentés elvetése",
    "discardConfirm": "Elveti a visszaállítási mentést? Az eltávolított elemek nem állnak vissza automatikusan.",
    "readingCart": "A Steam-fiók kosarának beolvasása…",
    "cartLoaded": "{count} kosárelem betöltve.",
    "cartEmpty": "A kosár üres.",
    "checkoutActive": "Szelektív vásárlás aktív:",
    "checkoutBanner": "{count} ki nem jelölt elemet megőrzünk a biztonságos visszaállításhoz. Vásárlás vagy megszakítás után térjen vissza a kosárhoz és állítsa vissza őket.",
    "returnRestore": "Vissza a kosárhoz és visszaállítás",
    "hide": "Elrejtés",
    "menuRestore": "Cart Selection for Steam: félretett elemek visszaállítása",
    "restoring": "{count} félretett elem visszaállítása…",
    "restored": "{count} elem visszaállítva.",
    "restoreFailed": "Visszaállítás sikertelen: {error}",
    "loadFailed": "Betöltés sikertelen: {error}",
    "autoRestored": "A félretett elemek visszaállítva.",
    "autoRestoreFailed": "Automatikus visszaállítás sikertelen: {error}",
    "noRecovery": "Nincs visszaállítandó félretett elem.",
    "collapse": "Összecsukás",
    "tokenMissing": "Nem található a bejelentkezett Steam-munkamenet Web API tokenje.",
    "previousRecovery": "Az előző szelektív vásárlás elemei még visszaállításra várnak. Előbb állítsa vissza őket.",
    "selectOne": "Válasszon ki legalább egy megvásárolandó elemet.",
    "fallbackConfirm": "Csak {selected} elem megvásárlásához {parked} ki nem jelölt elemet ideiglenesen el kell távolítani a fiók kosarából. A visszaállításhoz csak az azonosítók és az ajándék/privát állapot tárolódik; a belépési token soha. Folytatja?",
    "error": "Hiba: {error}"
  },
  "indonesian": {
    "loading": "Memuat keranjang…",
    "selectAll": "Pilih semua",
    "selectNone": "Hapus pilihan",
    "refresh": "Muat ulang",
    "selectedCount": "{selected} / {total} dipilih",
    "selectedTotal": "Total pilihan: {amount}",
    "priceUnavailable": "Total pilihan: harga tidak tersedia",
    "priceMissing": "Total pilihan: {amount} + {count} tanpa harga",
    "checkout": "Beli yang dipilih",
    "processing": "Memproses…",
    "gift": "Hadiah",
    "private": "Privat",
    "recoveryPending": "{count} item dari pembelian selektif sebelumnya menunggu dipulihkan.",
    "restoreNow": "Pulihkan sekarang",
    "discardBackup": "Hapus cadangan",
    "discardConfirm": "Hapus cadangan pemulihan? Item yang dihapus tidak akan dipulihkan otomatis.",
    "readingCart": "Membaca keranjang akun Steam…",
    "cartLoaded": "Memuat {count} item.",
    "cartEmpty": "Keranjang kosong.",
    "checkoutActive": "Pembelian selektif aktif:",
    "checkoutBanner": "{count} item yang tidak dipilih disimpan agar dapat dipulihkan dengan aman. Setelah membeli atau membatalkan, kembali ke keranjang dan pulihkan item tersebut.",
    "returnRestore": "Kembali ke keranjang dan pulihkan",
    "hide": "Sembunyikan",
    "menuRestore": "Cart Selection for Steam: pulihkan item yang disimpan",
    "restoring": "Memulihkan {count} item…",
    "restored": "{count} item dipulihkan.",
    "restoreFailed": "Pemulihan gagal: {error}",
    "loadFailed": "Gagal memuat: {error}",
    "autoRestored": "Item yang disimpan telah dipulihkan.",
    "autoRestoreFailed": "Pemulihan otomatis gagal: {error}",
    "noRecovery": "Tidak ada item tersimpan untuk dipulihkan.",
    "collapse": "Ciutkan",
    "tokenMissing": "Token Web API sesi Steam yang masuk tidak ditemukan.",
    "previousRecovery": "Item dari pembelian selektif sebelumnya masih menunggu dipulihkan. Pulihkan terlebih dahulu.",
    "selectOne": "Pilih setidaknya satu item untuk dibeli.",
    "fallbackConfirm": "Untuk membeli hanya {selected} item, {parked} item yang tidak dipilih harus sementara dihapus dari keranjang akun. Hanya ID item dan status hadiah/privat yang disimpan untuk pemulihan; token login tidak pernah disimpan. Lanjutkan?",
    "error": "Kesalahan: {error}"
  },
  "italian": {
    "loading": "Caricamento carrello…",
    "selectAll": "Seleziona tutto",
    "selectNone": "Deseleziona tutto",
    "refresh": "Aggiorna",
    "selectedCount": "{selected} / {total} selezionati",
    "selectedTotal": "Totale selezionato: {amount}",
    "priceUnavailable": "Totale selezionato: prezzo non disponibile",
    "priceMissing": "Totale selezionato: {amount} + {count} senza prezzo",
    "checkout": "Acquista selezionati",
    "processing": "Elaborazione…",
    "gift": "Regalo",
    "private": "Privato",
    "recoveryPending": "{count} elemento/i del precedente acquisto selettivo attendono il ripristino.",
    "restoreNow": "Ripristina ora",
    "discardBackup": "Elimina backup",
    "discardConfirm": "Eliminare il backup di ripristino? Gli elementi rimossi non verranno ripristinati automaticamente.",
    "readingCart": "Lettura del carrello dell’account Steam…",
    "cartLoaded": "Caricati {count} elemento/i.",
    "cartEmpty": "Il carrello è vuoto.",
    "checkoutActive": "Acquisto selettivo attivo:",
    "checkoutBanner": "{count} elemento/i non selezionati vengono conservati per un ripristino sicuro. Dopo l’acquisto o l’annullamento, torna al carrello e ripristinali.",
    "returnRestore": "Torna al carrello e ripristina",
    "hide": "Nascondi",
    "menuRestore": "Cart Selection for Steam: ripristina elementi accantonati",
    "restoring": "Ripristino di {count} elemento/i…",
    "restored": "Ripristinati {count} elemento/i.",
    "restoreFailed": "Ripristino non riuscito: {error}",
    "loadFailed": "Caricamento non riuscito: {error}",
    "autoRestored": "Elementi accantonati ripristinati.",
    "autoRestoreFailed": "Ripristino automatico non riuscito: {error}",
    "noRecovery": "Nessun elemento accantonato da ripristinare.",
    "collapse": "Comprimi",
    "tokenMissing": "Impossibile trovare il token Web API della sessione Steam connessa.",
    "previousRecovery": "Elementi di un precedente acquisto selettivo attendono ancora il ripristino. Ripristinali prima.",
    "selectOne": "Seleziona almeno un elemento da acquistare.",
    "fallbackConfirm": "Per acquistare solo {selected} elemento/i, {parked} elemento/i non selezionati devono essere rimossi temporaneamente dal carrello dell’account. Per il ripristino vengono salvati solo ID e stato regalo/privato; il token di accesso non viene mai salvato. Continuare?",
    "error": "Errore: {error}"
  },
  "japanese": {
    "loading": "カートを読み込み中…",
    "selectAll": "すべて選択",
    "selectNone": "選択を解除",
    "refresh": "更新",
    "selectedCount": "{selected} / {total} 件を選択",
    "selectedTotal": "選択合計：{amount}",
    "priceUnavailable": "選択合計：価格を取得できません",
    "priceMissing": "選択合計：{amount} + 価格不明 {count} 件",
    "checkout": "選択した項目を購入",
    "processing": "処理中…",
    "gift": "ギフト",
    "private": "非公開",
    "recoveryPending": "前回の選択購入で {count} 件が復元待ちです。",
    "restoreNow": "今すぐ復元",
    "discardBackup": "バックアップを破棄",
    "discardConfirm": "復元バックアップを破棄しますか？削除された項目は自動復元されません。",
    "readingCart": "Steam アカウントのカートを読み込み中…",
    "cartLoaded": "カートの {count} 件を読み込みました。",
    "cartEmpty": "カートは空です。",
    "checkoutActive": "選択購入が有効：",
    "checkoutBanner": "未選択の {count} 件を安全に復元するため保持しています。購入完了またはキャンセル後、カートに戻って復元してください。",
    "returnRestore": "カートに戻って復元",
    "hide": "非表示",
    "menuRestore": "Cart Selection for Steam：保留項目を復元",
    "restoring": "保留中の {count} 件を復元中…",
    "restored": "{count} 件を復元しました。",
    "restoreFailed": "復元に失敗：{error}",
    "loadFailed": "読み込み失敗：{error}",
    "autoRestored": "保留項目を復元しました。",
    "autoRestoreFailed": "自動復元に失敗：{error}",
    "noRecovery": "復元する保留項目はありません。",
    "collapse": "折りたたむ",
    "tokenMissing": "ログイン済み Steam の Web API トークンが見つかりません。",
    "previousRecovery": "前回の選択購入から復元待ちの項目があります。先に復元してください。",
    "selectOne": "購入する項目を1つ以上選択してください。",
    "fallbackConfirm": "選択した {selected} 件だけを購入するため、未選択の {parked} 件をアカウントのカートから一時的に外します。復元用に項目 ID とギフト/非公開状態だけを保存し、ログイントークンは保存しません。続行しますか？",
    "error": "エラー：{error}"
  },
  "koreana": {
    "loading": "장바구니를 읽는 중…",
    "selectAll": "전체 선택",
    "selectNone": "전체 해제",
    "refresh": "새로고침",
    "selectedCount": "{selected} / {total}개 선택",
    "selectedTotal": "선택 합계: {amount}",
    "priceUnavailable": "선택 합계: 가격 정보를 불러오지 못함",
    "priceMissing": "선택 합계: {amount} + 가격 미확인 {count}개",
    "checkout": "선택 항목 결제",
    "processing": "처리 중…",
    "gift": "선물",
    "private": "비공개",
    "recoveryPending": "이전 선택 결제에서 미선택 항목 {count}개가 복원 대기 중입니다.",
    "restoreNow": "지금 복원",
    "discardBackup": "백업 폐기",
    "discardConfirm": "복원 백업을 삭제할까요? 제거된 항목은 자동으로 돌아오지 않습니다.",
    "readingCart": "Steam 계정 장바구니를 읽는 중…",
    "cartLoaded": "장바구니 {count}개를 불러왔습니다.",
    "cartEmpty": "장바구니가 비어 있습니다.",
    "checkoutActive": "선택 결제 활성화:",
    "checkoutBanner": "미선택 항목 {count}개를 안전 복원을 위해 보관 중입니다. 결제를 마쳤거나 취소했다면 장바구니로 돌아가 복원하세요.",
    "returnRestore": "장바구니로 돌아가 복원",
    "hide": "숨기기",
    "menuRestore": "Cart Selection for Steam: 보관 항목 복원",
    "restoring": "임시 보관 항목 {count}개를 복원 중…",
    "restored": "복원 완료: {count}개",
    "restoreFailed": "복원 실패: {error}",
    "loadFailed": "불러오기 실패: {error}",
    "autoRestored": "임시 보관 항목을 복원했습니다.",
    "autoRestoreFailed": "자동 복원 실패: {error}",
    "noRecovery": "복원할 임시 보관 항목이 없습니다.",
    "collapse": "접기",
    "tokenMissing": "로그인된 Steam Web API 토큰을 찾지 못했습니다.",
    "previousRecovery": "이전 선택 결제에서 복원 대기 중인 항목이 있습니다. 먼저 복원해 주세요.",
    "selectOne": "결제할 항목을 하나 이상 선택하세요.",
    "fallbackConfirm": "선택한 {selected}개만 결제하려면 미선택 {parked}개를 계정 장바구니에서 잠시 분리해야 합니다. 복원을 위해 상품 ID와 선물/비공개 상태만 저장하며 로그인 토큰은 저장하지 않습니다. 계속할까요?",
    "error": "오류: {error}"
  },
  "malay": {
    "loading": "Memuatkan troli…",
    "selectAll": "Pilih semua",
    "selectNone": "Kosongkan pilihan",
    "refresh": "Muat semula",
    "selectedCount": "{selected} / {total} dipilih",
    "selectedTotal": "Jumlah dipilih: {amount}",
    "priceUnavailable": "Jumlah dipilih: harga tidak tersedia",
    "priceMissing": "Jumlah dipilih: {amount} + {count} tanpa harga",
    "checkout": "Beli yang dipilih",
    "processing": "Memproses…",
    "gift": "Hadiah",
    "private": "Peribadi",
    "recoveryPending": "{count} item daripada pembelian terpilih sebelumnya menunggu dipulihkan.",
    "restoreNow": "Pulihkan sekarang",
    "discardBackup": "Buang sandaran",
    "discardConfirm": "Buang sandaran pemulihan? Item yang dibuang tidak akan dipulihkan secara automatik.",
    "readingCart": "Membaca troli akaun Steam…",
    "cartLoaded": "{count} item dimuatkan.",
    "cartEmpty": "Troli anda kosong.",
    "checkoutActive": "Pembelian terpilih aktif:",
    "checkoutBanner": "{count} item yang tidak dipilih disimpan untuk pemulihan selamat. Selepas membeli atau membatalkan, kembali ke troli dan pulihkannya.",
    "returnRestore": "Kembali ke troli dan pulihkan",
    "hide": "Sembunyikan",
    "menuRestore": "Cart Selection for Steam: pulihkan item yang disimpan",
    "restoring": "Memulihkan {count} item…",
    "restored": "{count} item dipulihkan.",
    "restoreFailed": "Pemulihan gagal: {error}",
    "loadFailed": "Gagal memuatkan: {error}",
    "autoRestored": "Item yang disimpan telah dipulihkan.",
    "autoRestoreFailed": "Pemulihan automatik gagal: {error}",
    "noRecovery": "Tiada item disimpan untuk dipulihkan.",
    "collapse": "Runtuhkan",
    "tokenMissing": "Token Web API sesi Steam yang telah log masuk tidak ditemui.",
    "previousRecovery": "Item daripada pembelian terpilih sebelumnya masih menunggu pemulihan. Pulihkannya dahulu.",
    "selectOne": "Pilih sekurang-kurangnya satu item untuk dibeli.",
    "fallbackConfirm": "Untuk membeli hanya {selected} item, {parked} item yang tidak dipilih perlu dibuang sementara daripada troli akaun. Hanya ID item dan status hadiah/peribadi disimpan untuk pemulihan; token log masuk tidak pernah disimpan. Teruskan?",
    "error": "Ralat: {error}"
  },
  "norwegian": {
    "loading": "Laster handlekurven…",
    "selectAll": "Velg alle",
    "selectNone": "Fjern valg",
    "refresh": "Oppdater",
    "selectedCount": "{selected} / {total} valgt",
    "selectedTotal": "Valgt totalsum: {amount}",
    "priceUnavailable": "Valgt totalsum: pris utilgjengelig",
    "priceMissing": "Valgt totalsum: {amount} + {count} uten pris",
    "checkout": "Kjøp valgte",
    "processing": "Behandler…",
    "gift": "Gave",
    "private": "Privat",
    "recoveryPending": "{count} vare(r) fra forrige selektive kjøp venter på gjenoppretting.",
    "restoreNow": "Gjenopprett nå",
    "discardBackup": "Forkast sikkerhetskopi",
    "discardConfirm": "Forkaste gjenopprettingskopien? Fjernede varer gjenopprettes ikke automatisk.",
    "readingCart": "Leser Steam-kontoens handlekurv…",
    "cartLoaded": "{count} vare(r) lastet.",
    "cartEmpty": "Handlekurven er tom.",
    "checkoutActive": "Selektivt kjøp aktivt:",
    "checkoutBanner": "{count} ikke-valgte vare(r) beholdes for sikker gjenoppretting. Etter kjøp eller avbrudd, gå tilbake til handlekurven og gjenopprett dem.",
    "returnRestore": "Tilbake til handlekurven og gjenopprett",
    "hide": "Skjul",
    "menuRestore": "Cart Selection for Steam: gjenopprett parkerte varer",
    "restoring": "Gjenoppretter {count} parkerte vare(r)…",
    "restored": "{count} vare(r) gjenopprettet.",
    "restoreFailed": "Gjenoppretting mislyktes: {error}",
    "loadFailed": "Lasting mislyktes: {error}",
    "autoRestored": "Parkerte varer gjenopprettet.",
    "autoRestoreFailed": "Automatisk gjenoppretting mislyktes: {error}",
    "noRecovery": "Ingen parkerte varer å gjenopprette.",
    "collapse": "Fold sammen",
    "tokenMissing": "Web API-tokenet for den innloggede Steam-økten ble ikke funnet.",
    "previousRecovery": "Varer fra et tidligere selektivt kjøp venter fortsatt på gjenoppretting. Gjenopprett dem først.",
    "selectOne": "Velg minst én vare å kjøpe.",
    "fallbackConfirm": "For å kjøpe bare {selected} vare(r) må {parked} ikke-valgte vare(r) midlertidig fjernes fra kontoens handlekurv. Bare vare-ID-er og gave-/privatstatus lagres for gjenoppretting; innloggingstokenet lagres aldri. Fortsette?",
    "error": "Feil: {error}"
  },
  "polish": {
    "loading": "Wczytywanie koszyka…",
    "selectAll": "Zaznacz wszystko",
    "selectNone": "Wyczyść zaznaczenie",
    "refresh": "Odśwież",
    "selectedCount": "Wybrano {selected} / {total}",
    "selectedTotal": "Suma wybranych: {amount}",
    "priceUnavailable": "Suma wybranych: cena niedostępna",
    "priceMissing": "Suma wybranych: {amount} + {count} bez ceny",
    "checkout": "Kup wybrane",
    "processing": "Przetwarzanie…",
    "gift": "Prezent",
    "private": "Prywatne",
    "recoveryPending": "{count} element(ów) z poprzedniego zakupu selektywnego oczekuje na przywrócenie.",
    "restoreNow": "Przywróć teraz",
    "discardBackup": "Usuń kopię",
    "discardConfirm": "Usunąć kopię odzyskiwania? Usunięte elementy nie zostaną przywrócone automatycznie.",
    "readingCart": "Odczytywanie koszyka konta Steam…",
    "cartLoaded": "Wczytano {count} element(ów).",
    "cartEmpty": "Koszyk jest pusty.",
    "checkoutActive": "Zakup selektywny aktywny:",
    "checkoutBanner": "{count} niewybranych element(ów) jest przechowywanych do bezpiecznego przywrócenia. Po zakupie lub anulowaniu wróć do koszyka i je przywróć.",
    "returnRestore": "Wróć do koszyka i przywróć",
    "hide": "Ukryj",
    "menuRestore": "Cart Selection for Steam: przywróć odłożone elementy",
    "restoring": "Przywracanie {count} odłożonych element(ów)…",
    "restored": "Przywrócono {count} element(ów).",
    "restoreFailed": "Nie udało się przywrócić: {error}",
    "loadFailed": "Nie udało się wczytać: {error}",
    "autoRestored": "Odłożone elementy przywrócono.",
    "autoRestoreFailed": "Automatyczne przywracanie nie powiodło się: {error}",
    "noRecovery": "Brak odłożonych elementów do przywrócenia.",
    "collapse": "Zwiń",
    "tokenMissing": "Nie znaleziono tokenu Web API zalogowanej sesji Steam.",
    "previousRecovery": "Elementy z poprzedniego zakupu selektywnego nadal czekają na przywrócenie. Najpierw je przywróć.",
    "selectOne": "Wybierz co najmniej jeden element do zakupu.",
    "fallbackConfirm": "Aby kupić tylko {selected} element(ów), trzeba tymczasowo usunąć z koszyka konta {parked} niewybranych element(ów). Do odzyskania zapisywane są wyłącznie identyfikatory i stany prezent/prywatne; token logowania nigdy nie jest zapisywany. Kontynuować?",
    "error": "Błąd: {error}"
  },
  "portuguese": {
    "loading": "A carregar o carrinho…",
    "selectAll": "Selecionar tudo",
    "selectNone": "Limpar seleção",
    "refresh": "Atualizar",
    "selectedCount": "{selected} / {total} selecionados",
    "selectedTotal": "Total selecionado: {amount}",
    "priceUnavailable": "Total selecionado: preço indisponível",
    "priceMissing": "Total selecionado: {amount} + {count} sem preço",
    "checkout": "Comprar selecionados",
    "processing": "A processar…",
    "gift": "Presente",
    "private": "Privado",
    "recoveryPending": "{count} item(ns) da compra seletiva anterior aguardam reposição.",
    "restoreNow": "Repor agora",
    "discardBackup": "Eliminar cópia",
    "discardConfirm": "Eliminar a cópia de reposição? Os itens removidos não serão repostos automaticamente.",
    "readingCart": "A ler o carrinho da sua conta Steam…",
    "cartLoaded": "{count} item(ns) carregado(s).",
    "cartEmpty": "O carrinho está vazio.",
    "checkoutActive": "Compra seletiva ativa:",
    "checkoutBanner": "{count} item(ns) não selecionado(s) estão guardados para reposição segura. Depois de concluir ou cancelar a compra, volte ao carrinho e reponha-os.",
    "returnRestore": "Voltar ao carrinho e repor",
    "hide": "Ocultar",
    "menuRestore": "Cart Selection for Steam: repor itens guardados",
    "restoring": "A repor {count} item(ns) guardado(s)…",
    "restored": "{count} item(ns) reposto(s).",
    "restoreFailed": "Falha ao repor: {error}",
    "loadFailed": "Falha ao carregar: {error}",
    "autoRestored": "Itens guardados repostos.",
    "autoRestoreFailed": "Falha na reposição automática: {error}",
    "noRecovery": "Não há itens guardados para repor.",
    "collapse": "Recolher",
    "tokenMissing": "Não foi possível encontrar o token Web API da sessão Steam iniciada.",
    "previousRecovery": "Ainda há itens de uma compra seletiva anterior por repor. Reponha-os primeiro.",
    "selectOne": "Selecione pelo menos um item para comprar.",
    "fallbackConfirm": "Para comprar apenas {selected} item(ns), {parked} item(ns) não selecionado(s) têm de ser removidos temporariamente do carrinho da conta. Apenas IDs e estados de presente/privado são guardados para reposição; o token de início de sessão nunca é guardado. Continuar?",
    "error": "Erro: {error}"
  },
  "brazilian": {
    "loading": "Carregando o carrinho…",
    "selectAll": "Selecionar tudo",
    "selectNone": "Limpar seleção",
    "refresh": "Atualizar",
    "selectedCount": "{selected} / {total} selecionados",
    "selectedTotal": "Total selecionado: {amount}",
    "priceUnavailable": "Total selecionado: preço indisponível",
    "priceMissing": "Total selecionado: {amount} + {count} sem preço",
    "checkout": "Comprar selecionados",
    "processing": "Processando…",
    "gift": "Presente",
    "private": "Privado",
    "recoveryPending": "{count} item(ns) da compra seletiva anterior aguardam restauração.",
    "restoreNow": "Restaurar agora",
    "discardBackup": "Descartar backup",
    "discardConfirm": "Descartar o backup de restauração? Os itens removidos não serão restaurados automaticamente.",
    "readingCart": "Lendo o carrinho da sua conta Steam…",
    "cartLoaded": "{count} item(ns) carregado(s).",
    "cartEmpty": "Seu carrinho está vazio.",
    "checkoutActive": "Compra seletiva ativa:",
    "checkoutBanner": "{count} item(ns) não selecionado(s) estão guardados para restauração segura. Após concluir ou cancelar a compra, volte ao carrinho e restaure-os.",
    "returnRestore": "Voltar ao carrinho e restaurar",
    "hide": "Ocultar",
    "menuRestore": "Cart Selection for Steam: restaurar itens guardados",
    "restoring": "Restaurando {count} item(ns) guardado(s)…",
    "restored": "{count} item(ns) restaurado(s).",
    "restoreFailed": "Falha ao restaurar: {error}",
    "loadFailed": "Falha ao carregar: {error}",
    "autoRestored": "Itens guardados restaurados.",
    "autoRestoreFailed": "Falha na restauração automática: {error}",
    "noRecovery": "Não há itens guardados para restaurar.",
    "collapse": "Recolher",
    "tokenMissing": "Não foi possível encontrar o token Web API da sessão Steam conectada.",
    "previousRecovery": "Ainda há itens de uma compra seletiva anterior aguardando restauração. Restaure-os primeiro.",
    "selectOne": "Selecione pelo menos um item para comprar.",
    "fallbackConfirm": "Para comprar apenas {selected} item(ns), {parked} item(ns) não selecionado(s) precisam ser removidos temporariamente do carrinho da conta. Apenas IDs e estados de presente/privado são salvos para restauração; o token de login nunca é salvo. Continuar?",
    "error": "Erro: {error}"
  },
  "romanian": {
    "loading": "Se încarcă coșul…",
    "selectAll": "Selectează tot",
    "selectNone": "Șterge selecția",
    "refresh": "Reîmprospătează",
    "selectedCount": "{selected} / {total} selectate",
    "selectedTotal": "Total selectat: {amount}",
    "priceUnavailable": "Total selectat: preț indisponibil",
    "priceMissing": "Total selectat: {amount} + {count} fără preț",
    "checkout": "Cumpără selecția",
    "processing": "Se procesează…",
    "gift": "Cadou",
    "private": "Privat",
    "recoveryPending": "{count} articol(e) din achiziția selectivă anterioară așteaptă restaurarea.",
    "restoreNow": "Restaurează acum",
    "discardBackup": "Elimină copia",
    "discardConfirm": "Elimini copia de restaurare? Articolele eliminate nu vor fi restaurate automat.",
    "readingCart": "Se citește coșul contului Steam…",
    "cartLoaded": "S-au încărcat {count} articol(e).",
    "cartEmpty": "Coșul este gol.",
    "checkoutActive": "Achiziție selectivă activă:",
    "checkoutBanner": "{count} articol(e) neselectate sunt păstrate pentru restaurare sigură. După cumpărare sau anulare, revino la coș și restaurează-le.",
    "returnRestore": "Revino la coș și restaurează",
    "hide": "Ascunde",
    "menuRestore": "Cart Selection for Steam: restaurează articolele puse deoparte",
    "restoring": "Se restaurează {count} articol(e)…",
    "restored": "S-au restaurat {count} articol(e).",
    "restoreFailed": "Restaurarea a eșuat: {error}",
    "loadFailed": "Încărcarea a eșuat: {error}",
    "autoRestored": "Articolele puse deoparte au fost restaurate.",
    "autoRestoreFailed": "Restaurarea automată a eșuat: {error}",
    "noRecovery": "Nu există articole puse deoparte de restaurat.",
    "collapse": "Restrânge",
    "tokenMissing": "Nu s-a găsit tokenul Web API al sesiunii Steam autentificate.",
    "previousRecovery": "Articole dintr-o achiziție selectivă anterioară încă așteaptă restaurarea. Restaurează-le mai întâi.",
    "selectOne": "Selectează cel puțin un articol pentru cumpărare.",
    "fallbackConfirm": "Pentru a cumpăra doar {selected} articol(e), {parked} articol(e) neselectate trebuie eliminate temporar din coșul contului. Pentru restaurare se salvează doar ID-urile și stările cadou/privat; tokenul de autentificare nu este salvat niciodată. Continui?",
    "error": "Eroare: {error}"
  },
  "russian": {
    "loading": "Загрузка корзины…",
    "selectAll": "Выбрать всё",
    "selectNone": "Снять выделение",
    "refresh": "Обновить",
    "selectedCount": "Выбрано {selected} из {total}",
    "selectedTotal": "Сумма выбранного: {amount}",
    "priceUnavailable": "Сумма выбранного: цена недоступна",
    "priceMissing": "Сумма выбранного: {amount} + без цены: {count}",
    "checkout": "Купить выбранное",
    "processing": "Обработка…",
    "gift": "Подарок",
    "private": "Скрыто",
    "recoveryPending": "{count} товар(ов) из предыдущей выборочной покупки ожидают восстановления.",
    "restoreNow": "Восстановить",
    "discardBackup": "Удалить резервную копию",
    "discardConfirm": "Удалить резервную копию восстановления? Удалённые товары не будут восстановлены автоматически.",
    "readingCart": "Чтение корзины аккаунта Steam…",
    "cartLoaded": "Загружено товаров: {count}.",
    "cartEmpty": "Корзина пуста.",
    "checkoutActive": "Выборочная покупка активна:",
    "checkoutBanner": "{count} невыбранных товар(ов) сохранены для безопасного восстановления. После завершения или отмены покупки вернитесь в корзину и восстановите их.",
    "returnRestore": "Вернуться в корзину и восстановить",
    "hide": "Скрыть",
    "menuRestore": "Cart Selection for Steam: восстановить отложенные товары",
    "restoring": "Восстановление {count} отложенных товар(ов)…",
    "restored": "Восстановлено товаров: {count}.",
    "restoreFailed": "Ошибка восстановления: {error}",
    "loadFailed": "Ошибка загрузки: {error}",
    "autoRestored": "Отложенные товары восстановлены.",
    "autoRestoreFailed": "Ошибка автоматического восстановления: {error}",
    "noRecovery": "Нет отложенных товаров для восстановления.",
    "collapse": "Свернуть",
    "tokenMissing": "Не удалось найти Web API-токен активной сессии Steam.",
    "previousRecovery": "Товары из предыдущей выборочной покупки всё ещё ожидают восстановления. Сначала восстановите их.",
    "selectOne": "Выберите хотя бы один товар для покупки.",
    "fallbackConfirm": "Чтобы купить только {selected} товар(ов), {parked} невыбранных товар(ов) нужно временно удалить из корзины аккаунта. Для восстановления сохраняются только ID и статусы подарка/приватности; токен входа никогда не сохраняется. Продолжить?",
    "error": "Ошибка: {error}"
  },
  "spanish": {
    "loading": "Cargando el carro…",
    "selectAll": "Seleccionar todo",
    "selectNone": "Quitar selección",
    "refresh": "Actualizar",
    "selectedCount": "{selected} / {total} seleccionados",
    "selectedTotal": "Total seleccionado: {amount}",
    "priceUnavailable": "Total seleccionado: precio no disponible",
    "priceMissing": "Total seleccionado: {amount} + {count} sin precio",
    "checkout": "Comprar selección",
    "processing": "Procesando…",
    "gift": "Regalo",
    "private": "Privado",
    "recoveryPending": "Hay {count} artículo(s) del pago selectivo anterior pendientes de restaurar.",
    "restoreNow": "Restaurar ahora",
    "discardBackup": "Descartar copia",
    "discardConfirm": "¿Descartar la copia de restauración? Los artículos eliminados no se restaurarán automáticamente.",
    "readingCart": "Leyendo el carro de tu cuenta de Steam…",
    "cartLoaded": "Se cargaron {count} artículo(s).",
    "cartEmpty": "Tu carro está vacío.",
    "checkoutActive": "Pago selectivo activo:",
    "checkoutBanner": "Se guardan {count} artículo(s) no seleccionados para restaurarlos de forma segura. Tras completar o cancelar el pago, vuelve al carro y restáuralos.",
    "returnRestore": "Volver al carro y restaurar",
    "hide": "Ocultar",
    "menuRestore": "Cart Selection for Steam: restaurar artículos apartados",
    "restoring": "Restaurando {count} artículo(s) apartados…",
    "restored": "Se restauraron {count} artículo(s).",
    "restoreFailed": "Error al restaurar: {error}",
    "loadFailed": "Error al cargar: {error}",
    "autoRestored": "Artículos apartados restaurados.",
    "autoRestoreFailed": "Error en la restauración automática: {error}",
    "noRecovery": "No hay artículos apartados para restaurar.",
    "collapse": "Contraer",
    "tokenMissing": "No se encontró el token Web API de la sesión iniciada en Steam.",
    "previousRecovery": "Aún hay artículos de un pago selectivo anterior pendientes de restaurar. Restáuralos primero.",
    "selectOne": "Selecciona al menos un artículo para comprar.",
    "fallbackConfirm": "Para comprar solo {selected} artículo(s), hay que retirar temporalmente {parked} artículo(s) no seleccionados del carro de la cuenta. Solo se guardan los ID y los estados de regalo/privado para restaurarlos; nunca se guarda el token de inicio de sesión. ¿Continuar?",
    "error": "Error: {error}"
  },
  "latam": {
    "loading": "Cargando el carrito…",
    "selectAll": "Seleccionar todo",
    "selectNone": "Quitar selección",
    "refresh": "Actualizar",
    "selectedCount": "{selected} / {total} seleccionados",
    "selectedTotal": "Total seleccionado: {amount}",
    "priceUnavailable": "Total seleccionado: precio no disponible",
    "priceMissing": "Total seleccionado: {amount} + {count} sin precio",
    "checkout": "Comprar selección",
    "processing": "Procesando…",
    "gift": "Regalo",
    "private": "Privado",
    "recoveryPending": "Hay {count} artículo(s) del pago selectivo anterior pendientes de restaurar.",
    "restoreNow": "Restaurar ahora",
    "discardBackup": "Descartar respaldo",
    "discardConfirm": "¿Descartar el respaldo de restauración? Los artículos eliminados no se restaurarán automáticamente.",
    "readingCart": "Leyendo el carrito de tu cuenta de Steam…",
    "cartLoaded": "Se cargaron {count} artículo(s).",
    "cartEmpty": "Tu carrito está vacío.",
    "checkoutActive": "Pago selectivo activo:",
    "checkoutBanner": "Se guardan {count} artículo(s) no seleccionados para restaurarlos de forma segura. Después de completar o cancelar el pago, vuelve al carrito y restáuralos.",
    "returnRestore": "Volver al carrito y restaurar",
    "hide": "Ocultar",
    "menuRestore": "Cart Selection for Steam: restaurar artículos apartados",
    "restoring": "Restaurando {count} artículo(s) apartados…",
    "restored": "Se restauraron {count} artículo(s).",
    "restoreFailed": "Error al restaurar: {error}",
    "loadFailed": "Error al cargar: {error}",
    "autoRestored": "Artículos apartados restaurados.",
    "autoRestoreFailed": "Error en la restauración automática: {error}",
    "noRecovery": "No hay artículos apartados para restaurar.",
    "collapse": "Contraer",
    "tokenMissing": "No se encontró el token Web API de la sesión iniciada en Steam.",
    "previousRecovery": "Todavía hay artículos de una compra selectiva anterior pendientes de restaurar. Restáuralos primero.",
    "selectOne": "Selecciona al menos un artículo para comprar.",
    "fallbackConfirm": "Para comprar solo {selected} artículo(s), hay que retirar temporalmente {parked} artículo(s) no seleccionados del carrito de la cuenta. Solo se guardan los ID y estados de regalo/privado para restaurarlos; nunca se guarda el token de inicio de sesión. ¿Continuar?",
    "error": "Error: {error}"
  },
  "swedish": {
    "loading": "Läser in kundvagnen…",
    "selectAll": "Markera alla",
    "selectNone": "Rensa markering",
    "refresh": "Uppdatera",
    "selectedCount": "{selected} / {total} valda",
    "selectedTotal": "Vald totalsumma: {amount}",
    "priceUnavailable": "Vald totalsumma: pris saknas",
    "priceMissing": "Vald totalsumma: {amount} + {count} utan pris",
    "checkout": "Köp valda",
    "processing": "Bearbetar…",
    "gift": "Gåva",
    "private": "Privat",
    "recoveryPending": "{count} objekt från föregående selektiva köp väntar på återställning.",
    "restoreNow": "Återställ nu",
    "discardBackup": "Kasta säkerhetskopia",
    "discardConfirm": "Kasta återställningskopian? Borttagna objekt återställs inte automatiskt.",
    "readingCart": "Läser Steam-kontots kundvagn…",
    "cartLoaded": "{count} objekt inlästa.",
    "cartEmpty": "Kundvagnen är tom.",
    "checkoutActive": "Selektivt köp aktivt:",
    "checkoutBanner": "{count} ej valda objekt sparas för säker återställning. Efter köp eller avbrott, återvänd till kundvagnen och återställ dem.",
    "returnRestore": "Till kundvagnen och återställ",
    "hide": "Dölj",
    "menuRestore": "Cart Selection for Steam: återställ parkerade objekt",
    "restoring": "Återställer {count} parkerade objekt…",
    "restored": "{count} objekt återställda.",
    "restoreFailed": "Återställning misslyckades: {error}",
    "loadFailed": "Inläsning misslyckades: {error}",
    "autoRestored": "Parkerade objekt återställda.",
    "autoRestoreFailed": "Automatisk återställning misslyckades: {error}",
    "noRecovery": "Inga parkerade objekt att återställa.",
    "collapse": "Fäll ihop",
    "tokenMissing": "Web API-token för den inloggade Steam-sessionen hittades inte.",
    "previousRecovery": "Objekt från ett tidigare selektivt köp väntar fortfarande på återställning. Återställ dem först.",
    "selectOne": "Välj minst ett objekt att köpa.",
    "fallbackConfirm": "För att bara köpa {selected} objekt måste {parked} ej valda objekt tillfälligt tas bort från kontots kundvagn. Endast objekt-ID och gåvo-/privatstatus sparas för återställning; inloggningstoken sparas aldrig. Fortsätta?",
    "error": "Fel: {error}"
  },
  "thai": {
    "loading": "กำลังโหลดรถเข็น…",
    "selectAll": "เลือกทั้งหมด",
    "selectNone": "ล้างการเลือก",
    "refresh": "รีเฟรช",
    "selectedCount": "เลือกแล้ว {selected} / {total}",
    "selectedTotal": "ยอดรวมที่เลือก: {amount}",
    "priceUnavailable": "ยอดรวมที่เลือก: ไม่พบราคา",
    "priceMissing": "ยอดรวมที่เลือก: {amount} + ไม่พบราคา {count} รายการ",
    "checkout": "ซื้อรายการที่เลือก",
    "processing": "กำลังดำเนินการ…",
    "gift": "ของขวัญ",
    "private": "ส่วนตัว",
    "recoveryPending": "มี {count} รายการจากการซื้อแบบเลือกครั้งก่อนรอการคืนค่า",
    "restoreNow": "คืนค่าตอนนี้",
    "discardBackup": "ลบข้อมูลสำรอง",
    "discardConfirm": "ลบข้อมูลสำรองสำหรับคืนค่าหรือไม่? รายการที่นำออกจะไม่ถูกคืนค่าอัตโนมัติ",
    "readingCart": "กำลังอ่านรถเข็นบัญชี Steam…",
    "cartLoaded": "โหลดแล้ว {count} รายการ",
    "cartEmpty": "รถเข็นว่างเปล่า",
    "checkoutActive": "เปิดการซื้อแบบเลือก:",
    "checkoutBanner": "เก็บ {count} รายการที่ไม่ได้เลือกไว้เพื่อคืนค่าอย่างปลอดภัย หลังซื้อหรือยกเลิก ให้กลับมาที่รถเข็นและคืนค่ารายการเหล่านั้น",
    "returnRestore": "กลับรถเข็นและคืนค่า",
    "hide": "ซ่อน",
    "menuRestore": "Cart Selection for Steam: คืนค่ารายการที่พักไว้",
    "restoring": "กำลังคืนค่า {count} รายการ…",
    "restored": "คืนค่าแล้ว {count} รายการ",
    "restoreFailed": "คืนค่าไม่สำเร็จ: {error}",
    "loadFailed": "โหลดไม่สำเร็จ: {error}",
    "autoRestored": "คืนค่ารายการที่พักไว้แล้ว",
    "autoRestoreFailed": "คืนค่าอัตโนมัติไม่สำเร็จ: {error}",
    "noRecovery": "ไม่มีรายการที่พักไว้ให้คืนค่า",
    "collapse": "ย่อ",
    "tokenMissing": "ไม่พบโทเค็น Web API ของเซสชัน Steam ที่เข้าสู่ระบบ",
    "previousRecovery": "ยังมีรายการจากการซื้อแบบเลือกครั้งก่อนรอการคืนค่า โปรดคืนค่าก่อน",
    "selectOne": "เลือกอย่างน้อยหนึ่งรายการเพื่อซื้อ",
    "fallbackConfirm": "หากต้องการซื้อเพียง {selected} รายการ จะต้องนำ {parked} รายการที่ไม่ได้เลือกออกจากรถเข็นบัญชีชั่วคราว โดยเก็บเฉพาะ ID และสถานะของขวัญ/ส่วนตัวเพื่อคืนค่า และไม่เก็บโทเค็นเข้าสู่ระบบ ดำเนินการต่อหรือไม่?",
    "error": "ข้อผิดพลาด: {error}"
  },
  "turkish": {
    "loading": "Sepet yükleniyor…",
    "selectAll": "Tümünü seç",
    "selectNone": "Seçimi temizle",
    "refresh": "Yenile",
    "selectedCount": "{selected} / {total} seçildi",
    "selectedTotal": "Seçilen toplam: {amount}",
    "priceUnavailable": "Seçilen toplam: fiyat kullanılamıyor",
    "priceMissing": "Seçilen toplam: {amount} + {count} fiyat bilinmiyor",
    "checkout": "Seçilenleri satın al",
    "processing": "İşleniyor…",
    "gift": "Hediye",
    "private": "Gizli",
    "recoveryPending": "Önceki seçmeli satın alımdan {count} öğe geri yüklenmeyi bekliyor.",
    "restoreNow": "Şimdi geri yükle",
    "discardBackup": "Yedeği sil",
    "discardConfirm": "Geri yükleme yedeği silinsin mi? Kaldırılan öğeler otomatik geri yüklenmez.",
    "readingCart": "Steam hesap sepetiniz okunuyor…",
    "cartLoaded": "{count} sepet öğesi yüklendi.",
    "cartEmpty": "Sepetiniz boş.",
    "checkoutActive": "Seçmeli satın alma etkin:",
    "checkoutBanner": "{count} seçilmeyen öğe güvenli geri yükleme için saklanıyor. Satın almayı tamamladıktan veya iptal ettikten sonra sepete dönüp geri yükleyin.",
    "returnRestore": "Sepete dön ve geri yükle",
    "hide": "Gizle",
    "menuRestore": "Cart Selection for Steam: bekletilen öğeleri geri yükle",
    "restoring": "{count} bekletilen öğe geri yükleniyor…",
    "restored": "{count} öğe geri yüklendi.",
    "restoreFailed": "Geri yükleme başarısız: {error}",
    "loadFailed": "Yükleme başarısız: {error}",
    "autoRestored": "Bekletilen öğeler geri yüklendi.",
    "autoRestoreFailed": "Otomatik geri yükleme başarısız: {error}",
    "noRecovery": "Geri yüklenecek bekletilen öğe yok.",
    "collapse": "Daralt",
    "tokenMissing": "Oturum açılmış Steam Web API belirteci bulunamadı.",
    "previousRecovery": "Önceki seçmeli satın alımdan öğeler hâlâ geri yüklenmeyi bekliyor. Önce onları geri yükleyin.",
    "selectOne": "Satın almak için en az bir öğe seçin.",
    "fallbackConfirm": "Yalnızca {selected} öğeyi satın almak için {parked} seçilmeyen öğe hesap sepetinden geçici olarak kaldırılmalıdır. Geri yükleme için yalnızca öğe kimlikleri ve hediye/gizli durumu saklanır; giriş belirteci asla saklanmaz. Devam edilsin mi?",
    "error": "Hata: {error}"
  },
  "ukrainian": {
    "loading": "Завантаження кошика…",
    "selectAll": "Вибрати все",
    "selectNone": "Зняти вибір",
    "refresh": "Оновити",
    "selectedCount": "Вибрано {selected} з {total}",
    "selectedTotal": "Сума вибраного: {amount}",
    "priceUnavailable": "Сума вибраного: ціна недоступна",
    "priceMissing": "Сума вибраного: {amount} + без ціни: {count}",
    "checkout": "Придбати вибране",
    "processing": "Обробка…",
    "gift": "Подарунок",
    "private": "Приватне",
    "recoveryPending": "{count} товар(ів) із попередньої вибіркової покупки очікують відновлення.",
    "restoreNow": "Відновити зараз",
    "discardBackup": "Видалити резервну копію",
    "discardConfirm": "Видалити резервну копію відновлення? Вилучені товари не буде відновлено автоматично.",
    "readingCart": "Читання кошика вашого акаунта Steam…",
    "cartLoaded": "Завантажено товарів: {count}.",
    "cartEmpty": "Ваш кошик порожній.",
    "checkoutActive": "Вибіркова покупка активна:",
    "checkoutBanner": "{count} невибраних товар(ів) збережено для безпечного відновлення. Після завершення або скасування покупки поверніться до кошика та відновіть їх.",
    "returnRestore": "Повернутися до кошика й відновити",
    "hide": "Сховати",
    "menuRestore": "Cart Selection for Steam: відновити відкладені товари",
    "restoring": "Відновлення {count} відкладених товар(ів)…",
    "restored": "Відновлено товарів: {count}.",
    "restoreFailed": "Помилка відновлення: {error}",
    "loadFailed": "Помилка завантаження: {error}",
    "autoRestored": "Відкладені товари відновлено.",
    "autoRestoreFailed": "Помилка автоматичного відновлення: {error}",
    "noRecovery": "Немає відкладених товарів для відновлення.",
    "collapse": "Згорнути",
    "tokenMissing": "Не вдалося знайти Web API-токен активної сесії Steam.",
    "previousRecovery": "Товари з попередньої вибіркової покупки все ще очікують відновлення. Спочатку відновіть їх.",
    "selectOne": "Виберіть принаймні один товар для покупки.",
    "fallbackConfirm": "Щоб придбати лише {selected} товар(ів), {parked} невибраних товар(ів) потрібно тимчасово вилучити з кошика акаунта. Для відновлення зберігаються лише ID та стани подарунка/приватності; токен входу ніколи не зберігається. Продовжити?",
    "error": "Помилка: {error}"
  },
  "vietnamese": {
    "loading": "Đang tải giỏ hàng…",
    "selectAll": "Chọn tất cả",
    "selectNone": "Bỏ chọn",
    "refresh": "Làm mới",
    "selectedCount": "Đã chọn {selected} / {total}",
    "selectedTotal": "Tổng đã chọn: {amount}",
    "priceUnavailable": "Tổng đã chọn: không có giá",
    "priceMissing": "Tổng đã chọn: {amount} + {count} mục chưa có giá",
    "checkout": "Mua mục đã chọn",
    "processing": "Đang xử lý…",
    "gift": "Quà tặng",
    "private": "Riêng tư",
    "recoveryPending": "{count} mục từ lần mua chọn lọc trước đang chờ khôi phục.",
    "restoreNow": "Khôi phục ngay",
    "discardBackup": "Xóa bản sao lưu",
    "discardConfirm": "Xóa bản sao khôi phục? Các mục đã gỡ sẽ không tự động được khôi phục.",
    "readingCart": "Đang đọc giỏ hàng tài khoản Steam…",
    "cartLoaded": "Đã tải {count} mục.",
    "cartEmpty": "Giỏ hàng trống.",
    "checkoutActive": "Mua chọn lọc đang hoạt động:",
    "checkoutBanner": "{count} mục không được chọn đang được giữ để khôi phục an toàn. Sau khi mua hoặc hủy, hãy quay lại giỏ hàng và khôi phục chúng.",
    "returnRestore": "Quay lại giỏ hàng và khôi phục",
    "hide": "Ẩn",
    "menuRestore": "Cart Selection for Steam: khôi phục mục đã giữ",
    "restoring": "Đang khôi phục {count} mục…",
    "restored": "Đã khôi phục {count} mục.",
    "restoreFailed": "Khôi phục thất bại: {error}",
    "loadFailed": "Tải thất bại: {error}",
    "autoRestored": "Đã khôi phục các mục được giữ.",
    "autoRestoreFailed": "Khôi phục tự động thất bại: {error}",
    "noRecovery": "Không có mục được giữ để khôi phục.",
    "collapse": "Thu gọn",
    "tokenMissing": "Không tìm thấy token Web API của phiên Steam đã đăng nhập.",
    "previousRecovery": "Các mục từ lần mua chọn lọc trước vẫn đang chờ khôi phục. Hãy khôi phục chúng trước.",
    "selectOne": "Chọn ít nhất một mục để mua.",
    "fallbackConfirm": "Để chỉ mua {selected} mục, cần tạm thời gỡ {parked} mục không được chọn khỏi giỏ hàng tài khoản. Chỉ ID và trạng thái quà tặng/riêng tư được lưu để khôi phục; token đăng nhập không bao giờ được lưu. Tiếp tục?",
    "error": "Lỗi: {error}"
  }
};

  const BROWSER_TO_STEAM_LANGUAGE = {
    ar: 'arabic', bg: 'bulgarian', zh: 'schinese', cs: 'czech', da: 'danish', nl: 'dutch', en: 'english',
    fi: 'finnish', fr: 'french', de: 'german', el: 'greek', hu: 'hungarian', id: 'indonesian', it: 'italian',
    ja: 'japanese', ko: 'koreana', ms: 'malay', no: 'norwegian', pl: 'polish', pt: 'portuguese', ro: 'romanian',
    ru: 'russian', es: 'spanish', sv: 'swedish', th: 'thai', tr: 'turkish', uk: 'ukrainian', vi: 'vietnamese'
  };

  function normalizeSteamLanguage(value) {
    const raw = String(value || '').toLowerCase().replace('_', '-');
    if (I18N[raw]) return raw;
    if (raw === 'pt-br' || raw === 'pt-brasil') return 'brazilian';
    if (raw === 'es-419' || raw === 'es-mx' || raw === 'es-ar' || raw === 'es-cl') return 'latam';
    if (raw === 'zh-tw' || raw === 'zh-hk' || raw === 'zh-hant') return 'tchinese';
    if (raw === 'zh-cn' || raw === 'zh-sg' || raw === 'zh-hans') return 'schinese';
    const base = raw.split('-')[0];
    return BROWSER_TO_STEAM_LANGUAGE[base] || 'english';
  }

  function detectInitialLanguage() {
    const fromQuery = new URL(location.href).searchParams.get('l');
    if (fromQuery && I18N[fromQuery]) return fromQuery;
    const saved = GM_getValue(LANGUAGE_KEY, '');
    if (saved && I18N[saved]) return saved;
    const cfg = readConfig();
    if (cfg?.language) return normalizeSteamLanguage(cfg.language);
    return normalizeSteamLanguage(document.documentElement.lang || navigator.language || 'english');
  }

  let uiLanguage = 'english';

  function t(key, vars = {}) {
    const table = I18N[uiLanguage] || I18N.english;
    let text = table[key] ?? I18N.english[key] ?? key;
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }

  const state = {
    config: null,
    cart: null,
    items: [],
    selected: new Set(),
    busy: false,
    metadata: new Map(),
    metadataAuthenticated: false,
  };

  GM_addStyle(`
    #${UI_ID}, #${CHECKOUT_UI_ID} {
      font-family: Motiva Sans, Arial, Helvetica, sans-serif;
      box-sizing: border-box;
      color: #d6d7d8;
    }
    #${UI_ID} * , #${CHECKOUT_UI_ID} * { box-sizing: border-box; }
    #${UI_ID} {
      position: fixed;
      right: 22px;
      bottom: 22px;
      width: min(430px, calc(100vw - 44px));
      max-height: min(72vh, 760px);
      z-index: 2147483600;
      background: linear-gradient(180deg, rgba(31, 43, 57, .98), rgba(20, 29, 38, .98));
      border: 1px solid rgba(103, 193, 245, .35);
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(0,0,0,.5);
      overflow: hidden;
    }
    #${UI_ID}.ssc-collapsed .ssc-body { display: none; }
    #${UI_ID} .ssc-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(12, 20, 28, .72);
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    #${UI_ID} .ssc-title { font-size: 15px; font-weight: 700; color: #fff; }
    #${UI_ID} .ssc-subtitle { font-size: 11px; color: #8f98a0; margin-top: 2px; }
    #${UI_ID} .ssc-icon-btn {
      border: 0; background: transparent; color: #c7d5e0; cursor: pointer;
      font-size: 18px; line-height: 1; padding: 4px 6px; border-radius: 4px;
    }
    #${UI_ID} .ssc-icon-btn:hover { background: rgba(255,255,255,.08); }
    #${UI_ID} .ssc-body { padding: 12px; overflow: auto; max-height: calc(min(72vh, 760px) - 56px); }
    #${UI_ID} .ssc-status {
      padding: 9px 10px; margin-bottom: 10px; border-radius: 5px;
      background: rgba(0,0,0,.20); color: #acb2b8; font-size: 12px; line-height: 1.45;
    }
    #${UI_ID} .ssc-status.warn { background: rgba(190, 122, 0, .16); color: #e6b56a; }
    #${UI_ID} .ssc-status.error { background: rgba(190, 42, 42, .16); color: #ff9b9b; }
    #${UI_ID} .ssc-status.ok { background: rgba(70, 140, 70, .17); color: #9ee6a0; }
    #${UI_ID} .ssc-toolbar { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
    #${UI_ID} button.ssc-btn {
      border: 0; border-radius: 3px; cursor: pointer; padding: 7px 10px;
      background: linear-gradient(90deg, #75b022, #588a1b); color: #d2efa9;
      font-size: 12px; font-weight: 600;
    }
    #${UI_ID} button.ssc-btn:hover { filter: brightness(1.08); }
    #${UI_ID} button.ssc-btn.secondary { background: #3d4d5d; color: #d6d7d8; }
    #${UI_ID} button.ssc-btn.danger { background: #704242; color: #ffd4d4; }
    #${UI_ID} button.ssc-btn:disabled { opacity: .45; cursor: default; filter: none; }
    #${UI_ID} .ssc-list { display: flex; flex-direction: column; gap: 7px; }
    #${UI_ID} .ssc-item {
      display: grid; grid-template-columns: 22px minmax(0,1fr) auto; gap: 9px;
      align-items: center; padding: 9px 10px; border-radius: 5px;
      background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.045);
    }
    #${UI_ID} .ssc-item:hover { background: rgba(255,255,255,.055); }
    #${UI_ID} .ssc-item input { width: 16px; height: 16px; accent-color: #66c0f4; }
    #${UI_ID} .ssc-item-name { color: #e6f0f7; font-size: 12px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; }
    #${UI_ID} .ssc-item-meta { margin-top: 3px; color: #8f98a0; font-size: 10px; }
    #${UI_ID} .ssc-item-price { color: #c7d5e0; font-size: 11px; white-space: nowrap; }
    #${UI_ID} .ssc-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      margin-top: 11px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.07);
    }
    #${UI_ID} .ssc-summary { min-width: 0; }
    #${UI_ID} .ssc-count { color: #acb2b8; font-size: 12px; }
    #${UI_ID} .ssc-total { color: #fff; font-size: 14px; font-weight: 700; margin-top: 3px; }
    #${UI_ID} .ssc-total.incomplete { color: #e6b56a; font-size: 11px; font-weight: 500; }
    #${UI_ID} .ssc-checkout { padding: 9px 14px !important; font-size: 13px !important; }
    #${CHECKOUT_UI_ID} {
      position: fixed; left: 50%; transform: translateX(-50%); top: 14px;
      z-index: 2147483640; width: min(720px, calc(100vw - 30px));
      padding: 11px 12px; border-radius: 7px; background: rgba(20, 29, 38, .97);
      border: 1px solid rgba(103,193,245,.42); box-shadow: 0 8px 28px rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    #${CHECKOUT_UI_ID} .ssc-checkout-text { color: #c7d5e0; font-size: 12px; line-height: 1.45; }
    #${CHECKOUT_UI_ID} .ssc-checkout-actions { display: flex; gap: 7px; flex-shrink: 0; }
    #${CHECKOUT_UI_ID} button { border: 0; border-radius: 3px; padding: 7px 10px; cursor: pointer; font-size: 11px; }
    #${CHECKOUT_UI_ID} .restore { background: #66c0f4; color: #10202d; font-weight: 700; }
    #${CHECKOUT_UI_ID} .dismiss { background: #3d4d5d; color: #d6d7d8; }
  `);

  function log(...args) {
    console.log(`[${SCRIPT_NAME}]`, ...args);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function safeJson(raw, fallback = {}) {
    try { return JSON.parse(raw || '{}'); } catch { return fallback; }
  }

  function readConfig() {
    const el = document.querySelector('#application_config');
    if (!el) return null;
    const base = safeJson(el.getAttribute('data-config'));
    const user = safeJson(el.getAttribute('data-store_user_config'));
    return {
      token: user.webapi_token || null,
      steamid: String(user.steamid || user.STEAMID || user.steam_id || ''),
      country: base.COUNTRY || base.country || 'KR',
      language: base.LANGUAGE || base.language || 'koreana',
    };
  }

  async function waitForConfig(timeoutMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const cfg = readConfig();
      if (cfg?.token) return cfg;
      await sleep(200);
    }
    return readConfig();
  }

  function gmRequest({ method = 'GET', url, headers = {}, data = undefined, timeout = 15000 }) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data,
        timeout,
        onload: response => {
          const result = {
            status: response.status,
            text: response.responseText || '',
            json: null,
          };
          try { result.json = JSON.parse(result.text); } catch {}
          if (response.status >= 200 && response.status < 300) resolve(result);
          else reject(new Error(`HTTP ${response.status}: ${result.text.slice(0, 240)}`));
        },
        onerror: () => reject(new Error(`Network error: ${url}`)),
        ontimeout: () => reject(new Error(`Request timeout: ${url}`)),
      });
    });
  }

  function apiUrl(serviceMethod, token) {
    const sep = serviceMethod.includes('?') ? '&' : '?';
    return `${API_BASE}/${serviceMethod}${sep}access_token=${encodeURIComponent(token)}`;
  }

  async function apiGet(serviceMethod, token, input = null) {
    let url = apiUrl(serviceMethod, token);
    if (input) url += `&input_json=${encodeURIComponent(JSON.stringify(input))}`;
    const r = await gmRequest({ method: 'GET', url });
    return r.json || {};
  }

  async function apiPost(serviceMethod, token, input = {}) {
    const body = `input_json=${encodeURIComponent(JSON.stringify(input))}`;
    const r = await gmRequest({
      method: 'POST',
      url: apiUrl(serviceMethod, token),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      data: body,
    });
    return r.json || {};
  }

  async function getAccountCart() {
    const data = await apiGet('IAccountCartService/GetCart/v1/', state.config.token, {
      user_country: state.config.country,
    });
    const cart = data?.response?.cart;
    if (!cart) throw new Error('Steam account cart response did not contain a cart.');
    return cart;
  }

  function lineKey(item) {
    if (item.packageid) return `p:${item.packageid}`;
    if (item.bundleid) return `b:${item.bundleid}`;
    return `l:${item.line_item_id || item.lineitemid || Math.random()}`;
  }

  function lineItemId(item) {
    return String(item.line_item_id ?? item.lineitemid ?? '');
  }

  function cartGid(cart) {
    const gid = cart.gidshoppingcart ?? cart.gid_shopping_cart ?? cart.gid ?? null;
    return gid == null ? null : String(gid);
  }

  function normalizeFlags(item) {
    return {
      is_gift: Boolean(item?.flags?.is_gift),
      is_private: Boolean(item?.flags?.is_private),
    };
  }

  function backupItem(item) {
    return {
      packageid: item.packageid || undefined,
      bundleid: item.bundleid || undefined,
      gift_info: item.gift_info || null,
      flags: normalizeFlags(item),
    };
  }

  function navData() {
    return {
      domain: 'store.steampowered.com',
      controller: 'cart',
      method: 'default',
      submethod: '',
      feature: 'cart-selection-for-steam',
      depth: 1,
      countrycode: state.config.country,
      webkey: 0,
      is_client: false,
      curator_data: { clanid: null, listid: null },
      is_likely_bot: false,
      is_utm: false,
    };
  }

  async function removeAccountItem(item) {
    const id = lineItemId(item);
    if (!id) throw new Error('Cart line item has no line_item_id.');
    return apiPost('IAccountCartService/RemoveItemFromCart/v1/', state.config.token, {
      line_item_id: id,
      user_country: state.config.country,
    });
  }

  async function addAccountItems(items) {
    if (!items.length) return null;
    return apiPost('IAccountCartService/AddItemsToCart/v1/', state.config.token, {
      user_country: state.config.country,
      items: items.map(item => ({
        ...(item.packageid ? { packageid: Number(item.packageid) } : {}),
        ...(item.bundleid ? { bundleid: Number(item.bundleid) } : {}),
        gift_info: item.gift_info || null,
        flags: {
          is_gift: Boolean(item.flags?.is_gift),
          is_private: Boolean(item.flags?.is_private),
        },
      })),
      navdata: navData(),
    });
  }

  async function fetchMetadata(items) {
    state.metadataAuthenticated = false;
    const ids = items.flatMap(item => {
      if (item.packageid) return [{ packageid: Number(item.packageid) }];
      if (item.bundleid) return [{ bundleid: Number(item.bundleid) }];
      return [];
    });
    if (!ids.length) return new Map();

    try {
      const input = {
        ids,
        context: {
          language: state.config.language,
          country_code: state.config.country,
        },
        data_request: {
          include_all_purchase_options: true,
          include_release: true,
          include_assets: true,
        },
      };

      // This request MUST be authenticated. Unauthenticated StoreBrowse prices are
      // generic store prices and can miss account-specific loyalty/ownership offers.
      const url = `${apiUrl('IStoreBrowseService/GetItems/v1/', state.config.token)}&input_json=${encodeURIComponent(JSON.stringify(input))}`;
      const r = await gmRequest({ method: 'GET', url });
      const storeItems = r.json?.response?.store_items || [];
      const result = new Map();

      function optionKey(opt) {
        if (opt?.packageid) return `p:${opt.packageid}`;
        if (opt?.bundleid) return `b:${opt.bundleid}`;
        return null;
      }

      function storeOption(storeItem, opt, priority) {
        const key = optionKey(opt);
        if (!key) return;
        const previous = result.get(key);
        if (previous && previous._priority > priority) return;

        const activeDiscounts = Array.isArray(opt.active_discounts) ? opt.active_discounts : [];
        result.set(key, {
          _priority: priority,
          appid: storeItem.appid,
          name: storeItem.name || opt.purchase_option_name ||
            (opt.packageid ? `Package ${opt.packageid}` : `Bundle ${opt.bundleid}`),
          optionName: opt.purchase_option_name || '',
          price: opt.formatted_final_price || opt.formatted_original_price || '',
          finalPriceMinor: Number.isFinite(Number(opt.final_price_in_cents)) ? Number(opt.final_price_in_cents) : null,
          originalPriceMinor: Number.isFinite(Number(opt.original_price_in_cents)) ? Number(opt.original_price_in_cents) : null,
          discountPct: Number.isFinite(Number(opt.discount_pct)) ? Number(opt.discount_pct) : 0,
          activeDiscounts,
          hasConditionalDiscount: activeDiscounts.some(d => Number(d?.master_sub_appid || 0) > 0),
          isComingSoon: Boolean(storeItem.release?.is_coming_soon || storeItem.is_coming_soon),
        });
      }

      for (const storeItem of storeItems) {
        // self_purchase_option is the most useful result for logged-in users because
        // it is resolved for the current account. Keep it ahead of generic options.
        storeOption(storeItem, storeItem.self_purchase_option, 3);
        storeOption(storeItem, storeItem.best_purchase_option, 2);
        for (const opt of (storeItem.purchase_options || [])) storeOption(storeItem, opt, 1);
      }
      state.metadataAuthenticated = true;
      return result;
    } catch (e) {
      state.metadataAuthenticated = false;
      log('Authenticated metadata lookup failed; account-cart fallback will be preferred.', e);
      return new Map();
    }
  }

  function getRecovery() {
    const current = GM_getValue(RECOVERY_KEY, null);
    if (current) return current;
    const legacy = GM_getValue(LEGACY_RECOVERY_KEY, null);
    if (legacy) {
      GM_setValue(RECOVERY_KEY, legacy);
      GM_deleteValue(LEGACY_RECOVERY_KEY);
      return legacy;
    }
    return null;
  }

  function setRecovery(value) {
    GM_setValue(RECOVERY_KEY, value);
    GM_deleteValue(LEGACY_RECOVERY_KEY);
  }

  function clearRecovery() {
    GM_deleteValue(RECOVERY_KEY);
    GM_deleteValue(LEGACY_RECOVERY_KEY);
  }

  async function rollbackRemoved(recovery) {
    if (!recovery?.items?.length) return;
    await addAccountItems(recovery.items);
    clearRecovery();
  }

  async function restoreRecovery({ quiet = false } = {}) {
    const recovery = getRecovery();
    if (!recovery?.items?.length) {
      if (!quiet) setStatus(t('noRecovery'), 'ok');
      return true;
    }

    if (!state.config?.token) state.config = await waitForConfig();
    if (!state.config?.token) throw new Error(t('tokenMissing'));

    setStatus(t('restoring', { count: recovery.items.length }));

    // Avoid re-adding something that is already present in the current account cart.
    const current = await getAccountCart();
    const existing = new Set((current.line_items || []).map(lineKey));
    const remaining = recovery.items.filter(item => !existing.has(lineKey(item)));

    if (remaining.length) await addAccountItems(remaining);
    clearRecovery();

    if (!quiet) setStatus(t('restored', { count: recovery.items.length }), 'ok');
    return true;
  }

  function canUseDirectCart(items) {
    // Temporary carts are preferable for ordinary products because they leave the
    // account cart untouched. Do NOT use them for coming-soon/prepurchase items or
    // conditional ownership discounts: those must stay on the signed-in account cart
    // so Steam can evaluate loyalty/ownership eligibility during checkout.
    if (!state.metadataAuthenticated) return false;
    return items.length > 0 && items.every(item => {
      const flags = normalizeFlags(item);
      const meta = state.metadata.get(lineKey(item));
      const requiresAccountPricing = Boolean(meta?.isComingSoon || meta?.hasConditionalDiscount || meta?.activeDiscounts?.length);
      return Boolean(item.packageid || item.bundleid) &&
        !flags.is_gift && !flags.is_private && !requiresAccountPricing;
    });
  }

  function packageCostWhenAdded(item) {
    const p = item?.price_when_added;
    const amount = p?.amount_in_cents;
    const currency = p?.currency_code;
    if (amount == null || currency == null) return null;
    return {
      amount: String(amount),
      currencycode: Number(currency),
    };
  }

  async function tryDirectTemporaryCart(items) {
    if (!canUseDirectCart(items)) return null;

    try {
      const createInput = {};
      if (/^\d{17}$/.test(state.config.steamid)) createInput.steamid_requester = state.config.steamid;

      const created = await apiPost(
        'IShoppingCartService/CreateNewShoppingCart/v1/',
        state.config.token,
        createInput,
      );
      const gid = created?.response?.gidshoppingcart;
      if (!gid) return null;

      const packages = items.filter(item => item.packageid);
      const bundles = items.filter(item => item.bundleid);

      if (packages.length) {
        const cartItems = packages.map(item => {
          const costwhenadded = packageCostWhenAdded(item);
          return {
            packageid: Number(item.packageid),
            ...(costwhenadded ? { costwhenadded } : {}),
            is_gift: false,
            quantity: 1,
          };
        });

        const addPackages = await apiPost(
          'IShoppingCartService/AddPackages/v1/',
          state.config.token,
          {
            gidshoppingcart: String(gid),
            store_country_code: state.config.country,
            cart_items: cartItems,
          },
        );
        log('Temporary cart AddPackages response', addPackages?.response || addPackages);
      }

      for (const item of bundles) {
        const addBundle = await apiPost('IShoppingCartService/AddBundle/v1/', state.config.token, {
          gidshoppingcart: String(gid),
          bundleid: Number(item.bundleid),
          store_country: state.config.country,
          quantity: 1,
        });
        log('Temporary cart AddBundle response', addBundle?.response || addBundle);
      }

      const verify = await apiGet(
        'IShoppingCartService/GetShoppingCartContents/v1/',
        state.config.token,
        { gidshoppingcart: String(gid) },
      );
      const contents = verify?.response?.contents;
      const lineItems = contents?.lineitems || contents?.line_items || [];
      if (!contents) throw new Error('Temporary cart returned no contents.');

      const actualPackageIds = new Set();
      const actualBundleIds = new Set();
      for (const line of lineItems) {
        const pkg = line.package_item || line.packageitem;
        const bundle = line.bundle_item || line.bundleitem;
        if (pkg?.packageid) actualPackageIds.add(String(pkg.packageid));
        if (bundle?.bundleid) actualBundleIds.add(String(bundle.bundleid));
      }

      const expectedPackageIds = new Set(packages.map(item => String(item.packageid)));
      const expectedBundleIds = new Set(bundles.map(item => String(item.bundleid)));
      const missingPackages = [...expectedPackageIds].filter(id => !actualPackageIds.has(id));
      const missingBundles = [...expectedBundleIds].filter(id => !actualBundleIds.has(id));

      if (missingPackages.length || missingBundles.length) {
        throw new Error(
          `Temporary cart verification failed; missing package(s): ${missingPackages.join(', ') || '-'}, ` +
          `bundle(s): ${missingBundles.join(', ') || '-'}`
        );
      }

      log('Temporary cart verified', {
        gid: String(gid),
        expectedPackages: [...expectedPackageIds],
        actualPackages: [...actualPackageIds],
        expectedBundles: [...expectedBundleIds],
        actualBundles: [...actualBundleIds],
      });
      return String(gid);
    } catch (e) {
      log('Temporary cart unavailable or incomplete; account-cart fallback will be used.', e);
      return null;
    }
  }

  function checkoutUrl(gid) {
    const u = new URL(CHECKOUT_BASE);
    u.searchParams.set('purchasetype', 'self');
    u.searchParams.set('cart', String(gid));
    return u.toString();
  }

  function accountCartCheckoutUrl() {
    const u = new URL(CHECKOUT_BASE);
    u.searchParams.set('accountcart', '1');
    return u.toString();
  }

  async function beginSelectiveCheckout() {
    if (state.busy) return;
    state.busy = true;
    renderFooter();

    try {
      const existingRecovery = getRecovery();
      if (existingRecovery?.items?.length) {
        throw new Error(t('previousRecovery'));
      }

      const freshCart = await getAccountCart();
      const freshItems = freshCart.line_items || [];
      if (!freshItems.length) throw new Error(t('cartEmpty'));

      const selectedKeys = new Set(state.selected);
      const selectedItems = freshItems.filter(item => selectedKeys.has(lineKey(item)));
      const parkedItems = freshItems.filter(item => !selectedKeys.has(lineKey(item)));

      if (!selectedItems.length) throw new Error(t('selectOne'));

      // AccountCart is not addressed by gidshoppingcart. Steam's checkout flow
      // consumes the signed-in account cart via ?accountcart=1.
      if (!parkedItems.length) {
        setStatus(t('processing'), 'ok');
        location.assign(accountCartCheckoutUrl());
        return;
      }

      const accountSensitive = !state.metadataAuthenticated || selectedItems.some(item => {
        const meta = state.metadata.get(lineKey(item));
        return Boolean(meta?.isComingSoon || meta?.hasConditionalDiscount || meta?.activeDiscounts?.length);
      });
      const accountReason = t('processing');
      setStatus(accountSensitive ? accountReason : t('processing'), accountSensitive ? 'warn' : '');
      const directGid = accountSensitive ? null : await tryDirectTemporaryCart(selectedItems);
      if (directGid) {
        setStatus(t('processing'), 'ok');
        location.assign(checkoutUrl(directGid));
        return;
      }

      const ok = window.confirm(t('fallbackConfirm', {
        selected: selectedItems.length,
        parked: parkedItems.length,
      }));
      if (!ok) return;

      const recovery = {
        version: 2,
        created_at: Date.now(),
        stage: 'removing',
        items: parkedItems.map(backupItem),
        selected_keys: selectedItems.map(lineKey),
        removed_count: 0,
      };
      setRecovery(recovery);
      setStatus(t('processing'), 'warn');

      try {
        for (const item of parkedItems) {
          await removeAccountItem(item);
          recovery.removed_count += 1;
          setRecovery(recovery);
        }
      } catch (e) {
        setStatus(t('processing'), 'error');
        try {
          const removedBackups = recovery.items.slice(0, recovery.removed_count);
          if (removedBackups.length) await addAccountItems(removedBackups);
          clearRecovery();
        } catch (rollbackError) {
          log('Rollback failed.', rollbackError);
          recovery.stage = 'recovery_required';
          setRecovery(recovery);
        }
        throw e;
      }

      const reducedCart = await getAccountCart();
      const reducedItems = reducedCart.line_items || [];
      const remainingKeys = new Set(reducedItems.map(lineKey));
      const expectedKeys = new Set(selectedItems.map(lineKey));
      const mismatch = [...expectedKeys].some(k => !remainingKeys.has(k)) ||
        [...remainingKeys].some(k => !expectedKeys.has(k));

      if (mismatch) {
        setStatus(t('processing'), 'error');
        await rollbackRemoved(recovery);
        throw new Error('Cart verification failed after parking unselected items.');
      }

      recovery.stage = 'checkout';
      setRecovery(recovery);
      setStatus(t('processing'), 'ok');
      location.assign(accountCartCheckoutUrl());
    } catch (e) {
      console.error(`[${SCRIPT_NAME}] checkout failed`, e);
      setStatus(t('error', { error: e.message || e }), 'error');
    } finally {
      state.busy = false;
      renderFooter();
    }
  }

  function analyzeFormattedPrice(sample) {
    if (!sample) return null;
    const text = String(sample).replace(/\u00a0/g, ' ');
    const first = text.search(/\d/);
    if (first < 0) return null;
    let last = -1;
    for (let i = text.length - 1; i >= 0; i--) {
      if (/\d/.test(text[i])) { last = i; break; }
    }
    if (last < first) return null;

    const prefix = text.slice(0, first);
    const suffix = text.slice(last + 1);
    const numeric = text.slice(first, last + 1);
    const punct = [...numeric].filter(ch => ch === '.' || ch === ',');
    let decimals = 0;
    let decimalSep = '';
    let thousandsSep = '';

    if (punct.length) {
      const lastDot = numeric.lastIndexOf('.');
      const lastComma = numeric.lastIndexOf(',');
      const sepIndex = Math.max(lastDot, lastComma);
      const sep = numeric[sepIndex];
      const afterDigits = numeric.slice(sepIndex + 1).replace(/\D/g, '').length;
      const hasOtherSep = (sep === '.' ? lastComma : lastDot) >= 0;

      if (afterDigits > 0 && afterDigits <= 2) {
        decimals = afterDigits;
        decimalSep = sep;
        if (hasOtherSep) thousandsSep = sep === '.' ? ',' : '.';
      } else if (afterDigits === 3) {
        thousandsSep = sep;
      }
    }

    if (!thousandsSep && /\d[ '\u202f]\d{3}(?:\D|$)/.test(numeric)) {
      const m = numeric.match(/\d([ '\u202f])\d{3}(?:\D|$)/);
      if (m) thousandsSep = m[1];
    }

    return { prefix, suffix, decimals, decimalSep, thousandsSep };
  }

  function formatMinorLikeSteam(minor, sample) {
    const style = analyzeFormattedPrice(sample);
    if (!style || !Number.isFinite(minor)) return null;
    const scale = 10 ** style.decimals;
    const absoluteMinor = Math.round(Math.abs(minor));
    const whole = Math.floor(absoluteMinor / scale);
    const fraction = style.decimals ? String(absoluteMinor % scale).padStart(style.decimals, '0') : '';
    let wholeText = String(whole);
    if (style.thousandsSep) {
      wholeText = wholeText.replace(/\B(?=(\d{3})+(?!\d))/g, style.thousandsSep);
    }
    const numberText = `${minor < 0 ? '-' : ''}${wholeText}${style.decimals ? style.decimalSep + fraction : ''}`;
    return `${style.prefix}${numberText}${style.suffix}`;
  }

  function itemCurrentPrice(item) {
    const meta = state.metadata.get(lineKey(item));

    // Authenticated StoreBrowse is the preferred current price because it can resolve
    // current-account purchase options, including loyalty/ownership discounts.
    if (Number.isFinite(meta?.finalPriceMinor)) {
      return { minor: Number(meta.finalPriceMinor), formatted: meta.price || '' };
    }

    // AccountCart is also account-specific and is a safer fallback than any public
    // store price. In particular, Complete-the-Set/loyalty bundles often encode the
    // personalized amount here.
    const p = item?.price_when_added;
    const minor = Number(p?.amount_in_cents);
    if (Number.isFinite(minor)) {
      return { minor, formatted: p?.formatted_amount || '' };
    }
    return null;
  }

  function selectedPriceSummary() {
    const selectedItems = state.items.filter(item => state.selected.has(lineKey(item)));
    if (!selectedItems.length) return { text: t('selectedTotal', { amount: '—' }), complete: true };

    let total = 0;
    let sample = '';
    let priced = 0;
    for (const item of selectedItems) {
      const price = itemCurrentPrice(item);
      if (price) {
        total += price.minor;
        priced += 1;
        if (!sample && price.formatted) sample = price.formatted;
      }
    }

    if (!priced) return { text: t('priceUnavailable'), complete: false };
    const formatted = formatMinorLikeSteam(total, sample);
    const base = formatted || `${total}`;
    if (priced !== selectedItems.length) {
      return { text: t('priceMissing', { amount: base, count: selectedItems.length - priced }), complete: false };
    }
    return { text: t('selectedTotal', { amount: base }), complete: true };
  }

  function itemTitle(item) {
    const meta = state.metadata.get(lineKey(item));
    if (meta?.name) {
      if (meta.optionName && meta.optionName !== meta.name) return `${meta.name} — ${meta.optionName}`;
      return meta.name;
    }
    if (item.packageid) return `Package ${item.packageid}`;
    if (item.bundleid) return `Bundle ${item.bundleid}`;
    return `Line item ${lineItemId(item) || '?'}`;
  }

  function itemMeta(item) {
    const bits = [];
    if (item.packageid) bits.push(`sub/${item.packageid}`);
    if (item.bundleid) bits.push(`bundle/${item.bundleid}`);
    const flags = normalizeFlags(item);
    if (flags.is_gift) bits.push(t('gift'));
    if (flags.is_private) bits.push(t('private'));
    return bits.join(' · ');
  }

  function setStatus(text, kind = '') {
    const el = document.querySelector(`#${UI_ID} .ssc-status`);
    if (!el) return;
    el.className = `ssc-status ${kind}`.trim();
    el.textContent = text;
  }

  function renderList() {
    const list = document.querySelector(`#${UI_ID} .ssc-list`);
    if (!list) return;
    list.textContent = '';

    for (const item of state.items) {
      const key = lineKey(item);
      const meta = state.metadata.get(key);
      const row = document.createElement('label');
      row.className = 'ssc-item';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = state.selected.has(key);
      cb.disabled = state.busy;
      cb.addEventListener('change', () => {
        if (cb.checked) state.selected.add(key);
        else state.selected.delete(key);
        renderFooter();
      });

      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'ssc-item-name';
      name.textContent = itemTitle(item);
      const metaLine = document.createElement('div');
      metaLine.className = 'ssc-item-meta';
      metaLine.textContent = itemMeta(item);
      info.append(name, metaLine);

      const price = document.createElement('div');
      price.className = 'ssc-item-price';
      const resolvedPrice = itemCurrentPrice(item);
      price.textContent = resolvedPrice?.formatted || meta?.price || item?.price_when_added?.formatted_amount || '';

      row.append(cb, info, price);
      list.appendChild(row);
    }
  }

  function renderFooter() {
    const count = document.querySelector(`#${UI_ID} .ssc-count`);
    const total = document.querySelector(`#${UI_ID} .ssc-total`);
    const btn = document.querySelector(`#${UI_ID} .ssc-checkout`);
    if (count) count.textContent = t('selectedCount', { selected: state.selected.size, total: state.items.length });
    if (total) {
      const summary = selectedPriceSummary();
      total.textContent = summary.text;
      total.classList.toggle('incomplete', !summary.complete);
    }
    if (btn) {
      btn.disabled = state.busy || state.selected.size === 0 || Boolean(getRecovery()?.items?.length);
      btn.textContent = state.busy ? t('processing') : t('checkout');
    }
    renderList();
  }

  function mountPanel() {
    document.getElementById(UI_ID)?.remove();
    const panel = document.createElement('section');
    panel.id = UI_ID;
    panel.innerHTML = `
      <div class="ssc-head">
        <div>
          <div class="ssc-title">Cart Selection for Steam</div>
          <div class="ssc-subtitle">v1.0.0</div>
        </div>
        <button class="ssc-icon-btn ssc-collapse" title="${t('collapse')}">−</button>
      </div>
      <div class="ssc-body">
        <div class="ssc-status">${t('loading')}</div>
        <div class="ssc-toolbar">
          <button class="ssc-btn secondary ssc-all">${t('selectAll')}</button>
          <button class="ssc-btn secondary ssc-none">${t('selectNone')}</button>
          <button class="ssc-btn secondary ssc-refresh">${t('refresh')}</button>
        </div>
        <div class="ssc-recovery"></div>
        <div class="ssc-list"></div>
        <div class="ssc-footer">
          <div class="ssc-summary">
            <div class="ssc-count">${t('selectedCount', { selected: 0, total: 0 })}</div>
            <div class="ssc-total">${t('selectedTotal', { amount: '—' })}</div>
          </div>
          <button class="ssc-btn ssc-checkout">${t('checkout')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    panel.dir = uiLanguage === 'arabic' ? 'rtl' : 'ltr';

    panel.querySelector('.ssc-collapse').addEventListener('click', e => {
      panel.classList.toggle('ssc-collapsed');
      e.currentTarget.textContent = panel.classList.contains('ssc-collapsed') ? '+' : '−';
    });
    panel.querySelector('.ssc-all').addEventListener('click', () => {
      state.items.forEach(item => state.selected.add(lineKey(item)));
      renderFooter();
    });
    panel.querySelector('.ssc-none').addEventListener('click', () => {
      state.selected.clear();
      renderFooter();
    });
    panel.querySelector('.ssc-refresh').addEventListener('click', () => loadCartUi());
    panel.querySelector('.ssc-checkout').addEventListener('click', beginSelectiveCheckout);

    renderRecoveryBox();
  }

  function renderRecoveryBox() {
    const box = document.querySelector(`#${UI_ID} .ssc-recovery`);
    if (!box) return;
    box.textContent = '';
    const recovery = getRecovery();
    if (!recovery?.items?.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'ssc-status warn';
    wrap.innerHTML = `<div style="margin-bottom:7px">${t('recoveryPending', { count: recovery.items.length })}</div>`;

    const restore = document.createElement('button');
    restore.className = 'ssc-btn';
    restore.textContent = t('restoreNow');
    restore.addEventListener('click', async () => {
      try {
        restore.disabled = true;
        await restoreRecovery();
        renderRecoveryBox();
        await loadCartUi();
      } catch (e) {
        setStatus(t('restoreFailed', { error: e.message || e }), 'error');
      } finally {
        restore.disabled = false;
      }
    });

    const forget = document.createElement('button');
    forget.className = 'ssc-btn danger';
    forget.style.marginLeft = '7px';
    forget.textContent = t('discardBackup');
    forget.title = t('discardBackup');
    forget.addEventListener('click', () => {
      if (confirm(t('discardConfirm'))) {
        clearRecovery();
        renderRecoveryBox();
        renderFooter();
      }
    });

    wrap.append(restore, forget);
    box.appendChild(wrap);
  }

  async function loadCartUi() {
    try {
      state.busy = true;
      setStatus(t('readingCart'));
      state.config = await waitForConfig();
      if (state.config?.language) { uiLanguage = normalizeSteamLanguage(state.config.language); GM_setValue(LANGUAGE_KEY, uiLanguage); }
      if (!state.config?.token) throw new Error(t('tokenMissing'));

      state.cart = await getAccountCart();
      state.items = state.cart.line_items || [];
      const previous = new Set(state.selected);
      state.selected.clear();
      for (const item of state.items) {
        const key = lineKey(item);
        if (!previous.size || previous.has(key)) state.selected.add(key);
      }

      state.metadata = await fetchMetadata(state.items);
      renderRecoveryBox();
      setStatus(
        state.items.length ? t('cartLoaded', { count: state.items.length }) : t('cartEmpty'),
        state.items.length ? 'ok' : ''
      );
    } catch (e) {
      console.error(`[${SCRIPT_NAME}] load failed`, e);
      setStatus(t('loadFailed', { error: e.message || e }), 'error');
    } finally {
      state.busy = false;
      renderFooter();
    }
  }

  function mountCheckoutBanner() {
    const recovery = getRecovery();
    if (!recovery?.items?.length) return;
    document.getElementById(CHECKOUT_UI_ID)?.remove();

    const el = document.createElement('div');
    el.id = CHECKOUT_UI_ID;
    el.innerHTML = `
      <div class="ssc-checkout-text">
        <strong>${t('checkoutActive')}</strong> ${t('checkoutBanner', { count: recovery.items.length })}
      </div>
      <div class="ssc-checkout-actions">
        <button class="restore">${t('returnRestore')}</button>
        <button class="dismiss">${t('hide')}</button>
      </div>
    `;
    document.body.appendChild(el);
    el.dir = uiLanguage === 'arabic' ? 'rtl' : 'ltr';

    el.querySelector('.restore').addEventListener('click', () => {
      location.href = `${STORE_CART_URL}?ssc_restore=1`;
    });
    el.querySelector('.dismiss').addEventListener('click', () => el.remove());
  }

  async function initCartPage() {
    mountPanel();
    const params = new URL(location.href).searchParams;

    if (params.get('ssc_restore') === '1' && getRecovery()?.items?.length) {
      try {
        state.config = await waitForConfig();
        await restoreRecovery({ quiet: true });
        history.replaceState(null, '', STORE_CART_URL);
        setStatus(t('autoRestored'), 'ok');
      } catch (e) {
        setStatus(t('autoRestoreFailed', { error: e.message || e }), 'error');
      }
    }

    await loadCartUi();
  }

  uiLanguage = detectInitialLanguage();
  GM_registerMenuCommand(t('menuRestore'), async () => {
    try {
      if (!location.hostname.startsWith('store.steampowered.com')) {
        location.href = `${STORE_CART_URL}?ssc_restore=1`;
        return;
      }
      state.config = await waitForConfig();
      await restoreRecovery();
      if (location.pathname.startsWith('/cart')) await loadCartUi();
    } catch (e) {
      alert(`${SCRIPT_NAME}: ${t('restoreFailed', { error: e.message || e })}`);
    }
  });

  const host = location.hostname;
  const path = location.pathname;

  if (host === 'store.steampowered.com' && path.startsWith('/cart')) {
    initCartPage();
  } else if ((host === 'checkout.steampowered.com') ||
             (host === 'store.steampowered.com' && path.startsWith('/checkout'))) {
    mountCheckoutBanner();
  }
})();
