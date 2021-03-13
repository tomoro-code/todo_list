const httpStatus = require('http-status-codes');

module.exports = {
    notFound: (req, res) => {
        let errorCode = httpStatus.NOT_FOUND;
        res.status(errorCode);
        res.send(`the page you're looking for: ${req.url} is not found`);
    },
    internalServerError: (error, req, res, next) => {
        let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
        res.status(errorCode);
        console.log(error.stack);
        res.send(`something went wrong in the server: ${errorCode}`);
    }
}