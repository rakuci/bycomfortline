// Independent public URL spot checks for Search Console "Crawled - currently not indexed".
//
// This detects response, canonical, robots, and basic HTML defects, but cannot
// determine Google's index-selection decision or impersonate verified Googlebot.
// Run from an external CI network: node scripts/check-gsc-77-live.mjs
const site="https://bycomfortline.com";
const samples=[
  "/ru/goroda-belarusi/brest/",
  "/ru/goroda-belarusi/msq/",
  "/lv/baltkrievijas-galamerki/minsk/",
  "/ru/aeroport-lcj-minsk/",
  "/pl/wroclaw-minsk-transfer/",
  "/ru/transfery/vno-baranovichi/",
  "/en/transfers/bialystok-brest/",
  "/de/privattransfers/cdg-grodno/"
];
const results=await Promise.all(samples.map(async path=>{
  const url=site+path;
  try{
    const response=await fetch(url,{
      redirect:"follow",
      signal:AbortSignal.timeout(16000),
      headers:{"User-Agent":"ComfortLine-Public-Crawler-Diagnostic/1.0"}
    });
    const html=await response.text();
    const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]||"";
    const title=html.match(/<title>([^<]+)/)?.[1]||"";
    const robots=html.match(/<meta name="robots" content="([^"]+)"/)?.[1]||"";
    const h1=(html.match(/<h1(?:\s[^>]*)?>/g)||[]).length;
    const challenged=/challenge-platform|just a moment|attention required/i.test(html);
    const result={path,status:response.status,contentType:response.headers.get("content-type"),canonical,robots,h1,titleLength:title.length,bytes:html.length,challenged,redirectedTo:response.url};
    console.log("PUBLIC_SAMPLE "+JSON.stringify(result));
    const ok=response.status===200&&canonical===url&&
      robots.includes("index,follow")&&!robots.includes("noindex")&&
      h1===1&&!challenged&&html.includes("<main>");
    return {path,ok,result};
  }catch(error){
    console.log("PUBLIC_SAMPLE "+JSON.stringify({path,error:String(error?.message||error)}));
    return {path,ok:false};
  }
}));
const bad=results.filter(r=>!r.ok);
if(bad.length) {
  console.error("PUBLIC URL TECHNICAL WARNING: "+bad.map(x=>x.path).join(", "));
  process.exitCode=1;
} else {
  console.log("PUBLIC URL CHECK OK: "+results.length+" indexable HTML responses. This DOES NOT mean Google has indexed them.");
}
const mirrors=["https://bycomfortline.by/ru/goroda-belarusi/brest/","https://www.bycomfortline.com/ru/goroda-belarusi/brest/"];
for(const alias of mirrors){
  try{
    const response=await fetch(alias,{
      redirect:"manual",
      signal:AbortSignal.timeout(12000),
      headers:{"User-Agent":"ComfortLine-Duplicate-Host-Audit/1.0"}
    });
    console.log("ALIAS_RESPONSE "+JSON.stringify({url:alias,status:response.status,location:response.headers.get("location")||"",warning:response.status!==301?"Not permanently redirecting to canonical host; inspect Cloudflare routes/redirect rules.":""}));
  }catch(error){console.log("ALIAS_RESPONSE "+JSON.stringify({url:alias,error:String(error?.message||error)}));}
}
