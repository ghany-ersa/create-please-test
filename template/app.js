const Please = require('please-test')
const AuthComponent = require('./components/auth')

const please = new Please()

module.exports = {
    please,
    AUTH: new AuthComponent(please)
}
