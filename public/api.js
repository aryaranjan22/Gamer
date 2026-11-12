export async function api(path,method='GET',body) {
 const res=await fetch('/api/'+path,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 const data=await res.json();if(!res.ok)throw new Error(data.error||'Please try again.');return data;
}
export const money=p=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(p/100);
export function status(id,message,error=false){const el=document.getElementById(id);el.textContent=message;el.classList.toggle('error',error);}
export function countries(select){const names=new Intl.DisplayNames(['en'],{type:'region'});const list=[];for(let a=65;a<=90;a++)for(let b=65;b<=90;b++){const code=String.fromCharCode(a,b),label=names.of(code);if(label!==code)list.push([code,label]);}for(const [code,label] of list.sort((a,b)=>a[1].localeCompare(b[1]))){const o=new Option(label,code);select.add(o);}}
export function region(code){return code?new Intl.DisplayNames(['en'],{type:'region'}).of(code):'Worldwide';}
