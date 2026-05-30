import ImageKit from "@imagekit/nodejs";

const client = new ImageKit({
  privateKey: "private_hXfWNCVNilCn08WWKajMZj91rWQ=",
});

async function run() {
  const res = await client.files.upload({
    file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    fileName: "test-from-agent.png"
  });
  console.log("UPLOAD SUCCESS. URL:", res.url);
}
run().catch(console.error);
