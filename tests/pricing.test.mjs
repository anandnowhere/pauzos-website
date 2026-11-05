import {test} from 'node:test';import assert from 'node:assert/strict';
import {quote,SWITCH_AT,PRICES,currencyForCountry,validOrder} from '../supabase/functions/pauzos-api/pricing.mjs';
test('India changes at exactly midnight IST on January 1',()=>{assert.equal(quote('INR',SWITCH_AT-1).amount,34900);assert.equal(quote('INR',SWITCH_AT).amount,49900);});
test('every currency changes together and has valid integer units',()=>{for(const [c,p] of Object.entries(PRICES)){assert.equal(quote(c,SWITCH_AT-1).amount,p[0]);assert.equal(quote(c,SWITCH_AT).amount,p[1]);assert.ok(p.slice(0,2).every(Number.isInteger));if(p[2]===1000)assert.equal(p[0]%10,0);}});
test('Gulf detection and explicit USD fallback',()=>{assert.equal(currencyForCountry('AE'),'AED');assert.equal(currencyForCountry('SA'),'SAR');assert.equal(currencyForCountry('KW'),'KWD');assert.equal(currencyForCountry('XX'),'USD');});
test('rejects unsupported currencies',()=>assert.throws(()=>quote('ZZZ')));
test('existing early-bird order remains verifiable after cutoff',()=>{const q=quote('USD',SWITCH_AT-1000);assert.ok(validOrder({...q,created_at:(SWITCH_AT-1000)/1000,notes:{product:q.product}}));assert.equal(validOrder({...q,amount:1,created_at:(SWITCH_AT-1000)/1000,notes:{product:q.product}}),false);});
