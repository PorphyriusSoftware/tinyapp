const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console

    urlDatabase[generateRandomString] = req.body.longURL;

    res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];   
    res.redirect(longURL);
});



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});