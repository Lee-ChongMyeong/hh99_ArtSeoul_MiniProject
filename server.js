const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.EXPRESS_PORT;

// DB연결
const connect = require('./schema/dbConnect');
connect();

// CORS 처리
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const { userRouter } = require('./routers/userRouter');
const { boardRouter } = require('./routers/boardRouter');
const { markerRouter } = require('./routers/markerRouter');
const { commentRouter } = require('./routers/commentRouter');
const { quest_commentRouter } = require('./routers/quest_commentRouter');
const { settingRouter } = require('./routers/settingRouter');
const { artinfoRouter } = require('./routers/artinfoRouter');

app.use("/user",[userRouter]);
app.use("/board",[boardRouter]);
app.use("/marker",[markerRouter]);
app.use("/comment", [commentRouter]);
app.use("/q_comment", [quest_commentRouter]);
app.use("/setting", [settingRouter]);
app.use("/artinfo", [artinfoRouter]);

app.listen(port, () => {
	console.log(`Server start at http://localhost:${port}`);
});