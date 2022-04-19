const app = require('./app');
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
    console.log(`Capstone application listening on ${PORT}`);
})
