const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware.js");
const User = require("../schema/user");
const crypto = require('crypto');
require('dotenv').config();
const { sendWelcomeEmail } = require('../emails/account')


// 회원가입
userRouter.post("/register", async (req, res) => {
    const { id, password, email, nickname } = req.body;
    console.log(id, password,  email, nickname);

    const newpassword = crypto.createHash('sha512').update(password).digest('base64');
    
    console.log(newpassword);

    try {
        
        const existUsers = await User.find({ $or: [{ id }] });
        const existNickname = await User.find({ $or : [{ nickname }]});
        const existEmail = await User.find({ $or : [{ email }]});

        if (existUsers.length) {
            res.send({
                err : "이미 가입된 아이디가 있습니다.",
            });
            return;
        }

        if (existNickname.length) {
            res.send({
                err : "이미 가입된 닉네임이 있습니다."
            })
        }

        if (existEmail.length) {
            res.send({
                err : "이미 가입된 이메일이 있습니다."
            })
        }


        sendWelcomeEmail(email, nickname)
        await User.create({ nickname, id, email, password:newpassword });
        return res.status(201).send({ result: "회원가입 완료!" });

    } catch (error) {
        return res.status(400).send({ err: "회원가입에 실패했습니다." });
    }
});

// 로그인
userRouter.post("/login", async (req, res) => {
    let { id, password } = req.body;
    try {
        const newpassword = crypto.createHash('sha512').update(password).digest('base64');
        const user = await User.findOne().and([{ id }, { password:newpassword }]);
        if (!user) {
            return res
                .status(400)
                .send({ err: "아이디 또는 패스워드가 잘못됐습니다." });
        }
        const token = jwt.sign({ userId: user.id }, `${process.env.SECRET_KEY}`);
        return res.send({ result: { user: { token: token } } });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ err: err.message });
    }
});

// 내정보조회
userRouter.get("/", authMiddleware, async (req, res) => {
    const user = res.locals.user;
    try {
        usernickname = user["nickname"];
        userId = user["_id"];
        console.log(userId);
        userprofile = user["profile"];
        return res.send([{ id: userId }, { nickname: usernickname },{profile : userprofile}])
    } catch (error) {
        return res.send({ mss: "내정보조회에 실패했습니다" })
    }
})

// 비밀번호 변경
userRouter.post("/newpassword",authMiddleware,async(req,res)=>{
    const user = res.locals.user;
    const {newpassword} = req.body;
    try {
        const hashpassword = crypto.createHash('sha512').update(newpassword).digest('base64');
        await User.updateOne({id:user["id"]},{password:hashpassword});
        return res.send({mss:"비밀번호 변경에 성공했습니다."});
    } catch (error) {
        return res.send({mss:"비밀번호 변경에 성공했습니다."});
    }
})

module.exports = { userRouter };