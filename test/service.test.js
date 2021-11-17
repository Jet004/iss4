const exp = require('constants')
const fetch = require('node-fetch');
const { response } = require('express');

const basePath = 'https://my-bookshop-srv-balanced-lizard-pw.cfapps.us10.hana.ondemand.com'

// request helper function
class HTTPResponseError extends Error {
	constructor(response, ...args) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`, ...args);
		this.response = response;
	}
}

const checkStatus = response => {
	if (response.ok) {
		// response.status >= 200 && response.status < 300
		return response;
	} else {
		throw new HTTPResponseError(response);
	}
}


beforeAll(() => {
    let bookData = {
        "ID": 201,
        "title": "Wuthering Heights",
        "author_ID": 101,
        "stock": 100
    }

    return fetch(`${basePath}/catalog/Books(201)`, {
        method: "PUT",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(bookData)
    })
        .then(response => {
            if(!response.ok) return Promise.reject("setup failed")
        })
})

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


// Route tests for Authors Entity
describe('Route /Authors', () => {
    describe('GET /Authors', () => {
        it('with valid input - returns 200 OK, body contains author data', () => {
            return fetch(`${basePath}/catalog/Authors`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.value.length).toBeGreaterThan(0)
                    expect(data.value.find(author => author.ID === 101)).toStrictEqual({"ID":101,"name":"Emily Brontë"})
                })
        })

        it('with author ID - returns 200 OK with details of author with id: 101', () => {
            return fetch(`${basePath}/catalog/Authors(101)`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.ID).toBe(101)
                    expect(data.name).toMatch(/Emily Brontë/)
                })
        })

        it('with non-existent author ID - returns 404 Not Found', () => {
            return fetch(`${basePath}/catalog/Authors(${0})`)
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toMatch(/404/)
                    expect(data.error.message).toMatch(/Not Found/)
                })
        })

        it('with invalid author ID - returns 404 Not Found', () => {
            return fetch(`${basePath}/catalog/Authors(string)`)
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("404")
                    expect(data.error.message).toMatch(/not a valid key/)
                })
        })

        it('with missing author ID - returns 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors()`)
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

    describe('POST /Authors', () => {
        it('with valid input - responds with 201 Created, creates a new author in the database with id: 200', () => {
            return fetch(`${basePath}/catalog/Authors`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": 200, "name": "Robert Jordan"})
            })
                .then(response => {
                    expect(response.status).toBe(201)
                    return response.json()
                })
                .then(data => {
                    expect(data.ID).toBe(200)
                    expect(data.name).toBe("Robert Jordan")
                })

        })

        it('with non INT id - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": "someString", "name": "Robert Jordan"})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Invalid value/)
                })
                
        })

        it('with non STRING name - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": 200, "name": 8888})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Invalid value/)
                })
                
        })

        it('with no body - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Unexpected end of JSON input/)
                })
                
        })
    })

    describe('PUT /Authors(200)', () => {
        it('with valid input - reponds with 200 OK, updates author in database', () => {
            return fetch(`${basePath}/catalog/Authors(200)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": 200, "name": "R Jordan"})
            })
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.ID).toBe(200)
                    expect(data.name).toBe("R Jordan")
                })
                
        })

        it('with no id in request - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors()`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": 200, "name": "R Jordan"})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Expected at least one key/)
                })
                
        })

        it('with no parameter in request - responds with 405 Method Not Allowed', () => {
            return fetch(`${basePath}/catalog/Authors`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": 200, "name": "R Jordan"})
            })
                .then(response => {
                    expect(response.status).toBe(405)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('405')
                    expect(data.error.message).toMatch(/Method PUT not allowed/)
                })
                
        })

        it('with non INT id - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors(200)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": "someString", "name": "R Jordan"})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Invalid value/)
                })
                
        })

        it('with non STRING name - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors(200)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": 200, "name": 8888})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Invalid value/)
                })
                
        })

        it('with no body - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors(200)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Unexpected end of JSON input/)
                })
                
        })
    })

    describe('DELETE /Authors(200)', () => {
        it('with valid input - responds with 204 No Content', () => {
            return fetch(`${basePath}/catalog/Authors(200)`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(204)
                })
                
        })

        it('with no id parameter - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Authors()`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    expect(response.statusText).toBe("Bad Request")
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch(/Expected at least one key/)
                })
        })

        it('with missing parameter - responds with 405 Method Not Allowed', () => {
            return fetch(`${basePath}/catalog/Authors`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(405)
                    expect(response.statusText).toBe("Method Not Allowed")
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('405')
                    expect(data.error.message).toMatch(/Method DELETE not allowed/)
                })
        })
    })

})


