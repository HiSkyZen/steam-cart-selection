from pathlib import Path

user = Path('cart-selection-for-steam.user.js')
s = user.read_text(encoding='utf-8')

localized = [
    ('ar', 'اختر فقط عناصر سلة Steam التي تريد شراءها مع الاحتفاظ ببقية العناصر.'),
    ('bg', 'Избирайте само артикулите от количката на Steam, които искате да купите, като запазвате останалите.'),
    ('zh-CN', '只选择并结算 Steam 购物车中想购买的项目，同时保留其余项目。'),
    ('zh-TW', '只選擇並結帳 Steam 購物車中想購買的項目，同時保留其餘項目。'),
    ('cs', 'Vyberte a zakupte pouze požadované položky z košíku Steam a ostatní ponechte v košíku.'),
    ('da', 'Vælg og køb kun de ønskede varer i Steam-kurven, mens resten bevares.'),
    ('nl', 'Selecteer en koop alleen de gewenste items uit je Steam-winkelwagen en behoud de rest.'),
    ('fi', 'Valitse ja osta vain haluamasi tuotteet Steam-ostoskorista ja säilytä muut.'),
    ('fr', 'Sélectionnez et achetez uniquement les articles souhaités dans votre panier Steam tout en conservant les autres.'),
    ('de', 'Wähle und kaufe nur die gewünschten Artikel aus deinem Steam-Warenkorb und behalte den Rest.'),
    ('el', 'Επιλέξτε και αγοράστε μόνο τα επιθυμητά αντικείμενα από το καλάθι Steam, διατηρώντας τα υπόλοιπα.'),
    ('hu', 'Csak a kívánt tételeket válaszd ki és vásárold meg a Steam-kosárból, a többit megtartva.'),
    ('id', 'Pilih dan beli hanya item yang diinginkan dari keranjang Steam sambil mempertahankan item lainnya.'),
    ('it', 'Seleziona e acquista solo gli elementi desiderati dal carrello Steam mantenendo tutti gli altri.'),
    ('ja', 'Steam カートから購入したい項目だけを選択して決済し、残りの項目はそのまま保持します。'),
    ('ko', 'Steam 장바구니에서 원하는 항목만 선택해 결제하고 나머지 항목은 그대로 보존합니다.'),
    ('ms', 'Pilih dan beli hanya item yang dikehendaki daripada troli Steam sambil mengekalkan item lain.'),
    ('nb', 'Velg og kjøp bare de ønskede varene fra Steam-handlekurven, og behold resten.'),
    ('pl', 'Wybierz i kup tylko wybrane elementy koszyka Steam, pozostawiając pozostałe bez zmian.'),
    ('pt-PT', 'Selecione e compre apenas os itens desejados no carrinho da Steam, mantendo os restantes.'),
    ('pt-BR', 'Selecione e compre apenas os itens desejados no carrinho da Steam, mantendo os demais.'),
    ('ro', 'Selectează și cumpără doar articolele dorite din coșul Steam, păstrând restul.'),
    ('ru', 'Выбирайте и покупайте только нужные товары из корзины Steam, сохраняя остальные.'),
    ('es-ES', 'Selecciona y compra solo los artículos que quieras de tu carro de Steam y conserva el resto.'),
    ('es-419', 'Selecciona y compra solo los artículos que quieras de tu carrito de Steam y conserva los demás.'),
    ('sv', 'Välj och köp endast önskade objekt från Steam-kundvagnen och behåll resten.'),
    ('th', 'เลือกและซื้อเฉพาะรายการที่ต้องการจากรถเข็น Steam โดยเก็บรายการอื่นไว้'),
    ('tr', 'Steam sepetinizden yalnızca istediğiniz ürünleri seçip satın alın ve diğerlerini koruyun.'),
    ('uk', 'Вибирайте й купуйте лише потрібні товари з кошика Steam, зберігаючи решту.'),
    ('vi', 'Chọn và mua chỉ những mục bạn muốn trong giỏ hàng Steam, đồng thời giữ nguyên các mục còn lại.'),
]

lines = [
    '// ==UserScript==',
    '// @name         Cart Selection for Steam',
]
for code, _ in localized:
    lines.append(f'// @name:{code}      Cart Selection for Steam')
lines += [
    '// @description  Select only the Steam cart items you want to check out while preserving the rest.',
]
for code, desc in localized:
    lines.append(f'// @description:{code}  {desc}')
lines += [
    '// @namespace    https://github.com/HiSkyZen/steam-cart-selection',
    '// @version      1.1.1',
    '// @author       HiSkyZen',
    '// @match        https://store.steampowered.com/cart*',
    '// @match        https://store.steampowered.com/checkout*',
    '// @match        https://checkout.steampowered.com/*',
    '// @grant        GM_xmlhttpRequest',
    '// @grant        GM_getValue',
    '// @grant        GM_setValue',
    '// @grant        GM_deleteValue',
    '// @grant        GM_addStyle',
    '// @grant        GM_registerMenuCommand',
    '// @grant        GM_info',
    '// @grant        GM_openInTab',
    '// @connect      api.steampowered.com',
    '// @homepageURL   https://github.com/HiSkyZen/steam-cart-selection',
    '// @supportURL    https://github.com/HiSkyZen/steam-cart-selection/issues',
    '// @updateURL     https://raw.githubusercontent.com/HiSkyZen/steam-cart-selection/main/cart-selection-for-steam.user.js',
    '// @downloadURL   https://raw.githubusercontent.com/HiSkyZen/steam-cart-selection/main/cart-selection-for-steam.user.js',
    '// @run-at       document-idle',
    '// ==/UserScript==',
]
new_header = '\n'.join(lines)
start = s.index('// ==UserScript==')
end_marker = '// ==/UserScript=='
end = s.index(end_marker, start) + len(end_marker)
s = s[:start] + new_header + s[end:]
s = s.replace("? GM_info.script.version : '1.1.0';", "? GM_info.script.version : '1.1.1';", 1)
user.write_text(s, encoding='utf-8')

changelog = Path('CHANGELOG.md')
c = changelog.read_text(encoding='utf-8')
entry = """## 1.1.1 — 2026-09-16\n\n- Expanded userscript metadata localization to all 31 Steam interface languages (English default plus 30 localized `@name`/`@description` entries) for Greasy Fork and userscript-manager listings.\n\n"""
if not c.startswith('## 1.1.1'):
    changelog.write_text(entry + c, encoding='utf-8')
