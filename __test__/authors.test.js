const fetch = require('node-fetch');

const basePath = 'https://my-bookshop-srv-balanced-lizard-pw.cfapps.us10.hana.ondemand.com'

// Route tests for Authors Entity
describe('Author Routes', () => {
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