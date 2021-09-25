class ExpressError extends Error {
    constructor(m, s) {
        super(m);
        this.status = s;
    }
}

module.exports = ExpressError;
