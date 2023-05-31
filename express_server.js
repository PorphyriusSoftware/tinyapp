const express = require('express');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override')
const { getUser, getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');


const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(methodOverride('_method'))

const urlDatabase = {
    'b2xVn2': {
        longURL: 'http://www.lighthouselabs.ca',
        userID: 'aJ48lW',
    },
    '9sm5xK': {
        longURL: 'http://www.google.com',
        userID: 'af35lW',
    }
};

const users = {
    aJ48lW: {
        id: 'aJ48lW',
        email: 'user@example.com',
        password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
    },
    af35lW: {
        id: 'af35lW',
        email: 'user2@example.com',
        password: bcrypt.hashSync('dishwasher-funk', 10),
    },
};









app.get('/', (req, res) => {
    res.send('Hello!');
});



app.get('/urls.json', (req, res) => {
    const user = getUser(req.session.user_id);
    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    res.json(urlsForUser(user.id, urlDatabase));
});


app.get('/hello', (req, res) => {
    const templateVars = { greeting: 'Hello World!' };
    res.render('hello_world', templateVars);
});


app.get('/set', (req, res) => {
    const a = 1;
    res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
    res.send(`a = ${a}`);
});

app.get('/urls', (req, res) => {
    const user = getUser(req.session.user_id, users);


    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    let filtered = urlsForUser(user.id, urlDatabase);

    const templateVars = {
        user: user,
        urls: filtered
    };
    res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {


    const user = getUser(req.session.user_id, users);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    urlDatabase[generateRandomString()] = { longURL: req.body.longURL, userID: user.id };
    res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
    const user = getUser(req.session.user_id, users);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    const templateVars = { user: user };
    res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
    const user = getUser(req.session.user_id, users);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    const requestURL = urlDatabase[req.params.id];
    if (!requestURL) {
        res.status(404);
        res.send('URL not found');
        return;
    }

    if (requestURL.userID !== user.id) {
        res.status(403);
        res.send('Access not allowed');
        return;
    }

    const templateVars = { id: req.params.id, longURL: requestURL.longURL, user: user };
    res.render('urls_show', templateVars);
});

app.put('/urls/:id', (req, res) => {
    const user = getUser(req.session.user_id, users);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    const requestURL = urlDatabase[req.params.id];
    if (!requestURL) {
        res.status(404);
        res.send('URL not found');
        return;
    }

    if (requestURL.userID !== user.id) {
        res.status(403);
        res.send('Access not allowed');
        return;
    }
    urlDatabase[req.params.id] = { longURL: req.body.longURL, userID: user.id };
    res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {

    const requestURL = urlDatabase[req.params.id];

    if (requestURL) {
        res.redirect(requestURL.longURL);
    }
    else {
        res.status(404);
        res.send('Short URL not found');
    }
});

app.delete('/urls/:id/delete', (req, res) => {
    const user = getUser(req.session.user_id, users);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }

    const requestURL = urlDatabase[req.params.id];
    if (!requestURL) {
        res.status(404);
        res.send('Short URL not found');
        return;
    }

    if (requestURL.userID !== user.id) {
        res.status(403);
        res.send('Access not allowed');
        return;
    }

    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

app.get('/login', (req, res) => {
    const user = getUser(req.session.user_id, users);
    if (user) {
        res.redirect('/urls');
        return;
    }
    const templateVars = { user: null };
    res.render('login', templateVars);
});

app.post('/login', (req, res) => {

    const { email, password } = req.body;
    req.session.user_id = null;
    const user = getUserByEmail(email, users);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect('/urls');
    } else {
        res.status(403);
        res.send('Unauthorized');
    }

});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/urls');
        return;
    }
    res.render('register');
});

app.post('/register', (req, res) => {

    const { email, password } = req.body;


    if (!email || !password) {
        res.status(403);
        res.send('Password and email are required');
        return;
    }

    if (getUserByEmail(email, users)) {
        res.status(403);
        res.send('Email already registered');
        return;
    }

    const randomId = generateRandomString();
    users[randomId] = { id: randomId, email: email, password: bcrypt.hashSync(password) };


    req.session.user_id = randomId;
    res.redirect('/urls');
});



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});