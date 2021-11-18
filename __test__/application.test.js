const fetch = require('node-fetch');
const basePath = 'https://my-bookshop-srv-balanced-lizard-pw.cfapps.us10.hana.ondemand.com'

describe('Application Routes', () => {
    describe('Route GET /', () => {
        it('returns 200 OK', () => {
            return fetch(basePath)
                .then(response => {
                    expect(response.status).toBe(200)
                })
        })
    })
    
    describe('Route GET /catalog', () => {
        it('returns 200 OK, body contains route names', () => {
            return fetch(`${basePath}/catalog`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.value.length).toBeGreaterThan(0)
                    expect(data.value.find(route => route.name === 'Books')).toStrictEqual({"name":"Books","url":"Books"})
                })
        })
    })
})