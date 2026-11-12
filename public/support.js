import{api,money,status}from './api.js';
let settings,total;
function progress(){if(settings?.goalPaise>0&&total!==undefined){document.getElementById('goal-wrap').hidden=false;document.getElementById('goal-progress').value=Math.min(100,total/settings.goalPaise*100);document.getElementById('goal-label').textContent=money(total)+' of '+money(settings.goalPaise);}}
api('settings').then(s=>{settings=s;document.getElementById('support-message').textContent=s.message;for(const [id,url,label] of [['coffee',s.coffeeUrl,'Buy me a coffee →'],['razorpay',s.razorpayUrl,'Support with Razorpay →']])if(url){const a=document.getElementById(id);a.href=url;a.textContent=label;a.removeAttribute('aria-disabled');}progress();}).catch(e=>{document.getElementById('support-message').textContent='Support details are temporarily unavailable.';status('support-status',e.message,true);});
api('supporters').then(s=>{total=s.totalPaise;document.getElementById('total').textContent=money(total);progress();}).catch(()=>document.getElementById('total').textContent='Unavailable');
const amount=document.getElementById('amount'),currency=document.getElementById('currency');let rates={INR:1},date='';
function estimate(){const a=Number(amount.value);status('estimate',Number.isFinite(a)&&a>=0?`≈ ${money(Math.round(a/rates[currency.value]*100))}${date?' · rates from '+date:''}`:'Enter a positive amount.');}
amount.addEventListener('input',estimate);currency.addEventListener('change',estimate);
api('rates').then(r=>{rates={...r.rates,INR:1};date=r.date;for(const c of Object.keys(r.rates).sort())currency.add(new Option(c,c));currency.value=rates.USD?'USD':'INR';estimate();}).catch(()=>status('estimate','Exchange rates are unavailable. Payments and rankings still use INR.',true));
