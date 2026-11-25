import assert from "node:assert/strict";
import worker from "../src/worker.mjs";
const env={INSTAGRAM_ACCESS_TOKEN:"test-secret",INSTAGRAM_USER_ID:"123",INSTAGRAM_API_VERSION:"v27.0"};
const request=()=>new Request("https://bycomfortline.com/api/instagram-feed");
const originalFetch=globalThis.fetch;
try {
  assert.equal((await worker.fetch(request(),{})).status,503);
  assert.equal((await worker.fetch(new Request(request().url,{method:"POST"}),env)).status,405);
  globalThis.fetch=async(url,options)=>{
    assert.equal(new URL(url).hostname,"graph.facebook.com");
    assert.equal(new URL(url).pathname,"/v27.0/123/media");
    assert.equal(options.headers.Authorization,"Bearer test-secret");
    assert.ok(!url.includes("test-secret"));
    return Response.json({data:[
      {media_type:"IMAGE",media_url:"https://scontent.cdninstagram.com/photo.jpg",permalink:"https://www.instagram.com/p/abc/",caption:"A journey"},
      {media_type:"VIDEO",thumbnail_url:"https://scontent.fbcdn.net/reel.jpg",permalink:"https://www.instagram.com/reel/def/"},
      {media_type:"IMAGE",media_url:"https://example.com/bad.jpg",permalink:"https://www.instagram.com/p/bad/"},
      {media_type:"IMAGE",media_url:"https://scontent.cdninstagram.com/photo.jpg",permalink:"https://example.com/bad/"}
    ],paging:{next:"https://graph.facebook.com/?access_token=test-secret"}});
  };
  const response=await worker.fetch(request(),env);
  assert.equal(response.status,200);
  const body=await response.text();
  assert.ok(!body.includes("test-secret"));
  assert.equal(JSON.parse(body).posts.length,2);
  assert.equal(JSON.parse(body).posts[1].image,"https://scontent.fbcdn.net/reel.jpg");
  globalThis.fetch=async()=>Response.json({error:{message:"test-secret"}},{status:400});
  const failed=await worker.fetch(request(),env);
  assert.equal(failed.status,503);
  assert.ok(!(await failed.text()).includes("test-secret"));
  console.log("Instagram feed: authentication, sanitization, thumbnails and failure checks passed");
} finally {globalThis.fetch=originalFetch;}
