const fetch = require('node-fetch');

const basePath = 'https://my-bookshop-srv-balanced-lizard-pw.cfapps.us10.hana.ondemand.com'

// Route tests for Books Entity
describe('Book Routes', () => {
    describe('GET /Books', () => {
        it('with valid input - returns 200 OK, body contains book data', () => {
            return fetch(`${basePath}/catalog/Books`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.value.length).toBeGreaterThan(0)
                    let book = data.value.find(book => book.ID === 201)
                    expect(book.ID).toBe(201)
                    expect(book.title).toBe('Wuthering Heights')
                    expect(book.author_ID).toBe(101)
                })
        })

        it('with valid book ID - returns 200 OK, response body contains book data for book with id: 201', () => {
            return fetch(`${basePath}/catalog/Books(201)`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.ID).toBe(201)
                    expect(data.title).toBe('Wuthering Heights')
                    expect(data.author_ID).toBe(101)
                })
        })

        it('with non-existent book ID - returns 404 Not Found', () => {
            return fetch(`${basePath}/catalog/Books(0)`)
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('404')
                    expect(data.error.message).toMatch(/Not Found/)
                })
        })

        it('with invalid book ID - returns 404 Not Found, not a valid key', () => {
            return fetch(`${basePath}/catalog/Books(someString)`)
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('404')
                    expect(data.error.message).toMatch(/not a valid key/)
                })
        })

        it('with missing author ID - returns 400 Bad Request, expected at least one key', () => {
            return fetch(`${basePath}/catalog/Books()`)
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Expected at least one key/)
                })
        })
    })

})