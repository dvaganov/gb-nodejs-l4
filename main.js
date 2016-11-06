'use strict'

// Import libs
const express = require('express');
const templating = require('consolidate');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const request = require('request');
const News = require('./news.js');

// Create application
let app = express();

// Setup application
app.engine('pug', templating.pug);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// For static files
app.use(express.static('./public'));

// Parse request
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Setup application data
app.locals.newspapers = {
    'РБК': {link: 'http://www.rbc.ru/', parser: 'parseRBC'},
    'Независимая газета': {link: 'http://www.ng.ru/', parser: 'parseNG'}
};

// Setup page layout
app.use((req, res, next) => {
    res.locals.menu = [
        {name: 'Главная', link: '/'},
        {name: 'Новости', link: '/news'}
    ];
    res.locals.title = 'Новости';
    next();
});

// Setup routes
app.get('/', (req, res) => {
    let data = {
        newspapers: Object.keys(req.app.locals.newspapers),
        categories: ['Общество', 'Культура', 'Политика', 'Наука']
    };

    res.render('index', data);
});

app.route('/news')
    .post((req, res, next) => {
        res.cookie('newspaper', req.body.newspaper);
        res.cookie('categories', req.body.categories);

        next();
    })
    .get((req, res, next) => {
        // To uniform with POST
        req.body.newspaper = req.cookies.newspaper;
        req.body.categories = req.cookies.categories;

        next();
    })
    .all((req, res, next) => {
        let newspaperName = req.body.newspaper,
            categories = req.body.categories;

        // Get newspaper params
        let newspaper = req.app.locals.newspapers[newspaperName];

        if (newspaper) {
            request.get(newspaper.link, (err, response, html) => {
                if (err)
                    throw err;

                let news = new News();

                if (typeof news[newspaper.parser] === 'function')
                    news[newspaper.parser](html);
                else
                    throw new Error('Parser is not exist');

                res.locals.articles = news.getArticles(categories);
                res.render('news');
            });
        } else {
            res.locals.articles = {};
            res.render('news');
        }
    });

// Run application
app.listen(8888);
