const isTest=document.body.dataset.testCheckout==='true';
const storageKey=isTest?'pauzos-test-checkout':'pauzos-checkout';
const form=document.querySelector('#checkout-form'),button=document.querySelector('#pay-button'),statusBox=document.querySelector('#payment-status'),retry=document.querySelector('#retry-payment');
let session=null,busy=false;
try{session=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{}
function tell(message){statusBox.hidden=false;statusBox.textContent=message;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(session));}catch{}}
async function api(path,data){const r=await fetch(window.pauzosApi ? window.pauzosApi(isTest?path.replace('/api/','/api/test/'):path) : (isTest?path.replace('/api/','/api/test/'):path),{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify(data)});const value=await r.json();if(!r.ok)throw Error(value.error||'Please try again.');return value;}
function finish(result){
 tell(result.message+(result.payment_id?' Payment ID: '+result.payment_id:''));
 form.hidden=true;retry.hidden=true;
 try{localStorage.removeItem(storageKey);}catch{}
 session=null;
}
async function verify({silent=false}={}){
 if(!session||busy)return;
 busy=true;retry.hidden=true;retry.disabled=true;button.disabled=true;
 if(silent){statusBox.hidden=true;}else{tell('Confirming your payment…');}
 try{
  const result=await api('/api/verify',session);
  if(result.success){finish(result);}
  else if(session.payment_id){tell('Your payment is still being confirmed. Please do not pay again. Retry confirmation shortly.');retry.hidden=false;}
  else{statusBox.hidden=true;statusBox.textContent='';}
 }catch(e){tell(e.message+' Please retry confirmation.');retry.hidden=false;}
 finally{busy=false;retry.disabled=false;button.disabled=!window.pauzosPrice||!retry.hidden;}
}
retry.addEventListener('click',verify);
if(session?.order_id&&session?.token){
 if(session.email)form.elements.namedItem('email').value=session.email;
 if(session.name)form.elements.namedItem('name').value=session.name;
 button.disabled=true;
 // Both scripts are deferred; wait until pricing.js has initialized its promise.
 window.addEventListener('DOMContentLoaded',async()=>{await window.pauzosPriceReady;await verify({silent:true});},{once:true});
}else{session=null;}
function loadRazorpay(){if(window.Razorpay)return Promise.resolve();return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=()=>window.Razorpay?resolve():reject(Error('Checkout did not load.'));script.onerror=()=>reject(Error('Razorpay could not load. Check your connection and try again.'));document.head.append(script);});}
form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;button.disabled=true;tell('Preparing your secure checkout…');try{await window.pauzosPriceReady;await loadRazorpay();const email=form.elements.namedItem("email").value.trim(),name=form.elements.namedItem("name").value.trim();
// Check an unfinished order before creating a new one.
let order;
if(session?.order_id){const existing=await api('/api/verify',session);if(existing.success){finish(existing);return;} if(session.payment_id){retry.hidden=false;throw Error('Your payment is still being confirmed. Do not pay again.');} const q=window.pauzosPrice;
 const changed=session.email.toLowerCase()!==email.toLowerCase()||!session.key||session.currency!==q.currency||session.amount!==q.amount;
 if(changed){
  if(existing.can_replace!==true)throw Error('Your earlier payment is still being checked. Please try again shortly.');
  // Preserve the recovery proof until the replacement order is successfully created.
  order=null;
 }else{order=session;}}
if(!order)order=await api('/api/order',{email,name,currency:window.pauzosPrice.currency,amount:window.pauzosPrice.amount,phase:window.pauzosPrice.phase});session={order_id:order.order_id,token:order.token,key:order.key,amount:order.amount,currency:order.currency,email,name};save();
if(!order.key.startsWith(isTest?'rzp_test_':'rzp_live_'))throw Error('Checkout mode mismatch. Payment stopped.');
const checkout=new Razorpay({key:order.key,order_id:order.order_id,amount:order.amount,currency:order.currency,name:'STRATEXA · Pauzos',description:'Pauzos lifetime license',image:new URL('assets/logo.webp',location.href).href,prefill:{email,name},theme:{color:'#2362e8'},handler:async response=>{session.payment_id=response.razorpay_payment_id;session.signature=response.razorpay_signature;save();busy=false;await verify();},modal:{ondismiss:()=>{busy=false;void verify({silent:true});}}});checkout.on('payment.failed',()=>{tell('This payment attempt was unsuccessful. Close the Razorpay window to check its status automatically.');});checkout.open();tell('Complete your payment in the Razorpay window.');}catch(e){tell(e.message);}finally{busy=false;button.disabled=!window.pauzosPrice||!retry.hidden;}});
