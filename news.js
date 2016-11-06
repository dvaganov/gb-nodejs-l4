'use strict'

const cheerio = require('cheerio');

class News {
    constructor() {
        this.articles = {};
    }

    getArticles(categories) {
        let articles = {};

        if (Array.isArray(categories)) {
            for (let i in categories) {
                articles[categories[i]] = this.articles[categories[i]];
            }
        }

        return articles;
    }

    parseRBC(html) {
        let $ = cheerio.load(html);

        $('.news-feed__item').each((i, elem) => {
            let link = $(elem).attr('href');
            let category = $(elem).find('.news-feed__item__date').text().split(',')[0].trim();
            let title = $(elem).find('.news-feed__item__title').text().trim();

            if (!Array.isArray(this.articles[category])) {
                this.articles[category] = [];
            }

            this.articles[category].push({title: title, link: link});
        });
    }

    parseNG(html) {
        let $ = cheerio.load(html);

        $('.preview').each((i, elem) => {
            let category = $(elem).find('h2 > a').text().trim();

            if (!Array.isArray(this.articles[category])) {
                this.articles[category] = [];
            }

            $(elem).find('.anonce').each((i, subElem) => {
                let link = $(subElem).find('h3 > a').attr('href');
                let title = $(subElem).find('h3 > a').text().trim();
                this.articles[category].push({title: title, link: `http://www.ng.ru/${link}`});
            });
        });
    }
}

module.exports = News;
