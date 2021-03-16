//ポート番号の設定
const port = 3000;

//モジュールのロード
const express = require('express');
const app = express();
const ejs = require('ejs');
const session = require('express-session');
const mainController = require('./controllers/mainController');
const errorController = require('./controllers/errorController');

//ビューエンジンの設定
app.set('view engine', 'ejs');

//セッションの設定
app.use(
    session({
        secret: 'mysecret',
        resave: false,
        saveUninitialized: false
    })
);

//これがないとreq.bodyが読み込めませんよ
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());

//静的ファイルの読み込み
app.use(express.static('public'));


//ルーティング

app.get('/', mainController.getTopPage);

app.get('/signup', mainController.getSignupPage);
app.post('/signup', mainController.checkDeplicate, mainController.signup);

app.get('/login', mainController.getLoginPage);
app.post('/login', mainController.login);

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
    next();
})

app.get('/index/:user_id', mainController.getIndexPage);

app.get('/edit/:user_id/:id', mainController.getEditPage);
app.post('/edit/:user_id/:id', mainController.postEditData);

app.post('/insert/:user_id',mainController.addNewTask);

app.post('/delete/:user_id/:id',mainController.completeTask);

app.get('/logout', mainController.logout);

//エラー処理ミドルウェア関数
app.use(errorController.notFound);
app.use(errorController.internalServerError);

//サーバーを待機状態にさせる
app.listen(port, () => {
    console.log(`The server has started and is listening on port ${port}`);
});