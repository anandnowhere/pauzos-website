(() => {
 let resolveReady;window.pauzosPriceReady=new Promise(r=>resolveReady=r);
 const status=document.querySelector('#currency-status');
 const format=(q,amount=q.amount)=>new Intl.NumberFormat(navigator.language||'en',{style:'currency',currency:q.currency,currencyDisplay:'narrowSymbol',minimumFractionDigits:amount%q.divisor?2:0,maximumFractionDigits:2}).format(amount/q.divisor);
 window.pauzosMoney=format;
 async function update(currency){
  const pay=document.querySelector('#pay-button');if(pay)pay.disabled=true;
  try{
   const r=await fetch(window.pauzosApi('/api/pricing'+(currency?'?currency='+encodeURIComponent(currency):'')), {signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const q=await r.json();
   if(!currency&&!q.country){
    const zones={'Asia/Calcutta':'INR','Asia/Kolkata':'INR','Asia/Dubai':'AED','Asia/Riyadh':'SAR','Asia/Qatar':'QAR','Asia/Kuwait':'KWD','Asia/Bahrain':'BHD','Asia/Muscat':'OMR','Europe/London':'GBP','Asia/Tokyo':'JPY','Asia/Singapore':'SGD'};
    const regions={IN:'INR',GB:'GBP',CA:'CAD',AU:'AUD',NZ:'NZD',AE:'AED',SA:'SAR',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',SG:'SGD',JP:'JPY',DE:'EUR',FR:'EUR',ES:'EUR',IT:'EUR',NL:'EUR',IE:'EUR'};
    let inferred;try{inferred=zones[Intl.DateTimeFormat().resolvedOptions().timeZone]||regions[new Intl.Locale(navigator.language).region];}catch{}
    if(inferred&&inferred!==q.currency)return update(inferred);
   }
   window.pauzosPrice=q;
   document.querySelectorAll('[data-price]').forEach(el=>el.textContent=format(q));
   document.querySelectorAll('[data-currency]').forEach(el=>el.textContent='one time');
   document.querySelectorAll('[data-offer]').forEach(el=>el.textContent=q.phase==='early-bird'?'EARLY-BIRD LIFETIME ACCESS':'LIFETIME ACCESS');
   document.querySelectorAll('[data-price-schedule]').forEach(el=>el.textContent=q.phase==='early-bird'?`Available through 31 December 2026. ${format(q,q.nextAmount)} for new purchases from 1 January 2027. Pay once. Future updates included. No renewal fees.`:'Pay once. Future updates included. No renewal fees.');
   document.querySelectorAll('[data-price-schedule-short]').forEach(el=>el.textContent=q.phase==='early-bird'?`Early-bird price through 31 December 2026. ${format(q,q.nextAmount)} for new purchases from 1 January 2027.`:'Pay once. Future updates included. No renewal fees.');
   if(status)status.textContent='';
   if(pay)pay.disabled=false;
   resolveReady(q);window.dispatchEvent(new CustomEvent('pauzos-price',{detail:q}));
  }catch{if(status)status.textContent='Pricing could not load. Refresh the page before paying.';}
 }
 update();window.addEventListener('pageshow',e=>{if(e.persisted)update();});
})();
