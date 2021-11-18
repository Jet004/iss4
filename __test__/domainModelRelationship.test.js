const exp = require('constants');
const fetch = require('node-fetch');

const basePath = 'https://my-bookshop-srv-balanced-lizard-pw.cfapps.us10.hana.ondemand.com'

describe('Test Domain Model Relationships', () => {
    beforeAll(() => {
        // Reset book stock
        return fetch(`${basePath}/catalog/Books(207)`, {
            method: "PUT",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                "ID": 207,
                "title": "Jane Eyre",
                "author_ID": 107,
                "stock": 11
            })
        })
            .then(response => {
                expect(response.status).toBe(200)
            })
            .then(() => {
                // Create Order with UUID to test domain model relationships
                return fetch(`${basePath}/catalog/Orders`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        "ID": "c13d3eec-942e-470d-97b3-e03322136637",
                        "book_ID": 207,
                        "amount": 10
                    })
                })
                    .then(response => {
                        if(!response.ok) return Promise.reject("Failed to set up order with UUID for testing domain model relationships")
                        return response.json()
                    })
            })
    })

    afterAll(() => {
        // Cleanup - delete order with id: c13d3eec-942e-470d-97b3-e03322136637
        return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136637)`, {
            method: "DELETE"
        })
            .then(response => {
                expect(response.status).toBe(204)
            })
    })

    it('GET /Orders?$expand=book - responds with all orders with book details', () => {
        return fetch(`${basePath}/catalog/Orders?$expand=book`)
            .then(response => {
                expect(response.status).toBe(200)
                return response.json()
            })
            .then(data => {
                let targetOrder = data.value.find(order => order.ID === "c13d3eec-942e-470d-97b3-e03322136637")
                expect(targetOrder.ID).toBe("c13d3eec-942e-470d-97b3-e03322136637")
                expect(targetOrder.book_ID).toBe(207)
                expect(targetOrder.book.author_ID).toBe(107)
            })
    })

    it('GET /Orders?$expand=book($expand=author) - responds with all orders with book and author details', () => {
        return fetch(`${basePath}/catalog/Orders?$expand=book($expand=author)`)
            .then(response => {
                expect(response.status).toBe(200)
                return response.json()
            })
            .then(data => {
                let targetOrder = data.value.find(order => order.ID === "c13d3eec-942e-470d-97b3-e03322136637")
                expect(targetOrder.ID).toBe("c13d3eec-942e-470d-97b3-e03322136637")
                expect(targetOrder.book_ID).toBe(207)
                expect(targetOrder.book.author.ID).toBe(107)
            })
    })

    it('GET /Books(207)/author - with valid book ID - responds with 200 OK', () => {
        return fetch(`${basePath}/catalog/Books(207)/author`)
            .then(response => {
                expect(response.status).toBe(200)
                return response.json()
            })
            .then(data => {
                expect(data.ID).toBe(107)
                expect(data.name).toBe("Charlote Brontë")
            })
    })

    it('GET /Books(someString)/author - with invalid book ID - responds with 404 Not Found', () => {
        return fetch(`${basePath}/catalog/Books(someString)/author`)
            .then(response => {
                expect(response.status).toBe(404)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("404")
                expect(data.error.message).toMatch(/is not a valid key/)
            })
    })

    it('GET /Books()/author - with missing book ID - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Books()/author`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
                expect(data.error.message).toMatch(/Expected at least one key/)
            })
    })

    it('GET /Books/author - with missing parameter - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Books/author`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
            })
    })

    it('GET /Authors(107)/books - with valid author ID - responds with 200 OK', () => {
        return fetch(`${basePath}/catalog/Authors(107)/books`)
            .then(response => {
                expect(response.status).toBe(200)
                return response.json()
            })
            .then(data => {
                let target = data.value.find(x => x.ID === 207)
                expect(target.ID).toBe(207)
                expect(target.title).toBe("Jane Eyre")
            })
    })

    it('GET /Authors(someString)/books - with invalid author ID - responds with 404 Not Found', () => {
        return fetch(`${basePath}/catalog/Authors(someString)/books`)
            .then(response => {
                expect(response.status).toBe(404)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("404")
                expect(data.error.message).toMatch(/is not a valid key/)
            })
    })

    it('GET /Authors()/books - with missing author ID - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Authors()/books`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
                expect(data.error.message).toMatch(/Expected at least one key/)
            })
    })

    it('GET /Authors/books - with missing parameter - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Authors/books`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
            })
    })

    it('GET /Authors(107)/name - with valid author ID - responds with 200 OK', () => {
        return fetch(`${basePath}/catalog/Authors(107)/name`)
            .then(response => {
                expect(response.status).toBe(200)
                return response.json()
            })
            .then(data => {
                expect(data.value).toBe("Charlote Brontë")
            })
    })

    it('GET /Authors(someString)/name - with invalid author ID - responds with 404 Not Found', () => {
        return fetch(`${basePath}/catalog/Authors(someString)/name`)
            .then(response => {
                expect(response.status).toBe(404)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("404")
                expect(data.error.message).toMatch(/is not a valid key/)
            })
    })

    it('GET /Authors()/name - with missing author ID - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Authors()/name`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
                expect(data.error.message).toMatch(/Expected at least one key/)
            })
    })

    it('GET /Authors/name - with missing parameter - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Authors/name`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
            })
    })

    it('GET /Authors(107)/books?$select=title - with valid author ID - responds with 200 OK', () => {
        return fetch(`${basePath}/catalog/Authors(107)/books?$select=title`)
            .then(response => {
                expect(response.status).toBe(200)
                return response.json()
            })
            .then(data => {
                let book = data.value.find(x => x.ID === 207)
                expect(book.title).toBe("Jane Eyre")
            })
    })

    it('GET /Authors(someString)/books?$select=title - with invalid author ID - responds with 404 Not Found', () => {
        return fetch(`${basePath}/catalog/Authors(someString)/books?$select=title`)
            .then(response => {
                expect(response.status).toBe(404)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("404")
                expect(data.error.message).toMatch(/is not a valid key/)
            })
    })

    it('GET /Authors()/books?$select=title - with missing author ID - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Authors()/books?$select=title`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
                expect(data.error.message).toMatch(/Expected at least one key/)
            })
    })

    it('GET /Authors/books?$select=title - with missing parameter - responds with 400 Bad Request', () => {
        return fetch(`${basePath}/catalog/Authors/books?$select=title`)
            .then(response => {
                expect(response.status).toBe(400)
                return response.json()
            })
            .then(data => {
                expect(data.error.code).toBe("400")
            })
    })
})