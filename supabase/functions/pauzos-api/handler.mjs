import { payments, sign, equal } from './payments.mjs';
import { pricingResponse } from './pricing.mjs';
const defaults = 'https://pauzos.com,https://www.pauzos.com,https://anandnowhere.github.io';
export async function handle(request, secrets, fetcher = fetch) {
 const env = {...secrets, ALLOWED_ORIGINS: secrets.ALLOWED_ORIGINS || defaults};
 const origin = request.headers.get('origin');
 const allowed = env.ALLOWED_ORIGINS.split(',').map(s=>s.trim());
 const url = new URL(request.url);
 const prefix = '/functions/v1/pauzos-api';
 const path = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : url.pathname.replace(/^\/pauzos-api/, '');
 const cors = response => {
  const headers = new Headers(response.headers);
  headers.set('Vary','Origin');headers.set('Cache-Control','no-store');
  if(allowed.includes(origin))headers.set('Access-Control-Allow-Origin',origin);
  return new Response(response.body,{status:response.status,headers});
 };
 const json=(body,status=200)=>cors(Response.json(body,{status}));
 // Authenticate server callbacks over the unmodified body, then independently
 // re-fetch gateway records. Never provision from a webhook payload alone.
 if(path==='/api/webhook'&&request.method==='POST') {
  if(!env.RAZORPAY_WEBHOOK_SECRET)return json({error:'Webhook not configured'},503);
  const raw=await request.text();
  if(raw.length>65536)return json({error:'Request too large'},413);
  if(!equal(request.headers.get('x-razorpay-signature'),await sign(raw,env.RAZORPAY_WEBHOOK_SECRET)))return json({error:'Invalid signature'},403);
  let event;try{event=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  if(!['payment.captured','order.paid'].includes(event.event))return json({received:true,ignored:true});
  const p=event.payload?.payment?.entity;
  if(!/^order_[a-zA-Z0-9]+$/.test(p?.order_id||'')||!/^pay_[a-zA-Z0-9]+$/.test(p?.id||''))return json({error:'Missing payment details'},400);
  if(!env.RAZORPAY_KEY_SECRET)return json({error:'Checkout not configured'},503);
  const body={order_id:p.order_id,payment_id:p.id,token:await sign('recover|'+p.order_id,env.RAZORPAY_KEY_SECRET),signature:await sign(p.order_id+'|'+p.id,env.RAZORPAY_KEY_SECRET)};
  const result=await payments(new Request('https://pauzos.com/api/verify',{method:'POST',headers:{Origin:allowed[0],'Content-Type':'application/json'},body:JSON.stringify(body)}),env,fetcher);
  const data=await result.json();
  return json({received:result.ok&&data.success===true},result.ok&&data.success?200:503);
 }
 if(origin&&!allowed.includes(origin))return json({error:'Origin not allowed'},403);
 if(request.method==='OPTIONS') {
  if(!allowed.includes(origin))return json({error:'Origin not allowed'},403);
  return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
 }
 if(path==='/api/pricing'&&request.method==='GET') {
  // No trusted IP-country signal on GitHub Pages: client uses system region.
  return cors(pricingResponse(new Request('https://pauzos.com/api/pricing'+url.search)));
 }
 if(!['/api/order','/api/verify','/api/test/order','/api/test/verify'].includes(path))return json({error:'Not found'},404);
 const forwarded=new Request('https://pauzos.com'+path,{method:request.method,headers:request.headers,...(['GET','HEAD'].includes(request.method)?{}:{body:await request.text()})});
 return cors(await payments(forwarded,env,fetcher));
}
