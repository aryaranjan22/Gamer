export function fail(message, status=400) { throw Object.assign(new Error(message), {status}); }
export function name(value) { if(typeof value !== 'string' || !value.trim() || value.trim().length>30) fail('Use a display name between 1 and 30 characters.'); return value.trim(); }
export function country(value='') { if(value !== '' && !/^[A-Z]{2}$/.test(value)) fail('Choose a valid country.'); return value; }
export function mode(value) { if(!['endless','chaos'].includes(value)) fail('Choose endless or chaos.'); return value; }
export function paymentUrl(value, provider) {
  if(value === '') return '';
  let url; try {url=new URL(value);} catch {fail('Enter a valid payment link.');}
  const allowed=provider==='coffee'?['buymeacoffee.com','www.buymeacoffee.com']:['rzp.io','razorpay.me','pages.razorpay.com'];
  if(url.protocol!=='https:' || url.username || url.password || !allowed.includes(url.hostname) || url.pathname==='/') fail('Use an HTTPS link from the selected payment provider.');
  return url.href;
}
export function paise(value, allowZero=false) { const amount=Number(value); if(!Number.isSafeInteger(amount) || amount<(allowZero?0:1) || amount>1000000000) fail('Enter a valid INR amount (maximum ₹1 crore).'); return amount; }
export function validDistance(distance,startedAt,now=Date.now()) { const elapsed=(now-new Date(startedAt).getTime())/1000; return Number.isInteger(distance) && distance>0 && elapsed>=0 && elapsed<=21600 && distance<=Math.ceil(elapsed*60+30); }
