import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import worker from "../src/worker.mjs";
import {editorialContributionLocale} from "../travel-guide-contribution-locales.mjs";

const langs=["en","ru","pl","lt","lv","de","fr"];
assert.equal(Object.keys(editorialContributionLocale).length,7,"Each language needs form labels");
const script=await readFile("dist/assets/app.js","utf8");
const style=await readFile("dist/assets/style.css","utf8");
assert(script.includes('"/api/travel-guide-submission"'),"Missing form frontend handler");
assert(style.includes(".travel-guide-contribute")&&style.includes(".guide-story-form-status"),"Missing story form styles");
for(const lang of langs){
 const html=await readFile(`dist/${lang}/travel-guide/index.html`,"utf8");
 const l=editorialContributionLocale[lang];
 assert(html.includes(l.heading),lang+": suggestion invitation missing");
 assert(html.includes(l.consent),lang+": explicit consent missing");
 assert(html.includes('id="share-your-story"'),lang+": share anchor missing");
 assert(html.includes('action="/api/travel-guide-submission"'),lang+": action missing");
 assert(html.includes('name="type"')&&html.includes('value="idea"')&&html.includes('value="story"'),lang+": two submission kinds missing");
 assert(html.includes('name="title"')&&html.includes('name="message"'),lang+": required fields missing");
 assert(html.includes('name="email"')&&html.includes('name="consent"'),lang+": contact/consent fields missing");
 assert(html.includes('name="website"'),lang+": anti-bot honeypot missing");
 assert(!html.includes('travel-guide-card-status')&&!html.includes('travel-guide-grid'),lang+": unpublished placeholder cards should be gone");
 assert(html.includes('travel-guide-featured-cash')&&html.includes('travel-guide-featured-car'),lang+": published article cards must remain");
}

const url="https://bycomfortline.com/api/travel-guide-submission";
const makeRequest=(body, extraHeaders={})=>new Request(url,{method:"POST",headers:{"Origin":"https://bycomfortline.com","Content-Type":"application/json",...extraHeaders},body:JSON.stringify(body)});
const valid={lang:"en",type:"story",title:"Border experience about documents",message:"This is a genuine story about a border crossing that other travelers should know.",name:"Helpful reader",email:"reader@example.org",website:"",consent:true};
let requests=0, recorded=null;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(_url,options)=>{
 requests++;recorded={url:_url,options,payload:JSON.parse(options.body)};
 return new Response(JSON.stringify({id:"re_acceptable_test_123"}),{status:200,headers:{"Content-Type":"application/json"}});
};
try {
 const badCases=[
  [{...valid,consent:false},400],
  [{...valid,message:"short"},400],
  [{...valid,lang:"zz"},400],
  [{...valid,type:"other"},400],
  [{...valid,website:"https://spam.example"},400],
  [{...valid,email:"not-an-email"},400],
  [{...valid,title:"test\r\nBad: header"},400]
 ];
 for(const [payload,expected] of badCases){
  const response=await worker.fetch(makeRequest(payload),{RESEND_API_KEY:"test-key"});
  assert.equal(response.status,expected,"Invalid form must be rejected");
 }
 assert.equal(requests,0,"No email should be sent for invalid/bot payloads");
 const forged=await worker.fetch(makeRequest(valid,{"Origin":"https://evil.example"}),{RESEND_API_KEY:"test-key"});
 assert.equal(forged.status,403,"Block cross-site requests");
 const wrongMethod=await worker.fetch(new Request(url),{RESEND_API_KEY:"test-key"});
 assert.equal(wrongMethod.status,405);
 const unavailable=await worker.fetch(makeRequest(valid),{});
 assert.equal(unavailable.status,503,"Missing Resend key should be a safe error");
 const accepted=await worker.fetch(makeRequest(valid),{RESEND_API_KEY:"test-key"});
 const data=await accepted.json();
 assert.equal(accepted.status,200);
 assert(data.success&&/^TG-[0-9]{8}-[A-F0-9]{10}$/.test(data.reference),"Valid submission needs a reference");
 assert.equal(requests,1,"Valid story should dispatch one message");
 assert.equal(recorded.url,"https://api.resend.com/emails");
 assert.equal(recorded.payload.to[0],"info@comfortline.by");
 assert.equal(recorded.payload.reply_to,"reader@example.org");
 assert(recorded.payload.text.includes("Border experience about documents"));
 assert(recorded.payload.text.includes("\n"),"Plain text email should contain newlines");
 assert(recorded.payload.html.includes("Border experience about documents"));
 assert(!recorded.payload.html.includes("<script>"),"Email template must escape HTML");
}finally{
 globalThis.fetch=originalFetch;
}
console.log("Verified seven Travel Guide contribution forms, locale copy and secure Resend request validation.");
