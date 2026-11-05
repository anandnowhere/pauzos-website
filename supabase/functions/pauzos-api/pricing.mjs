export const SWITCH_AT = Date.parse('2027-01-01T00:00:00+05:30');
// Minor units: whole-number Gulf prices avoid awkward decimals; KWD/BHD/OMR use 1000.
export const PRICES = {
 INR:[34900,49900,100,'India'], USD:[999,1499,100,'United States / other regions'],
 GBP:[799,1199,100,'United Kingdom'], EUR:[999,1499,100,'Eurozone'],
 CAD:[1399,1999,100,'Canada'], AUD:[1599,2299,100,'Australia'],
 SGD:[1399,1999,100,'Singapore'], NZD:[1799,2499,100,'New Zealand'],
 AED:[3900,5900,100,'United Arab Emirates'], SAR:[3900,5900,100,'Saudi Arabia'],
 QAR:[3900,5900,100,'Qatar'], KWD:[3000,5000,1000,'Kuwait'],
 BHD:[4000,6000,1000,'Bahrain'], OMR:[4000,6000,1000,'Oman'],
 JPY:[1500,2200,1,'Japan']
};
const countryMap={IN:'INR',US:'USD',GB:'GBP',CA:'CAD',AU:'AUD',SG:'SGD',NZ:'NZD',AE:'AED',SA:'SAR',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',JP:'JPY'};
for(const c of 'AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK BG'.split(' '))countryMap[c]='EUR';
export function currencyForCountry(country){return countryMap[country]||'USD';}
export function quote(currency,now=Date.now()){
 if(!Object.hasOwn(PRICES,currency))throw Error('Unsupported currency');
 const p=PRICES[currency],early=now<SWITCH_AT;
 return {currency,amount:p[early?0:1],nextAmount:p[1],divisor:p[2],phase:early?'early-bird':'standard',product:'pauzos-lifetime-regional-v1',switchAt:new Date(SWITCH_AT).toISOString()};
}
export function validOrder(o){
 if(o.notes?.product==='pauzos-lifetime-299-v1')return o.currency==='INR'&&o.amount===29900;
 if(o.notes?.product!=='pauzos-lifetime-regional-v1'||!Number.isFinite(o.created_at)||!Object.hasOwn(PRICES,o.currency))return false;
 return o.amount===quote(o.currency,o.created_at*1000).amount;
}
export function pricingResponse(request){
 const url=new URL(request.url),country=request.cf?.country||null;
 const selected=url.searchParams.get('currency')||currencyForCountry(country);
 if(!Object.hasOwn(PRICES,selected))return Response.json({error:'Unsupported currency'},{status:400});
 return Response.json({...quote(selected),country,options:Object.entries(PRICES).map(([currency,p])=>({currency,label:p[3]}))},{headers:{'Cache-Control':'private, no-store'}});
}
