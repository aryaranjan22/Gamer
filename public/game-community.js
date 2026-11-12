// Requests are ordered so a completed run is saved before a new run starts.
let communityRun=null;
let communityQueue=Promise.resolve();
function communityStatus(message){const el=document.getElementById('community-status');if(el)el.textContent=message;}
async function communityRequest(path,body){const r=await fetch('/api/'+path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.error),{status:r.status});return data;}
function communityFinish(distance){const run=communityRun;communityRun=null;if(!run)return communityQueue;communityQueue=communityQueue.then(async()=>{const id=await run.id;if(id&&distance>0){await communityRequest('scores',{runId:id,distance});communityStatus('Run saved to worldwide ranks.');}}).catch(e=>communityStatus(e.message||'Score could not be saved.'));return communityQueue;}
function communityStart(mode,distance){communityFinish(distance);const run={id:null};run.id=communityQueue.then(()=>communityRequest('runs',{mode})).then(r=>{communityStatus('Worldwide run active.');return r.id;}).catch(e=>{communityStatus(e.status===401?'Sign in on Worldwide ranks to post scores.':e.message||'Rankings unavailable.');return null;});communityQueue=run.id.then(()=>{});communityRun=run;}
