const mongoose = require('mongoose')

module.exports = {
    connect: () => {
		mongoose
			.connect("mongodb://127.0.0.1:27017/Ecolight", {
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