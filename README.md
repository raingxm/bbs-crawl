### setup
NODE_ENV=development pm2 start app.js --name 'bbs' --watch

npm run client-dev

### build
npm run client-build