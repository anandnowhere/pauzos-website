import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../supabase/functions/pauzos-api/handler.mjs';
const request=(path,options={})=>new Request('https://project.supabase.co/functions/v1/pauzos-api/api/'+path,options);
test('production preflight supports exact origin',async()=>{const r=await handle(request('order',{method:'OPTIONS',headers:{Origin:'https://pauzos.com'}}),{});assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://pauzos.com');});
test('unknown origin cannot create checkout',async()=>{const r=await handle(request('order',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'}),{},()=>{throw Error('network forbidden');});assert.equal(r.status,403);assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);});
test('quote supports regional currency and CORS',async()=>{const r=await handle(request('pricing?currency=KWD',{headers:{Origin:'https://pauzos.com'}}),{});const q=await r.json();assert.equal(q.currency,'KWD');assert.equal(q.divisor,1000);assert.equal(q.country,null);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://pauzos.com');});
test('missing webhook secret fails closed',async()=>{const r=await handle(request('webhook',{method:'POST',body:'{}'}),{});assert.equal(r.status,503);});
test('forged webhook cannot provision license',async()=>{const r=await handle(request('webhook',{method:'POST',headers:{'x-razorpay-signature':'fake'},body:'{}'}),{RAZORPAY_WEBHOOK_SECRET:'secret'},()=>{throw Error('network forbidden');});assert.equal(r.status,403);});
test('direct requests without browser origin fail closed',async()=>{const r=await handle(request('order',{method:'POST',body:'{}'}),{RAZORPAY_KEY_ID:'rzp_live_example'});assert.equal(r.status,403);});

test('signed callback provisions only the independently verified gateway account',async()=>{
 const {sign}=await import('../supabase/functions/pauzos-api/payments.mjs');
 const {quote}=await import('../supabase/functions/pauzos-api/pricing.mjs');
 const q=quote('INR');const calls=[];
 const event=JSON.stringify({event:'payment.captured',payload:{payment:{entity:{id:'pay_abc',order_id:'order_abc',email:'forged@example.com'}}}});
 const env={RAZORPAY_WEBHOOK_SECRET:'webhook',RAZORPAY_KEY_ID:'rzp_live_example',RAZORPAY_KEY_SECRET:'gateway',SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'service'};
 const response=await handle(request('webhook',{method:'POST',headers:{'x-razorpay-signature':await sign(event,'webhook')},body:event}),env,async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/orders/order_abc'))return Response.json({id:'order_abc',amount:q.amount,currency:q.currency,created_at:Math.floor(Date.now()/1000),notes:{product:q.product,email:'buyer@example.com',name:'Buyer'}});
  if(url.endsWith('/orders/order_abc/payments'))return Response.json({items:[{id:'pay_abc',order_id:'order_abc',amount:q.amount,currency:q.currency,status:'captured',amount_refunded:0}]});
  if(url.includes('razorpay_payments?payment_id='))return Response.json([]);
  return Response.json({});
 });
 assert.equal(response.status,200);
 assert.equal(JSON.parse(calls.find(c=>c.url.includes('/licenses?')).options.body).email,'buyer@example.com');
});
