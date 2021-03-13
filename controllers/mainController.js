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
    getLoginPage: (req, res) => {
        res.render('login');
    },
    login: (req, res) => {
        connection.query(
            'SELECT * FROM users WHERE name = ?',
            [req.body.username],
            (error, results) => {
                if(results.length > 0){
                    if(results[0].password === req.body.password){
                        req.session.userId = results[0].user_id;
                        res.locals.userId = req.session.userId;
                        res.redirect(`/index/${res.locals.userId}`);
                    }else{
                        res.send('パスワードが間違っています');
                    }
                }else{
                    res.send(`${req.body.name}さんは登録されていません。`);
                }
            }
        )
    },
    getIndexPage: (req, res) => {
        connection.query(
            'SELECT * FROM list WHERE user_id = ? ORDER BY priority asc, due asc',
            [req.params.user_id],
            (error, results) => {
                if(error){
                    res.send(error);
                }
                res.locals.userId = req.session.userId;
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
                    priority: results[0].priority,
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
    }
}