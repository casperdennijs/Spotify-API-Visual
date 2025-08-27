const express = require('express');
const session = require('express-session');
const app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
const path = require('path');
const port = 3000;

var client_id = 'c75febbdc63941e597b4e8520622a7c5';
var client_secret = 'f04c16f242c94bc6a7b48b704ba5e090';
var redirect_uri = 'http://127.0.0.1:3000/callback';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', function(req, res) {
    var state = 'spotify';
    var scope = 'user-top-read';

    const params = new URLSearchParams({
        response_type: 'code',
        client_id,
        scope,
        redirect_uri,
        state
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/callback', async (req, res) =>{
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null) {
        res.redirect('/');
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code: code,
                redirect_uri: redirect_uri, // make sure you use the same one you registered
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        console.log(data); // will contain access_token, refresh_token, etc.

        // Store tokens in session for later use
        req.session.access_token = data.access_token;
        req.session.refresh_token = data.refresh_token;

        res.redirect('/poster');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

app.get('/poster', async (req, res) => {
    if (!req.session.access_token) {
        return res.redirect('/');
    }

    const response = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=30', {
        headers: {
            Authorization: `Bearer ${req.session.access_token}`
        }
    });
    const data = await response.json();
    console.log(data.items);
    res.render('poster', { items: data.items });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
