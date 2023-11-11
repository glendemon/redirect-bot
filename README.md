# Messenger backend
This is the Node.js backend for the Messenger app.
Uses puppeteer with headless chrome to run and control the web version of WhatsApp through the whatsapp-web.js package.

It also contains a simple websocket server on Socket.IO to communicate with the frontend.

## Examples

```shell
docker-compose run puppeteer yarn test
```