// Route tests for Books Entity
describe('Route /Books', () => {
    describe('GET /Books', () => {
        it('with valid input - returns 200 OK, body contains book data', () => {
            return fetch(`${basePath}/catalog/Books`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.value.length).toBeGreaterThan(0)
                    expect(data.value.find(book => book.ID === 201)).toStrictEqual({ ID: 201, title: 'Wuthering Heights', author_ID: 101, stock: 100 })
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

// Route tests for Orders Entity
describe('Route /Orders', () => {
    describe('POST /Orders', () => {
        beforeEach(() => {
            let bookData = {
                "ID": 201,
                "title": "Wuthering Heights",
                "author_ID": 101,
                "stock": 100
            }

            return fetch(`${basePath}/catalog/Books(201)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(bookData)
            })
                .then(response => {
                    if(!response.ok) return Promise.reject("setup failed")
                })
        })

        it('without UUID - responds with 201 Created, creates an order in the database with an auto-generated UUID, reduces book stock by "amount"', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"book_ID": 201, "amount": 1})
            })
            .then(response => {
                expect(response.status).toBe(201)
                return response.json()
            })
            .then(data => {
                expect(data.book_ID).toBe(201)
                expect(data.amount).toBe(1)
            })
            .then(() => {
                return fetch(`${basePath}/catalog/Books(201)`)
                    .then(response => {
                        expect(response.status).toBe(200)
                        return response.json()
                    })
                    .then(data => {
                        expect(data.stock).toBe(99)
                    })
                    
            })
            
        })

        it('with UUID - responds with 201 Created, creates an order in the database with the given UUID if not exists, reduces book stock by "amount"', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": "c13d3eec-942e-470d-97b3-e03322136636", "book_ID": 201, "amount": 12})
            })
            .then(response => {
                expect(response.status).toBe(201)
                return response.json()
            })
            .then(data => {
                expect(data.ID).toBe("c13d3eec-942e-470d-97b3-e03322136636")
                expect(data.book_ID).toBe(201)
                expect(data.amount).toBe(12)
            })
            .then(() => {
                return fetch(`${basePath}/catalog/Books(201)`)
                    .then(response => {
                        expect(response.status).toBe(200)
                        return response.json()
                    })
                    .then(data => {
                        expect(data.stock).toBe(88)
                    })
                    
            })
            
        })
    })

    describe('POST /Orders - should fail', () => {
        it('with UUID - responds with 400 Bad Request, Order with this ID already exists', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": "c13d3eec-942e-470d-97b3-e03322136636", "book_ID": 201, "amount": 12})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe('400')
                    expect(data.error.message).toMatch('Entity already exists')
                })
                
        })

        // This test responds with 409 Conflict as there is no check to ascertain whether or not a book
        // exists with the given ID before it attempts to decrement stock - when the decrement fails it
        // returns 409 Conflict and assumes that the book is sold out - it actually doesn't exist at all.
        // I haven't implemented code in the application to fix this as this is a testing project and that
        // is outside the scope of requirements
        it('with non-existent book_ID - responds with 409 Conflict', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"book_ID": 0, "amount": 1})
            })
                .then(response => {
                    expect(response.status).toBe(409)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("409")
                    expect(data.error.message).toMatch(/Sold out, sorry/)
                })
                
        })

        it('with invlaid UUID - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"ID": "c13d3eec-942e470d97b3e03322136636", "book_ID": 201, "amount": 0})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Invalid value/)
                })
        })

        it('with invalid book_ID - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"book_ID": "someString", "amount": 12})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Invalid value/)
                })
        })

        it('with amount of 0 - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"book_ID": 201, "amount": 0})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Order at least 1 book/)
                })
        })

        it('with invalid amount - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({"book_ID": 201, "amount": "someString"})
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Invalid value/)
                })
        })

        // This test for the actual implementation of 409 conflict when an order is placed for 0 books
        it('with book stock = 0 - responds with 409 Conflict', () => {
            // Set up database for test
            return fetch(`${basePath}/catalog/Books(201)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "ID": 201,
                    "title": "Wuthering Heights",
                    "author_ID": 101,
                    "stock": 0
                })
            })
                .then(response => {
                    // Database setup for test failed - error out of promise
                    if(!response.ok) return Promise.reject("Could not set book stock value before test")
                    // Database setup is done, run test
                    return fetch(`${basePath}/catalog/Orders`, {
                        method: "POST",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify({"book_ID": 201, "amount": 1})
                    })
                        .then(response => {
                            expect(response.status).toBe(409)
                            return response.json()
                        })
                        .then(data => {
                            expect(data.error.code).toBe("409")
                            expect(data.error.message).toMatch(/Sold out, sorry/)
                        })
                })
                .then(() => {
                    // Reset book stock level to 100 books
                    return fetch(`${basePath}/catalog/Books(201)`, {
                        method: "PUT",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify({
                            "ID": 201,
                            "title": "Wuthering Heights",
                            "author_ID": 101,
                            "stock": 100
                        })
                    })
                    .then(response => {
                        if(!response.ok) return Promise.reject("Database error, could not reset database to original state after running test")
                    })
                })
        })
    })
    
    describe('GET /Orders', () => {
        it('responds with a list of all orders in the database', () => {
            return fetch(`${basePath}/catalog/Orders`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.value.length).toBeGreaterThan(2)
                    let testOrder = data.value.find(order => order.ID === "c13d3eec-942e-470d-97b3-e03322136636")
                    expect(testOrder).toBeDefined()
                    expect(testOrder.book_ID).toBe(201)
                })
                
        })

        it('responds with details of a single order', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136636)`)
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.ID).toBe("c13d3eec-942e-470d-97b3-e03322136636")
                    expect(data.book_ID).toBe(201)
                })
        })

        it('with invalid Order ID - responds with 404 Not Found', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3e03322136636)`)
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("404")
                    expect(data.error.message).toMatch(/not a valid key/)
                })
        })

        it('with missing Order ID - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders()`)
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Expected at least one key/)
                })
        })
    })

    describe('PUT /Orders', () => {
        it('with valid inputs - responds with 200 OK', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136636)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "ID": "c13d3eec-942e-470d-97b3-e03322136636",
                    "book_ID": 201,
                    "amount": 10
                  })
            })
                .then(response => {
                    expect(response.status).toBe(200)
                    return response.json()
                })
                .then(data => {
                    expect(data.ID).toBe("c13d3eec-942e-470d-97b3-e03322136636")
                    expect(data.amount).toBe(10)
                })
        })

        it('with non-existent book_ID - respond with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136636)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "ID": "c13d3eec-942e-470d-97b3-e03322136636",
                    "book_ID": 0,
                    "amount": 10
                  })
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Reference integrity is violated/)
                })
        })

        it('with invalid book_ID - respond with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136636)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "ID": "c13d3eec-942e-470d-97b3-e03322136636",
                    "book_ID": "someString",
                    "amount": 10
                  })
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Invalid value/)
                })
        })

        it('with invalid amount - respond with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136636)`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "ID": "c13d3eec-942e-470d-97b3-e03322136636",
                    "book_ID": 201,
                    "amount": "someString"
                  })
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Invalid value/)
                })
        })
    })

    describe('DELETE /Orders', () => {
        it('responds with 204 No Content', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136636)`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(204)
                })
        })

        it('with non-existent Order ID - responds with 404 Not Found', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e-470d-97b3-e03322136630)`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("404")
                    expect(data.error.message).toMatch(/Not Found/)
                })
        })

        it('with invalid Order ID - responds with 404 Not Found', () => {
            return fetch(`${basePath}/catalog/Orders(c13d3eec-942e470d97b3e03322136630)`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(404)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("404")
                    expect(data.error.message).toMatch(/not a valid key/)
                })
        })

        it('with missing Order ID - responds with 400 Bad Request', () => {
            return fetch(`${basePath}/catalog/Orders()`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(400)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("400")
                    expect(data.error.message).toMatch(/Expected at least one key/)
                })
        })

        it('without parameters - responds with 405 Method Not Allowed', () => {
            return fetch(`${basePath}/catalog/Orders`, {
                method: "DELETE"
            })
                .then(response => {
                    expect(response.status).toBe(405)
                    return response.json()
                })
                .then(data => {
                    expect(data.error.code).toBe("405")
                    expect(data.error.message).toMatch(/Method DELETE not allowed/)
                })
        })
    })

})