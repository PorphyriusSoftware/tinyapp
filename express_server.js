const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
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
 


app.get("/login", (req, res) => {    
    const templateVars = { username: null };
    res.render("login", templateVars);
});

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    res.json(urlDatabase);
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
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    const templateVars = {
        username: req.cookies["username"],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    urlDatabase[generateRandomString()] = req.body.longURL;
    res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    const templateVars = { username: req.cookies["username"]};
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
    res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    const longURL = urlDatabase[req.params.id];   
    res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
    if (!req.cookies["username"]) {
        res.redirect('/login');
        return;
    } 
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

app.post("/login", (req, res) => {
    res.cookie('username', req.body.username);
    res.redirect('/urls');
});

app.get("/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect('/login');
});



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});