
const getUser = (key, users) => {
    return users[key];
}
const getUserByEmail = (email, users) => {    
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

const urlsForUser = (id, urlDatabase) => {
    let result = {};
    for (const key in urlDatabase) {
        const url = urlDatabase[key];
        if (url.userID === id) {
            result[key] = url;
        }
    }
    return result;
}

module.exports = { getUser, getUserByEmail, generateRandomString, urlsForUser }