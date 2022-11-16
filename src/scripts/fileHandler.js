var fs = require('fs')

fs.readFile("/Users/jarvis/Documents/Projects/plethora-nft/src/plethoraNft_frontend/assets/nft.jpeg",async function(err, data) {
  if (err) throw err
  const ab = new ArrayBuffer(data.length);
    const view = new Uint8Array(ab);
    console.log(view.toString())
})