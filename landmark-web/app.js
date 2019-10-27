// landmark-web/app.js
// Main JS application for this project.
// Made with express.js
// Contributors: Kelly Fesler

// Starter code
const express = require('express')
var cors = require('cors')
const app = express()
const port = 3000

app.use(cors())

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
