const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "eCommerce Restfull API",
            version: "1.0.0",
            description:
                "Web eCommerce restfull api"
        },
        servers: [
            {
                url: `https://delifood.io.vn/`,
                description: 'Product server'
            },
            {
                url: `http://localhost:${process.env.PORT}`,
                description: 'Development server'
            },
            {
                url: `http://localhost:${process.env.PORT}`,
                description: 'Uat server'
            },
        ],
        components: {
            schemas: {
                RequestCreateCart: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the shop'
                        },

                    },
                    example: {
                        "name": "Ta Duy Hoang",
                    }
                },
                RequestUpdateCart: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the shop'
                        },

                    },
                    example: {
                        "name": "Ta Duy Hoang",
                    }
                },
                RequestDeleteCart: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the shop'
                        },

                    },
                    example: {
                        "name": "Ta Duy Hoang",
                    }
                },
                RequestRegister: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'msisdn'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the shop'
                        },
                        email: {
                            type: 'string',
                            description: 'The email of the shop'
                        },
                        password: {
                            type: 'string',
                            description: 'The password of the shop'
                        },
                        msisdn: {
                            type: 'string',
                            description: 'The msisdn of the shop'
                        }
                    },
                    example: {
                        "name": "Ta Duy Hoang",
                        "email": "duyhoangaws@gmail.com",
                        "password": "123123a@",
                        "msisdn": "0948291994"
                    }
                },
                RequestLogin: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            description: 'The email of the shop'
                        },
                        password: {
                            type: 'string',
                            description: 'The password of the shop'
                        },
                    },
                    example: {
                        "email": "duyhoangaws@gmail.com",
                        "password": "123123a@"
                    }
                },
                RequestLogout: {
                    type: 'object',
                    required: ['refresh-token', 'authorization'],
                    properties: {
                        "refresh-token": {
                            type: 'string',
                            description: 'The refresh-token of the shop'
                        },
                        authorization: {
                            type: 'string',
                            description: 'The accessToken of the shop'
                        },
                    },
                    example: {
                        "refresh-token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTE3ZGZmZmY0NjI3Mzk0YWQ2NGUzYTIiLCJlbWFpbCI6IiBkdXlob2FuZ2F3c0BnbWFpbC5jb20iLCJpYXQiOjE2OTY0NjA0NTMsImV4cCI6MTY5NjYzMzI1M30.oPcGlBgBFLik1qKUUgM3J0pCdX3D02bkrVsYKnPwhUvSmzbM7ffEeK9IPsjHszjsyKlPprYVbIJ-9zmMGe7VaxTmtuSGhhRw1RS3YyRSyv4K8jyzUVYCdptr8CzIK1BbsfGA0SQLZEwgWVo2miUV0Gd3icbWF3r-j9D8Cpls9cyIX_WZg36aqoaiB8aDNs19j6xYyhGqTtdykjSOfTfc76_J3M2cIQT8GPguK7z6cuO9bUT9ANWecMPsggCpUBTAJ3O19At5amJk5sOF928oHgphUxnhTETAVyBzlIvvvY8SqP3PD55whuo3iPjuJuXckPn-oKhjMzUpttMGJ6Gshb0MNOgwPWYov7WWUuUAyZn3res1kPzZCnBdzeq3lUdgTdFfXogg4qd3ntEMOpKiqHDGipwjPzv53WG_Ie4WSXUk_eGr7oyYbOj1d5vddMnIH0sw46zhpd1KsNIh3eIui-fucDEOkLddxy75mHobm4YM1xt-AMQhTbbtoHU_8vKghPRKKrZGc3t1Jg-Tsfe4riPU1TI3lRvzm7cP7SuFdmFD-pyHU3zCB-WTXqgKsUMPFGylx-6ij1SIRi8Q3BW1MCAniNNvOcUX7VUAqPjU0MMmrysvlqDsD7LOBGU7Bcb__biYNbJ5Dgjud_SulsRKFbVA_lI186WA_SVezuSzTTc",
                        "authorization": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTE3ZGZmZmY0NjI3Mzk0YWQ2NGUzYTIiLCJlbWFpbCI6IiBkdXlob2FuZ2F3c0BnbWFpbC5jb20iLCJpYXQiOjE2OTY0NjA0NTMsImV4cCI6MTY5NjU0Njg1M30.jf0yHvjlMr1rlj1wqLCg-RsG7EWfH0-z6WXrBHOfyaTiLP2wAEoVJhSMeUbypmMwwPn4cE4x_NQv8q61WjWAR6GshguMCh-KodbnPMEVgOZDw027YrCQylwIYU1aV5i4BFJVJ1VCpSpvQe62AWgEBJT364KvDYcbIg5W6WXpA_dKO1Eub1zGDFrLDKALJ0ZGkVpUng3_9Btsrxd38DDbIDeAwE0ZC7p_Y7ATOaXK06cDTcZLUIyXuukOse2x-uzS99MUYml79FWofVNp3z0ZUMntI7KP6Uw61wg5O0lFThJdonVSLqTy8pMhSQUmslof0PJF-XeSU7zguNInIhH9eEuWwcS4caWWC372bfdu5yiTLTH3kNnA5e5vkH7cCgUN74i8F5d13V4y4jv12CeFFUFP7vdRd-NqHnQKdX6VWOvz5LQH-iZBw3G3HrPit02DxzHMmbx-XmfUNx1WjXVf10UaVYmQzlFmm450YPWL274R5xU6erzb2e2R6Nu2tbnCLa02gHmJmGkn_8-cj4T6tfWu0mYk9X78tzQzDdAmVYIQn8T2yTUkQXcOXV7d-i-PeQH9qDE-EgmzJjbHMF4lS4uG0zLqAggZnXUs8C238cwbynm4vmKKHYFyEtuhEjsN9PuAUOjgz1LdUykOPdoGROprW-u5gV6YuXsWg0ljl1A"
                    }
                },
                RequestLogin: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            description: 'The email of the shop'
                        },
                        password: {
                            type: 'string',
                            description: 'The password of the shop'
                        },
                    },
                    example: {
                        "email": "duyhoangaws@gmail.com",
                        "password": "123123a@"
                    }
                },
                Product: {
                    type: 'object',
                    required: ['product_name', 'product_thumb', 'product_price', 'product_quality', 'product_type', 'product_attributes'],
                    properties: {
                        product_name: {
                            type: 'string',
                            description: 'The name of the product'
                        },
                        product_thumb: {
                            type: 'string',
                            description: 'The thumb of the product'
                        },
                        product_price: {
                            type: 'integer',
                            description: 'The price of the product'
                        },
                        product_quality: {
                            type: 'integer',
                            description: 'The quality of the product'
                        },
                        product_type: {
                            type: 'string',
                            description: 'The type of the product'
                        },
                        product_attributes: {
                            type: 'Array',
                            description: 'The attributes of the product'
                        }
                    },
                    example: {
                        product_name: "Quấn áo Nam siêu mát giày",
                        product_description: "Quần áo Nam gray",
                        product_price: 12345.000,
                        product_type: "Clothing",
                        product_thumb: "https://tiger01042023.s5.ap-southeast-1.amazonaws.com/PNG+image.png",
                        product_quality: 23,
                        product_attributes: {
                            brand: "TTF",
                            size: "XL",
                            material: "Thun"
                        }
                    }
                },
                Shop: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'msisdn'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the shop'
                        },
                        email: {
                            type: 'string',
                            description: 'The email of the shop'
                        },
                        password: {
                            type: 'string',
                            description: 'The password of the shop'
                        },
                        msisdn: {
                            type: 'string',
                            description: 'The msisdn of the shop'
                        }
                    },
                    example: {}
                },
                Discount: {
                    type: 'object',
                    required: ['discount_code', 'discount_amount'],
                    properties: {
                        discount_code: {
                            type: 'string',
                            description: 'The name of the shop'
                        },
                        discount_amount: {
                            type: 'string',
                            description: 'The email of the shop'
                        }
                    },
                    example: {}
                },
            },
            responses : {
                400: {
                    description: 'Missing API key - include it in the Authorization header',
                    contents: 'application/json'
                },
                401: {
                    description: 'Unauthorized - incorrect API key or incorrect format',
                    contents: 'application/json'
                },
                404: {
                    description: 'Not found - the book was not found',
                    contents: 'application/json'
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key'
                }
            }
        },
        security: [
            {
                "apiKey": [],
                "bearerAuth": [],
            },
            {
                "apiKey": [],
            }
        ]

    },
    apis: [
        "./src/routes/*/*.js",
    ],
    swaggerOptions: {
        urls: [
            {
                url: "/api-docs/swagger.json",
                name: 'Json'
            },
            {
                url: "/api-docs/swagger.yaml",
                name: 'Yaml'
            }
        ]

    },
}

module.exports = options
