import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../public/checkout.js',import.meta.url),'utf8');
async function boot(result,{saved=true,paid=false,fails=false,amount=34900}={}){
 const events={},calls=[],removed=[];
 const field={email:{value:''},name:{value:''}};
 const label={textContent:'Pay'};
 const nodes={};
 for(const id of ['checkout-form','pay-button','payment-status','retry-payment'])nodes['#'+id]={hidden:id==='retry-payment'||id==='payment-status',disabled:false,textContent:'',addEventListener:(name,fn)=>{events[id+':'+name]=fn;},querySelector:()=>label};
 nodes['#checkout-form'].elements={namedItem:name=>field[name]};
 const session={order_id:'order_saved',token:'proof',key:'rzp_live_example',amount,currency:'INR',email:'buyer@example.com',name:'Buyer',...(paid?{payment_id:'pay_saved',signature:'signed'}:{})};
 const opened=[];const Razorpay=function(options){this.on=()=>{};this.open=()=>opened.push(options);};
 const window={Razorpay,pauzosPriceReady:Promise.resolve(),pauzosPrice:{amount:34900,currency:'INR'},addEventListener:(name,fn)=>{events[name]=fn;}};
 vm.runInNewContext(source,{AbortSignal,Razorpay,URL,location:{href:"https://site.example/payment.html"},window,document:{body:{dataset:{}},querySelector:id=>nodes[id]},localStorage:{getItem:()=>saved?JSON.stringify(session):null,setItem:()=>{},removeItem:key=>removed.push(key)},fetch:async(path)=>{calls.push(path);if(fails)throw Error('Temporary outage');return {ok:true,json:async()=>path.endsWith("/order")?{order_id:"order_new",token:"new-proof",key:"rzp_live_example",amount:34900,currency:"INR"}:result};}});
 if(events.DOMContentLoaded)await events.DOMContentLoaded();
 return {nodes,calls,removed,label,field,opened,submit:()=>events["checkout-form:submit"]({preventDefault(){}})};
}
test('new visitor sees no saved checkout warning or manual retry',async()=>{const x=await boot({}, {saved:false});assert.equal(x.calls.length,0);assert.equal(x.nodes['#retry-payment'].hidden,true);assert.equal(x.nodes['#payment-status'].hidden,true);});
test('saved unpaid checkout verifies quietly without a warning or extra action',async()=>{const x=await boot({pending:true});assert.deepEqual(x.calls,['/api/verify']);assert.equal(x.nodes['#payment-status'].hidden,true);assert.equal(x.nodes['#payment-status'].textContent,'');assert.equal(x.nodes['#retry-payment'].hidden,true);assert.equal(x.nodes['#pay-button'].disabled,false);assert.equal(x.removed.length,0);});
test('saved successful payment confirms without another pay click',async()=>{const x=await boot({success:true,message:'License active'});assert.equal(x.nodes['#checkout-form'].hidden,true);assert.deepEqual(x.removed,['pauzos-checkout']);});
test('verification failure keeps recovery proof and blocks duplicate payment',async()=>{const x=await boot({}, {fails:true});assert.equal(x.nodes['#retry-payment'].hidden,false);assert.equal(x.nodes['#pay-button'].disabled,true);assert.equal(x.removed.length,0);});
test('payment awaiting confirmation cannot be paid a second time',async()=>{const x=await boot({pending:true},{paid:true});assert.equal(x.nodes['#retry-payment'].hidden,false);assert.equal(x.nodes['#pay-button'].disabled,true);});

test('single Pay click replaces server-confirmed unpaid old price and opens Razorpay',async()=>{
 const x=await boot({pending:true,can_replace:true},{amount:29900});
 await x.submit();
 assert.deepEqual(x.calls,['/api/verify','/api/verify','/api/order']);
 assert.equal(x.opened.length,1);assert.equal(x.opened[0].amount,34900);assert.equal(x.opened[0].order_id,'order_new');
});
test('old price never creates a replacement while gateway status is uncertain',async()=>{
 const x=await boot({pending:true,can_replace:false},{amount:29900});await x.submit();
 assert.equal(x.calls.includes('/api/order'),false);assert.equal(x.opened.length,0);assert.equal(x.removed.length,0);
});
test('unchanged unpaid checkout reuses the original order',async()=>{
 const x=await boot({pending:true,can_replace:true});await x.submit();
 assert.equal(x.calls.includes('/api/order'),false);assert.equal(x.opened[0].order_id,'order_saved');
});
