import { randomUUID } from 'node:crypto';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { settings, profiles, scores, runs, donations } from '../../db/schema.ts';
import * as v from './validation.mjs';
export const config={path:'/api/*'};
async function user(req) {
  const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('nf_jwt='))?.slice(7);
  if(!token || !process.env.URL) v.fail('Sign in to continue.',401);
  const res=await fetch(new URL('/.netlify/identity/user',process.env.URL),{headers:{Authorization:`Bearer ${decodeURIComponent(token)}`},signal:AbortSignal.timeout(8000)});
  if(!res.ok) v.fail('Sign in to continue.',401);
  return res.json();
}
async function admin(req) { const u=await user(req); if(!u.app_metadata?.roles?.includes('admin')) v.fail('An owner account with the admin role is required.',403); return u; }
export default async function handler(req) {
 try {
  const url=new URL(req.url), path=url.pathname, method=req.method;
  if(method!=='GET') {
    const allowedOrigins = [url.origin,process.env.URL,process.env.DEPLOY_URL,process.env.DEPLOY_PRIME_URL].filter(Boolean).map(value=>new URL(value).origin);
    if(process.env.NETLIFY_DEV==='true') allowedOrigins.push('http://localhost:8889','http://127.0.0.1:8889');
    if(!allowedOrigins.includes(req.headers.get('origin'))) v.fail('Request origin rejected.',403);
    if(!req.headers.get('content-type')?.startsWith('application/json')) v.fail('JSON required.',415);
    if(Number(req.headers.get('content-length'))>10000) v.fail('Request too large.',413);
  }
  const body=async()=>{const raw=await req.text();if(raw.length>10000)v.fail('Request too large.',413);try{return JSON.parse(raw);}catch{v.fail('Invalid JSON.');}};
  let data;
  if(path==='/api/settings' && method==='GET') data=(await db.select().from(settings).where(eq(settings.id,1)))[0]??{coffeeUrl:'',razorpayUrl:'',message:'Help keep paperweight moving.',goalPaise:0};
  else if(path==='/api/settings' && method==='PUT') {
    await admin(req);const b=await body(); if(typeof b.message!=='string'||b.message.length>500)v.fail('Message must be at most 500 characters.');
    const value={id:1,coffeeUrl:v.paymentUrl(b.coffeeUrl,'coffee'),razorpayUrl:v.paymentUrl(b.razorpayUrl,'razorpay'),message:b.message,goalPaise:v.paise(b.goalPaise,true)};
    await db.insert(settings).values(value).onConflictDoUpdate({target:settings.id,set:value});data={ok:true};
  } else if(path==='/api/me' && method==='GET') {const u=await user(req);data={id:u.id,admin:u.app_metadata?.roles?.includes('admin')??false,profile:(await db.select().from(profiles).where(eq(profiles.id,u.id)))[0]??null};}
  else if(path==='/api/profile' && method==='PUT') {const u=await user(req), b=await body();const p={id:u.id,name:v.name(b.name),country:v.country(b.country)};await db.insert(profiles).values(p).onConflictDoUpdate({target:profiles.id,set:p});data={ok:true};}
  else if(path==='/api/runs' && method==='POST') {
    const u=await user(req),b=await body();const m=v.mode(b.mode);
    if(!(await db.select().from(profiles).where(eq(profiles.id,u.id)))[0])v.fail('Set your player name on the leaderboard page first.');
    await db.delete(runs).where(eq(runs.userId,u.id));const id=randomUUID();await db.insert(runs).values({id,userId:u.id,mode:m});data={id};
  } else if(path==='/api/scores' && method==='POST') {
    const u=await user(req),b=await body(); if(typeof b.runId!=='string'||!/^[0-9a-f-]{36}$/.test(b.runId))v.fail('Invalid run.');
    const [run]=await db.delete(runs).where(and(eq(runs.id,b.runId),eq(runs.userId,u.id))).returning();
    if(!run||!v.validDistance(b.distance,run.startedAt))v.fail('This run could not be accepted. Start a new run.');
    await db.insert(scores).values({userId:u.id,mode:run.mode,distance:b.distance}).onConflictDoUpdate({target:[scores.userId,scores.mode],set:{distance:sql`greatest(${scores.distance}, ${b.distance})`,updatedAt:new Date()}});data={ok:true};
  } else if(path==='/api/leaderboard' && method==='GET') {
    const m=v.mode(url.searchParams.get('mode')??'endless');data=await db.select({name:profiles.name,country:profiles.country,distance:scores.distance}).from(scores).innerJoin(profiles,eq(scores.userId,profiles.id)).where(eq(scores.mode,m)).orderBy(desc(scores.distance),scores.updatedAt,scores.userId).limit(100);
  } else if(path==='/api/supporters' && method==='GET') {
    const rows=await db.select({name:donations.name,country:donations.country,amountPaise:sql`sum(${donations.amountPaise})::bigint`}).from(donations).groupBy(donations.name,donations.country).orderBy(desc(sql`sum(${donations.amountPaise})`),donations.name,donations.country).limit(100);
    const [total]=await db.select({amountPaise:sql`coalesce(sum(${donations.amountPaise}),0)::bigint`}).from(donations);data={rows,totalPaise:Number(total.amountPaise)};
  } else if(path==='/api/donations' && method==='POST') {
    await admin(req);const b=await body();if(!['coffee','razorpay'].includes(b.provider))v.fail('Choose a provider.');if(typeof b.reference!=='string'||!b.reference.trim()||b.reference.length>100)v.fail('Enter the unique payment reference.');
    await db.insert(donations).values({id:randomUUID(),name:v.name(b.name),country:v.country(b.country),provider:b.provider,reference:b.provider+':'+b.reference.trim(),amountPaise:v.paise(b.amountPaise)}).onConflictDoNothing({target:donations.reference});data={ok:true};
  } else if(path==='/api/donations' && method==='GET') {await admin(req);data=await db.select().from(donations).orderBy(desc(donations.createdAt)).limit(100);}
  else if(path==='/api/donations' && method==='DELETE') {await admin(req);const b=await body();if(!/^[0-9a-f-]{36}$/.test(b.id))v.fail('Invalid donation.');await db.delete(donations).where(eq(donations.id,b.id));data={ok:true};}
  else if(path==='/api/rates' && method==='GET') {const res=await fetch('https://open.er-api.com/v6/latest/INR',{signal:AbortSignal.timeout(6000)});if(!res.ok)v.fail('Currency estimates are temporarily unavailable.',503);const rates=await res.json();if(rates.result!=='success')v.fail('Currency estimates are temporarily unavailable.',503);data={rates:rates.rates,date:new Date(rates.time_last_update_unix*1000).toISOString().slice(0,10)};}
  else return Response.json({error:'Not found.'},{status:404});
  return Response.json(data,{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:e.status?e.message:'Something went wrong. Please try again.'},{status:e.status??503,headers:{'Cache-Control':'no-store'}});}
}
