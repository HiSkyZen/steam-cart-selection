from pathlib import Path

p = Path('cart-selection-for-steam.user.js')
s = p.read_text(encoding='utf-8')

s = s.replace('// @version      1.1.1', '// @version      1.1.2', 1)
s = s.replace("? GM_info.script.version : '1.1.1';", "? GM_info.script.version : '1.1.2';", 1)

if '// @name:es      Cart Selection for Steam' not in s:
    s = s.replace('// @name:ru      Cart Selection for Steam\n// @name:es-ES      Cart Selection for Steam', '// @name:ru      Cart Selection for Steam\n// @name:es      Cart Selection for Steam\n// @name:es-ES      Cart Selection for Steam', 1)

if '// @description:es  ' not in s:
    s = s.replace('// @description:ru  Выбирайте и покупайте только нужные товары из корзины Steam, сохраняя остальные.\n// @description:es-ES', '// @description:ru  Выбирайте и покупайте только нужные товары из корзины Steam, сохраняя остальные.\n// @description:es  Selecciona y compra solo los artículos que quieras de tu carrito de Steam y conserva el resto.\n// @description:es-ES', 1)

if '// @license      MIT' not in s:
    s = s.replace('// @author       HiSkyZen\n', '// @author       HiSkyZen\n// @license      MIT\n', 1)

p.write_text(s, encoding='utf-8')

c = Path('CHANGELOG.md')
text = c.read_text(encoding='utf-8')
entry = """## 1.1.2 — 2026-09-16\n\n- Added the generic Spanish `@name:es`/`@description:es` metadata required by Greasy Fork when Spanish additional info is present.\n- Declared `@license MIT` in the userscript metadata and added the repository MIT license.\n\n"""
if not text.startswith('## 1.1.2'):
    c.write_text(entry + text, encoding='utf-8')
