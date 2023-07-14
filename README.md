# Portfolio

## My-master-aplication

This is a simple application used in the [fly.io Getting Started](https://fly.io/docs/getting-started/node/)  documentation showing how to deploy a Node application using Flyctl's builtin Nodejs deployment option.

* Run flyctl init
* When prompted for a builder, select builtin Nodejs.
* Run flyctl deploy


## Start 

Teste nodemon
```sh 
npm  run start:dev 
```

### Generate-token
```http

POST /generate-token HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 58

{
    "username": "admin",
    "password": "password123"
}
```

### Authorization

```http
GET /protected HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiJwYXNzd29yZDEyMyIsImlhdCI6MTY4NzYxOTkwNCwiZXhwIjoxNjg3NjIzNTA0fQ.wBgpkLYHrtbkkGp32I2yoI2Exp9hmLi5OwSGyGDdn4w
```
### Structure
- /controllers
  - tokenController.js
  - protectedController.js
- /middlewares
  - validateToken.js
- /services
  - tokenService.js
- /routes
  - index.js
- app.js



### structure 

meu-projeto/
│
├── src/
│   ├── components/
│   │   ├── HeaderLeft/
│   │   │   └── index.js
│   │   ├── HeaderRight/
│   │   │   └── index.js
│   │   └── MessagesButton/
│   │       └── index.js
│   └── index.js
│
├── index.html
└── ...


### Tools
nodemon
node js
npm
vscode
mongodb

### Token httpOnly 

![Texto alternativo](https://github.com/juniored22/my-store/blob/master/public/img/token-in-httpOnly.png)


### Crypto 

![Texto alternativo](https://github.com/juniored22/my-store/blob/master/public/img/cryptografia.png)


### Token JWT 

![Texto alternativo](https://github.com/juniored22/my-store/blob/master/public/img/token-jwt.png)


### Token JWT 

![Texto alternativo](https://github.com/juniored22/my-store/blob/master/public/img/varial-ambiente.png)

### Observer 

![Texto alternativo](https://github.com/juniored22/my-store/blob/develop/public/img/observer.png)



