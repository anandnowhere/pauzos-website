import {quote,validOrder,PRICES} from './pricing.mjs';
const json = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store'}});
const enc = new TextEncoder();
export async function sign(value, secret) {
 const key = await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export function equal(a,b) { if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0; }
export async function payments(request, env, fetcher=fetch) {
 const rawPath=new URL(request.url).pathname;
 const test=rawPath.startsWith('/api/test/');
 const path=rawPath.replace('/api/test/','/api/');
 if(test)env={...env,RAZORPAY_KEY_ID:env.RAZORPAY_TEST_KEY_ID,RAZORPAY_KEY_SECRET:env.RAZORPAY_TEST_KEY_SECRET};
 if(!env.RAZORPAY_KEY_ID?.startsWith(test?'rzp_test_':'rzp_live_'))return json({error:test?'Test checkout is not configured yet. No live payment will be attempted.':'Live checkout is unavailable.'},503);
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Please open checkout on this website.'},403);
 if(!env.RAZORPAY_KEY_SECRET||!env.RAZORPAY_KEY_ID||(!test&&(!env.SUPABASE_SERVICE_ROLE_KEY||!env.SUPABASE_URL)))return json({error:'Checkout is temporarily unavailable. Please contact support.'},503);
 const call=async(url,options={})=>{const r=await fetcher(url,{...options,signal:AbortSignal.timeout(15000)});let data;try{data=await r.json();}catch{data={};}return {ok:r.ok,status:r.status,data};};
 const rzp=async(path,body)=>call('https://api.razorpay.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Basic '+btoa(env.RAZORPAY_KEY_ID+':'+env.RAZORPAY_KEY_SECRET),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const sb=async(path,method='GET',body,extra={})=>call(env.SUPABASE_URL+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',...extra},...(body?{body:JSON.stringify(body)}:{})});
 try {
  const raw=await request.text();if(raw.length>4096)return json({error:'Request too large'},413);
  let input;try{input=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
  if(path==='/api/order') {
   const email=String(input.email||'').trim().toLowerCase(),name=String(input.name||'').trim();
   const plan=input.plan==='lifetime'?'lifetime':'annual';
   if(email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!name||name.length>100)return json({error:'Enter your name and a valid email address.'},400);
   const ready=test?{ok:true}:await sb('/rest/v1/licenses?select=email&limit=0');if(!ready.ok)return json({error:'License activation is temporarily unavailable. No payment has been taken.'},503);
   let price;try{price=quote(input.currency||'INR',plan);}catch{return json({error:'Unsupported currency'},400);}
   if(input.amount!==price.amount||input.phase!==price.phase)return json({error:'The price has changed. Refresh the page to review the current price before paying.'},409);
   const order=await rzp('orders',{amount:price.amount,currency:price.currency,receipt:'pz_'+crypto.randomUUID().replaceAll('-',''),notes:{product:price.product,plan,email,name},partial_payment:false});
   if(!order.ok)return json({error:'Razorpay could not start checkout. Please try again later.'},502);
   return json({key:env.RAZORPAY_KEY_ID,order_id:order.data.id,amount:price.amount,currency:price.currency,plan,test,token:await sign('recover|'+order.data.id,env.RAZORPAY_KEY_SECRET)});
  }
  if(path!=='/api/verify')return json({error:'Not found'},404);
  const orderId=String(input.order_id||'');
  if(!/^order_[a-zA-Z0-9]+$/.test(orderId)||!equal(input.token,await sign('recover|'+orderId,env.RAZORPAY_KEY_SECRET)))return json({error:'Invalid checkout session. Contact support with your payment ID.'},403);
  if(input.payment_id||input.signature) {
   if(!/^pay_[a-zA-Z0-9]+$/.test(input.payment_id||'')||!equal(input.signature,await sign(orderId+'|'+input.payment_id,env.RAZORPAY_KEY_SECRET)))return json({error:'Payment signature could not be verified.'},403);
  }
  const [order,listing]=await Promise.all([rzp('orders/'+orderId),rzp('orders/'+orderId+'/payments')]);
  if(!order.ok||!listing.ok)return json({error:'Payment verification is temporarily unavailable. Do not pay again; use Check payment below.'},502);
  const o=order.data;
  if(!validOrder(o)||!/^\S+@\S+\.\S+$/.test(o.notes?.email||''))return json({error:'Order details do not match this license.'},409);
  let payment=listing.data.items?.find(p=>p.status==='captured'&&p.order_id===orderId&&p.amount===o.amount&&p.currency===o.currency&&!p.refunded&&!(p.amount_refunded>0));
  if(!payment){const authorized=listing.data.items?.find(p=>p.status==='authorized'&&p.order_id===orderId&&p.amount===o.amount&&p.currency===o.currency);if(authorized){const capture=await rzp('payments/'+authorized.id+'/capture',{amount:o.amount,currency:o.currency});if(capture.ok&&capture.data.status==='captured')payment=capture.data;}}
  if(!payment)return json({pending:true,can_replace:canReplaceUnpaidOrder(o,listing.data),message:'No captured payment yet. If you completed payment, wait a moment and check again. Do not pay twice.'});
  if(test)return json({success:true,test:true,payment_id:payment.id,message:'Test payment verified. No real money was charged. No production license or activation email was created.'});
  const email=o.notes.email;
  const isLifetime = o.notes?.product === 'pauzos-lifetime-regional-v1' || o.notes?.product === 'pauzos-lifetime-299-v1';
  const plan = isLifetime ? 'lifetime' : 'annual';
  const max_devices = isLifetime ? 2 : 1;
  const expires_at = isLifetime ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const previous=await sb('/rest/v1/razorpay_payments?payment_id=eq.'+encodeURIComponent(payment.id)+'&select=email');
  if(!previous.ok)return json({error:'Payment is confirmed but activation is pending. Keep your payment ID and check again.',payment_id:payment.id},503);
  if(previous.data.length&&previous.data[0].email!==email)return json({error:'This payment is already associated with another account. Contact support.'},409);
  const account=await sb('/auth/v1/admin/users','POST',{email,password:crypto.randomUUID()+crypto.randomUUID(),email_confirm:true,user_metadata:{customer_name:o.notes.name,must_change_password:true}});
  if(!account.ok&&!['email_exists','user_already_exists'].includes(account.data.code||account.data.error_code))return json({error:'Payment confirmed. Account setup is pending; please contact support or check again.',payment_id:payment.id},503);
  const license=await sb('/rest/v1/licenses?on_conflict=email','POST',{
    email,
    customer_name:o.notes.name,
    plan,
    status:'active',
    max_devices,
    expires_at,
    starts_at:new Date().toISOString(),
    last_renewed_at:new Date().toISOString()
  },{Prefer:'resolution=merge-duplicates,return=minimal'});
  if(!license.ok)return json({error:'Payment confirmed. License activation is pending; please check again or contact support.',payment_id:payment.id},503);
  const recorded=await sb('/rest/v1/razorpay_payments?on_conflict=payment_id','POST',{
    payment_id:payment.id,
    order_id:orderId,
    email,
    amount:o.amount/(PRICES[o.currency]?.[2]||100),
    currency:o.currency,
    plan,
    status:'captured'
  },{Prefer:'resolution=ignore-duplicates,return=minimal'});
  if(!recorded.ok)return json({error:'Your license is active, but the receipt record is pending. Keep your payment ID and contact support.',payment_id:payment.id},503);
  let emailSent=false;
  if(!previous.data.length){const recovery=await sb('/auth/v1/recover','POST',{email});emailSent=recovery.ok;}
  const planLabel = isLifetime ? 'Lifetime Pro license' : 'Annual Pass';
  return json({
    success:true,
    email,
    payment_id:payment.id,
    email_sent:emailSent,
    message:emailSent
      ? `Your ${planLabel} is active. Check your email for password instructions, then sign in to Pauzos.`
      : `Your ${planLabel} is active. In Pauzos, use Forgot Password with your purchase email to set or recover your password, then sign in.`
  });
 }catch{return json({error:'The connection was interrupted. If you paid, do not pay again. Use Check payment or contact support.'},503);}
}

// Only a complete, non-processing gateway history can release a stale checkout.
export function canReplaceUnpaidOrder(order,listing){
 const items=listing?.items;
 return ['created','attempted'].includes(order.status)&&order.amount_paid===0&&
  Array.isArray(items)&&listing.count===items.length&&items.length<100&&
  items.every(p=>p.order_id===order.id&&p.status==='failed');
}
