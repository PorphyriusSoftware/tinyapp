const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "aJ48lW",
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "af35lW",
    }
};

const users = {
    aJ48lW: {
        id: "aJ48lW",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
    },
    af35lW: {
        id: "af35lW",
        email: "user2@example.com",
        password: "dishwasher-funk",
    },
};

const getUser = (key) => {
    return users[key];
}
const getUserByEmail = (email) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user];
        }
    }
    return null;
}

const generateRandomString = () => {
    length = 6;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()+=';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

const urlsForUser = (id) => {
    let result = {};
    for (const key in urlDatabase) {
        const url = urlDatabase[key];
        if (url.userID === id) {
            result[key] = url;
        }

    }

    return result;
}







app.get("/", (req, res) => {
    res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
    const user = getUser(req.cookies["user_id"]);
    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    res.json(urlsForUser(user.id));
});


app.get("/hello", (req, res) => {
    const templateVars = { greeting: "Hello World!" };
    res.render("hello_world", templateVars);
});


app.get("/set", (req, res) => {
    const a = 1;
    res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
    res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
    const user = getUser(req.cookies["user_id"]);


    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    let filtered = urlsForUser(user.id);

    const templateVars = {
        user: user,
        urls: filtered
    };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    const user = getUser(req.cookies["user_id"]);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    urlDatabase[generateRandomString()] = { longURL: req.body.longURL, userID: user.id };
    res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
    const user = getUser(req.cookies["user_id"]);

    if (!user) {
        res.status(403);
        res.send('Please login or register');
        return;
    }
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const user = getUser(req.cookies["user_id"]);

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
    res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
    const user = getUser(req.cookies["user_id"]);

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

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL;
    if (longURL) {
        res.redirect(longURL);
    }
    else {
        res.status(404);
        res.send('Short URL not found');
    }
});

app.post("/urls/:id/delete", (req, res) => {
    const user = getUser(req.cookies["user_id"]);

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

app.get("/login", (req, res) => {
    const user = getUser(req.cookies["user_id"]);
    if (user) {
        res.redirect('/urls');
        return;
    }
    const templateVars = { user: null };
    res.render("login", templateVars);
});

app.post("/login", (req, res) => {

    const { email, password } = req.body;
    res.clearCookie('user_id');
    const user = getUserByEmail(email);
    if (user && user.password === password) {
        res.cookie('user_id', user.id);
        res.redirect('/urls');
    } else {
        res.status(403);
        res.send('Unauthorized');
    }

});

app.get("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/login');
});

app.get("/register", (req, res) => {
    if (req.cookies["user_id"]) {
        res.redirect('/urls');
        return;
    }
    res.render("register");
});

app.post("/register", (req, res) => {

    const { email, password } = req.body;


    if (!email || !password) {
        res.status(403);
        res.send('Password and email are required');
        return;
    }

    if (getUserByEmail(email)) {
        res.status(403);
        res.send('Email already registered');
        return;
    }

    const randomId = generateRandomString();
    users[randomId] = { id: randomId, email: email, password: password }
    res.cookie('user_id', randomId);
    res.redirect('/urls');
});



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});