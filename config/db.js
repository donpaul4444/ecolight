const mongoose = require('mongoose')
const databaseurl=process.env.databaseurl

module.exports = {
    connect: () => {
		mongoose
			.connect(databaseurl, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			})
			.then(data => {
				console.log(`Mongodb connected with server: ${data.connection.host}`)
			})
			.catch(error => {
				console.error('Error connecting to MongoDB:', error)
			})
	},
}