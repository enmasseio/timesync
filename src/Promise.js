module.exports = (typeof window === 'undefined' || typeof window.Promise === 'undefined') ?
    require('promise') :
    window.Promise;
