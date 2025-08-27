const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.use('/static', express.static('public'))

app.set('trust proxy', 1)
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
const path = require('path');

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = 'https://spotify-api-visual-production-08b4.up.railway.app/callback';
// http://127.0.0.1:3000/callback
// https://spotify-api-visual-production-08b4.up.railway.app/callback

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', function (req, res) {
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

app.get('/callback', async (req, res) => {
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
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        console.log(data);

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
    console.log(`Listening on ${port}`);
});
