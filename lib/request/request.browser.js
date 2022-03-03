'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.post = post;
function post(url, body, timeout) {
    return new Promise(function (resolve, reject) {
        return Promise.race([fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(body)
        }).then(function (response) {
            return response.json().then(function (respJson) {
                return resolve([respJson, response.status]);
            });
        }).catch(function (err) {
            return reject(err);
        }), new Promise(function (_, reject) {
            return setTimeout(function () {
                return reject(new Error('timeout'));
            }, timeout);
        })]);
    });
}