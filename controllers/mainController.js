//bcrypt
const bcrypt = require('bcrypt');

//mysqlとの接続
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tomorrow79',
    database: 'todo_list'
});
connection.connect((error) => {
    if(error){
        console.log(error.stack);
        return;
    }
    console.log('connection to the database is successful.');
});

module.exports = {
    getTopPage: (req, res,) => {
        res.render('top');
    },
    getLoginPage: (req, res) => {
        res.render('login');
    },
    login: (req, res) => {
        connection.query(
            'SELECT * FROM users WHERE name = ?',
            [req.body.username],
            (error, results) => {
                const plain = req.body.password;
                const hash = results[0].password;
                bcrypt.compare(plain, hash, (error, isEqual) => {
                    if(isEqual){
                        req.session.userId = results[0].user_id;
                        req.session.username = results[0].name;
                        req.session.isLoggedIn = true;
                        res.redirect(`/index/${req.session.userId}`);
                    }else{
                        console.log('login failed.');
                        res.redirect('/login');
                    }
                });
            }
        )
    },
    getSignupPage: (req, res) => {
        res.render('signup');
    },
    checkDeplicate: (req, res, next) => {
        connection.query(
            'SELECT * FROM users WHERE name = ?',
            [req.body.name],
            (error, results) => {
                if(results.length > 0){
                    console.log('A request for signup was rejected.');
                    //名前が被ったことをブラウザに表示する処理をあとで追加(2021/03/16)
                    res.redirect('/signup');
                }else{
                    next();
                }
            }
        );
    },
    signup: (req, res) => {
        const password = req.body.password;
        bcrypt.hash(password, 7, (error, hash) => {
            connection.query(
                'INSERT INTO users (name, password) VALUES (?, ?)',
                [req.body.name, hash],
                (error, results) => {
                    console.log(results);
                    req.session.userId = results.insertId;
                    req.session.isLoggedIn = true;
                    req.session.username = req.body.name;
                    res.locals.thingsToDo = [];
                    console.log('new user have been created.');
                    res.redirect(`/index/${req.session.userId}`);
                }
            )
        })
    },
    getIndexPage: (req, res) => {
        connection.query(
            'SELECT * FROM list WHERE user_id = ? ORDER BY priority asc, due asc',
            [req.params.user_id],
            (error, results) => {
                if(error){
                    res.send(error);
                }
                res.locals.thingsToDo = results;
                res.render('index');
            }
        );
    },
    getEditPage: (req, res) => {
        connection.query(
            'select * from list where id = ?',
            [req.params.id],
            (error, results) => {
                if(error){
                    res.send(error);
                }
                res.render('edit',{
                    id: results[0].id,
                    title: results[0].title,
                    due: results[0].due,
                    user_id: results[0].user_id
                });
            }
        )
    },
    postEditData: (req, res) => {
        connection.query(
            'update list set title=?, due=?, priority=? where id=?',
            [req.body.title, req.body.due, req.body.priority, req.params.id],
            (error, results) => {
                if(error){
                    res.send(error);
                }
                res.redirect(`/index/${req.params.user_id}`);
                console.log('a task has been edited.');
            }
        );
    },
    addNewTask:  (req, res) => {
        connection.query(
            'insert into list (title, due, priority, user_id) values (?,?,?,?)',
            [req.body.title, req.body.due, req.body.priority, req.params.user_id],
            (error, results) => {
                if(error){
                    res.send(error);
                }
                res.redirect(`/index/${req.params.user_id}`);
                console.log(`new task: ${req.body.title} has been added.`)
            }
        );
    },
    completeTask: (req, res) => {
        connection.query(
            'delete from list where id = ?',
            [req.params.id],
            (error, results) => {
                if(error){
                    res.send(error);
                }
                res.redirect(`/index/${req.params.user_id}`);
            }
        );
    },
    logout: (req, res) => {
        req.session.destroy(() => {
            console.log('user logged out.');
        });
        res.redirect('/');
    }
}