import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';
test('servidor entrega aplicativo e bloqueia arquivos fora da lista',async()=>{
  const server=createServer(); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const url=`http://127.0.0.1:${server.address().port}`;
    for(const path of ['/','/app.mjs','/domain.mjs','/styles.css']) {
      const response=await fetch(url+path); assert.equal(response.status,200); assert.ok(response.headers.get('content-security-policy')); assert.ok((await response.text()).length>100);
    }
    for(const path of ['/package.json','/.git/config','/src/domain.mjs','/missing']) assert.equal((await fetch(url+path)).status,404);
    assert.equal((await fetch(url,{method:'POST'})).status,404);
    assert.equal(await (await fetch(url,{method:'HEAD'})).text(),'');
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
