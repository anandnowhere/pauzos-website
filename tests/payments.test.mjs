import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quote} from '../supabase/functions/pauzos-api/pricing.mjs';
import {payments,sign,canReplaceUnpaidOrder} from '../supabase/functions/pauzos-api/payments.mjs';
const env={ALLOWED_ORIGINS:'https://site.example',RAZORPAY_KEY_ID:'rzp_live_example',RAZORPAY_KEY_SECRET:'test-secret',SUPABASE_URL:'https://database.example',SUPABASE_SERVICE_ROLE_KEY:'test-service'};
const request=(path,body,origin='https://site.example')=>new Request('https://site.example/api/'+path,{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
const response=(body,status=200)=>Response.json(body,{status});
const order={id:'order_123',amount:29900,currency:'INR',notes:{product:'pauzos-lifetime-299-v1',email:'buyer@example.com',name:'Buyer'}};
async function fixture({amount=29900,paymentStatus='captured',licenseFails=false,previous=[],signature=false}={}){
 const calls=[];const token=await sign('recover|order_123',env.RAZORPAY_KEY_SECRET);
 const fetcher=async(url,opts)=>{calls.push({url,opts});if(url.endsWith('/payments'))return response({items:[{id:'pay_123',order_id:'order_123',amount,currency:'INR',status:paymentStatus,amount_refunded:0}]});if(url.endsWith('/orders/order_123'))return response(order);if(url.includes('razorpay_payments?payment_id='))return response(previous);if(url.endsWith('/auth/v1/admin/users'))return response({id:'user'});if(url.includes('/rest/v1/licenses?'))return response({},licenseFails?500:201);return response({});};
 const body={order_id:'order_123',token,...(signature?{payment_id:'pay_123',signature:await sign('order_123|pay_123',env.RAZORPAY_KEY_SECRET)}:{})};
 const r=await payments(request('verify',body),env,fetcher);return {r,result:await r.json(),calls};
}
test('rejects cross-origin requests without contacting services',async()=>{const r=await payments(request('order',{},'https://other.example'),env,()=>{throw Error('must not call')});assert.equal(r.status,403);});
test('rejects client price tampering',async()=>{let sent;const r=await payments(request('order',{email:'buyer@example.com',name:'Buyer',amount:1,currency:'INR',phase:'early-bird'}),env,async(url,opts)=>{if(url.includes('/orders')){sent=JSON.parse(opts.body);return response({id:'order_123'});}return response([]);});assert.equal(r.status,409);assert.equal(sent,undefined);});
test('rejects forged recovery proof',async()=>{const r=await payments(request('verify',{order_id:'order_123',token:'forged'}),env,()=>{throw Error('must not call')});assert.equal(r.status,403);});
test('rejects forged payment signature',async()=>{const token=await sign('recover|order_123',env.RAZORPAY_KEY_SECRET);const r=await payments(request('verify',{order_id:'order_123',token,payment_id:'pay_123',signature:'forged'}),env,()=>{throw Error('must not call')});assert.equal(r.status,403);});
test('wrong amount never activates a license',async()=>{const x=await fixture({amount:24900});assert.equal(x.result.pending,true);assert.ok(!x.calls.some(c=>c.url.includes('/rest/v1/licenses')));});
test('failed payment never activates a license',async()=>{const x=await fixture({paymentStatus:'failed'});assert.equal(x.result.pending,true);assert.ok(!x.calls.some(c=>c.url.includes('/rest/v1/licenses')));});
test('verified captured payment activates original order email',async()=>{const x=await fixture({signature:true});assert.equal(x.result.success,true);const c=x.calls.find(c=>c.url.includes('/rest/v1/licenses'));assert.equal(JSON.parse(c.opts.body).email,order.notes.email);});
test('license failure is not reported as success',async()=>{const x=await fixture({licenseFails:true});assert.equal(x.r.status,503);assert.equal(x.result.success,undefined);});
test('payment cannot be assigned to a different email',async()=>{const x=await fixture({previous:[{email:'someoneelse@example.com'}]});assert.equal(x.r.status,409);});
test('repeated verification does not resend activation email',async()=>{const x=await fixture({previous:[{email:order.notes.email}]});assert.equal(x.result.success,true);assert.ok(!x.calls.some(c=>c.url.includes('/recover')));});

test('creates order with exact quoted currency and minor units',async()=>{let sent;const q=quote('KWD');const r=await payments(request('order',{email:'buyer@example.com',name:'Buyer',...q}),env,async(url,opts)=>{if(url.includes('/orders')){sent=JSON.parse(opts.body);return response({id:'order_123'});}return response([]);});assert.equal(r.status,200);assert.equal(sent.amount,q.amount);assert.equal(sent.currency,'KWD');});
test('test verification cannot write production records',async()=>{const secret='test-only-secret';const token=await sign('recover|order_123',secret);const q=quote('AED');const calls=[];const r=await payments(request('test/verify',{order_id:'order_123',token}),{ALLOWED_ORIGINS:'https://site.example',RAZORPAY_TEST_KEY_ID:'rzp_test_example',RAZORPAY_TEST_KEY_SECRET:secret},async(url)=>{calls.push(url);if(url.endsWith('/payments'))return response({items:[{id:'pay_123',order_id:'order_123',amount:q.amount,currency:'AED',status:'captured'}]});return response({...q,id:'order_123',created_at:Math.floor(Date.now()/1000),notes:{product:q.product,email:'test@example.com'}});});assert.equal(r.status,200);assert.equal((await r.json()).test,true);assert.ok(calls.every(u=>u.startsWith('https://api.razorpay.com/')));});

test('stale orders can only be replaced with a complete unpaid gateway history',()=>{
 const order={id:'order_old',status:'created',amount_paid:0};
 assert.equal(canReplaceUnpaidOrder(order,{items:[],count:0}),true);
 assert.equal(canReplaceUnpaidOrder({...order,status:'attempted'},{items:[{order_id:'order_old',status:'failed'}],count:1}),true);
 for(const status of ['created','authorized','captured','refunded'])assert.equal(canReplaceUnpaidOrder(order,{items:[{order_id:'order_old',status}],count:1}),false);
 assert.equal(canReplaceUnpaidOrder({...order,amount_paid:29900},{items:[],count:0}),false);
 assert.equal(canReplaceUnpaidOrder(order,{items:[],count:1}),false);
 assert.equal(canReplaceUnpaidOrder(order,{}),false);
});
