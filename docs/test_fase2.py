from playwright.sync_api import sync_playwright
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import threading
base=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(base)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':800})
 errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(f'http://127.0.0.1:{server.server_port}/index.html');page.wait_for_timeout(250)
 print('welcome:', page.locator('h1').all_text_contents())
 page.locator('[data-action="start"]').click(); print('map:',page.locator('.footer').all_text_contents())
 page.locator('[data-hotspot="tower"]').click(force=True);print('tower:',page.locator('.footer').all_text_contents())
 page.locator('[data-hotspot="school"]').click(force=True); print('school:',page.locator('h2').all_text_contents())
 page.locator('[data-action="school-spell"]').click();print('spell:',page.locator('h2').all_text_contents())
 for i in range(3):page.locator('[data-action="next"]').click()
 page.locator('[data-action="end-spell"]').click();print('school again:',page.locator('h2').all_text_contents())
 page.locator('[data-action="school-rabbit"]').click()
 for i in range(3):page.locator('[data-action="next"]').click()
 page.locator('[data-action="end-rabbit"]').click()
 page.locator('[data-action="school-nest"]').click()
 for i in range(3):page.locator('[data-action="next"]').click()
 page.locator('[data-action="end-nest"]').click();print('school route:',page.locator('h2').all_text_contents())
 page.locator('[data-action="home"]').click();page.locator('[data-hotspot="tower"]').click(force=True)
 page.locator('[data-hotspot="pairs"]').click(force=True); print('pairs count',page.locator('[data-card]').count())
 for _ in range(25):
  if page.locator('[data-action="end-pairs"]').count():break
  inds=page.evaluate('''() => {let f=window.f2; let v=f.match; let g={};for(let i=0;i<v.length;i++){if(!f.flipped.includes(i)){(g[v[i]]??=[]).push(i)}}return Object.values(g).find(x=>x.length==2)||[]}''')
  if len(inds)!=2:break
  for i in inds:page.locator(f'[data-card="{i}"]').click()
 print('pairs won',page.locator('[data-action="end-pairs"]').count())
 page.locator('[data-action="end-pairs"]').click()
 page.locator('[data-hotspot="words"]').click(force=True); print('word keyboard',page.locator('[data-letter]').count())
 word=page.evaluate('f2.word')
 for letter in set(word):page.locator(f'[data-letter="{letter}"]').click()
 print('word won',page.locator('[data-action="end-words"]').count());page.locator('[data-action="end-words"]').click()
 page.locator('[data-action="home"]').click();page.locator('[data-hotspot="library"]').click(force=True);page.locator('[data-hotspot="monster"]').click(force=True)
 for i in range(4):page.locator('[data-action="next"]').click()
 page.locator('[data-action="end-monster"]').click(); print('monster done',page.evaluate('state.unlocked.monster'))
 page.locator('[data-action="home"]').click();page.locator('.f2-map-quest').click();print('quest count',page.locator('.f2-quest-item.ok').count())
 print('ERRORS',errors)
 page.screenshot(path='/mnt/data/fase2-screenshot.png')
 browser.close()
