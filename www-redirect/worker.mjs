export default {
  fetch(request) {
    const destination = new URL(request.url);
    destination.host = "bycomfortline.com";
    destination.protocol = "https:";
    return Response.redirect(destination.href, ["GET", "HEAD"].includes(request.method) ? 301 : 308);
  }
};
