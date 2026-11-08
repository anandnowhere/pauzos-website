export const SWITCH_AT = Date.parse('2027-01-01T00:00:00+05:30');
// Minor units: whole-number Gulf prices avoid awkward decimals; KWD/BHD/OMR use 1000; JPY uses 1.
// Format: [annual_early, annual_next, divisor, label, lifetime_early, lifetime_next]
export const PRICES = {
 INR: [34900, 49900, 100, 'India', 99900, 149900],
 USD: [999, 1499, 100, 'United States / other regions', 2999, 3999],
 GBP: [799, 1199, 100, 'United Kingdom', 2499, 3499],
 EUR: [999, 1499, 100, 'Eurozone', 2999, 3999],
 CAD: [1399, 1999, 100, 'Canada', 3999, 5499],
 AUD: [1599, 2299, 100, 'Australia', 4499, 5999],
 SGD: [1399, 1999, 100, 'Singapore', 3999, 5499],
 NZD: [1799, 2499, 100, 'New Zealand', 4999, 6999],
 AED: [3900, 5900, 100, 'United Arab Emirates', 10900, 15900],
 SAR: [3900, 5900, 100, 'Saudi Arabia', 10900, 15900],
 QAR: [3900, 5900, 100, 'Qatar', 10900, 15900],
 KWD: [3000, 5000, 1000, 'Kuwait', 9000, 13000],
 BHD: [4000, 6000, 1000, 'Bahrain', 11000, 16000],
 OMR: [4000, 6000, 1000, 'Oman', 11000, 16000],
 JPY: [1500, 2200, 1, 'Japan', 4500, 6500]
};
const countryMap={IN:'INR',US:'USD',GB:'GBP',CA:'CAD',AU:'AUD',SG:'SGD',NZ:'NZD',AE:'AED',SA:'SAR',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',JP:'JPY'};
for(const c of 'AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK BG'.split(' '))countryMap[c]='EUR';
export function currencyForCountry(country){return countryMap[country]||'USD';}

export function quote(currency, planOrNow = 'annual', maybeNow = Date.now()){
 let plan = 'annual';
 let now = Date.now();
 if (typeof planOrNow === 'number') {
  now = planOrNow;
 } else if (typeof planOrNow === 'string') {
  plan = planOrNow === 'lifetime' ? 'lifetime' : 'annual';
  if (typeof maybeNow === 'number') now = maybeNow;
 }
 if(!Object.hasOwn(PRICES,currency))throw Error('Unsupported currency');
 const p=PRICES[currency],early=now<SWITCH_AT;
 const isLifetime = plan === 'lifetime';
 const amount = isLifetime ? (early ? p[4] : p[5]) : (early ? p[0] : p[1]);
 const nextAmount = isLifetime ? p[5] : p[1];
 const product = isLifetime ? 'pauzos-lifetime-regional-v1' : 'pauzos-annual-regional-v1';
 return {
  currency,
  plan,
  amount,
  nextAmount,
  divisor: p[2],
  phase: early ? 'early-bird' : 'standard',
  product,
  devices: isLifetime ? 2 : 1,
  switchAt: new Date(SWITCH_AT).toISOString(),
  annual: {
   amount: early ? p[0] : p[1],
   nextAmount: p[1],
   devices: 1,
   product: 'pauzos-annual-regional-v1'
  },
  lifetime: {
   amount: early ? p[4] : p[5],
   nextAmount: p[5],
   devices: 2,
   product: 'pauzos-lifetime-regional-v1'
  }
 };
}

export function validOrder(o){
 if(o.notes?.product==='pauzos-lifetime-299-v1')return o.currency==='INR'&&o.amount===29900;
 if(!Number.isFinite(o.created_at)||!Object.hasOwn(PRICES,o.currency))return false;
 if(o.notes?.product==='pauzos-lifetime-regional-v1'){
  return o.amount===quote(o.currency,'lifetime',o.created_at*1000).amount;
 }
 if(o.notes?.product==='pauzos-annual-regional-v1'){
  return o.amount===quote(o.currency,'annual',o.created_at*1000).amount;
 }
 return false;
}

export function pricingResponse(request){
 const url=new URL(request.url),country=request.cf?.country||null;
 const selected=url.searchParams.get('currency')||currencyForCountry(country);
 const plan=url.searchParams.get('plan')||'annual';
 if(!Object.hasOwn(PRICES,selected))return Response.json({error:'Unsupported currency'},{status:400});
 return Response.json({
  ...quote(selected,plan),
  country,
  options:Object.entries(PRICES).map(([currency,p])=>({currency,label:p[3]}))
 },{headers:{'Cache-Control':'private, no-store'}});
}
