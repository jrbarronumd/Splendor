const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 8585
const app = express()
const server = http.createServer(app)

// Set static folder
app.use(express.static(path.join(__dirname, "public-files")))

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))