const app = require('./app');

app.listen(process.env.SERVER_PORT, process.env.SERVER_ADDRESS, () => {
  console.log(
    `a server has started at address ${
      process.env.SERVER_ADDRESS
    } at the port ${process.env.SERVER_PORT}`
  );
});
