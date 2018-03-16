const path = require('path');
const Vue = require('vue');
const server = require('express')();
const createRenderer = require('vue-server-renderer').createRenderer;
const templateDir = path.resolve(__dirname, 'template.html');

server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  });
  const renderer = createRenderer({
    template: require('fs').readFileSync(templateDir, 'utf-8')
  });
  const context = {
    title: 'hello',
    meta: `
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    `
  }
  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      console.log(err);
      res.status(500).end('Internal Server Error');
      return;
    }
    console.log(html) // will be the full page with app content injected.
    res.end(html);
  })
})
server.listen(7000, () => {
  console.log(`Listening on port 7000`);
});