const http = require('http')
const express = require('express')
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { DataSource } = require('typeorm')
const {error } = require('console')
const app = express()

app.use(express.json()) 
app.use(cors())

dotenv.config()
const myDataSource = new DataSource({
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
})

myDataSource.initialize().then(() => {
    console.log("test_DATABASE_CONNECT")
})

app.get("/",async(req, res) => {
    try {
        return res.status(200).json({"message":"WELCOME TO SIHEON'S SERVER!!!"})
    } catch (error){
        console.log(error)
    }
})

// 1. 유저 정보 가져오기

const getUsers = async(req, res) => {
    try {
       const users= await myDataSource.query('SELECT * FROM users')
      return res.status(200).json( { "userData:":users
      })
    } catch (error) {  return res.status(400).json( { 
      })
      console.log(error)
    }
  }
  
app.get('/users',getUsers)

//2. 유저 회원가입

const createUsers = async(req, res) => {
    try {
        const {name, email, password} = req.body
        //유저가 이메일이나 패스워드를 입력을 하지 않았을때
        if(!email || !password){
            const error = new Error("KEY_ERROR")
            error.statusCode=400
            throw error
        }
        //비밀번호가 8자 이하일때
        if(password.length<8){
            const error = new Error("INVALID_PASSWORD")
            error.statusCode=400
            throw error
        }
        //이메일이 중복일때
        const userEmail = await myDataSource.query(`SELECT * FROM users WHERE email='${email}'`)
        if(userEmail.length>0){
            const error = new Error("DUPLICATED_EMAIL")
            error.statusCode=400
            throw error
        }

        await myDataSource.query(`INSERT INTO users (name, email, password) VALUES ('${name}','${email}','${password}')`)

        return res.status(200).json( { "message":"SUCCESS"
      })
    } catch (error) { return res.status(400).json( { "message":error.message
      })
      console.log(error)
    }
  }

app.post('/users',createUsers)

//로그인 하기
const loginUsers = async(req, res) => {
    try {
        const {name, email, password} = req.body
        const [users]= await myDataSource.query(`SELECT * FROM users WHERE email='${email}'`)
        //유저가 이메일이나 패스워드를 입력을 하지 않았을때
        if(!email || !password){
            const error = new Error("KEY_ERROR")
            error.statusCode=400
            throw error
        }
        //유저가 가입한적이 없을때
        if(!users.email){
            const error = new Error("EMAIL_DOES_NOT_EXIST_IN_DATABASE")
            error.statusCode=400
            throw error
        }
        //비밀번호가 틀렸을때
        if(password !== users.password){
            const error = new Error("INVALID_PASSWORD")
            error.statusCode=400
            throw error
        }

       
        const token = jwt.sign({id: users.id}, 'secret_key')
        const decoded = jwt.verify(token, 'secret_key')
        console.log(decoded)
   
       return res.status(200).json( {  "message" : "LOGIN_SUCCESS",
       "accessToken" : token
       })
    } catch (error) { return res.status(400).json( { "message":error.message
      })
      console.log(error)
    }
  }

app.post('/login',loginUsers)







const server = http.createServer(app)
const start = async() => {
    try {
        server.listen(8000,() => console.log('Server is listening on 8000'))
    } catch (error){
        console.error(error)
    }
}

start()

