const express = require('express')
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
var bodyParser = require('body-parser');
const Monk = require('monk')
const yup = require('yup');


const db = Monk(process.env.mongo_conn_string);
const urls = db.get('urls');
urls.createIndex({
    slug: 1
}, {
    unique: true
});
const app = express();
const port =  process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, "/build")));
const schema = yup.object().shape({
    url: yup.string().trim().url().required(),
    slug: yup.string().trim().matches(/^[\w\-]+$/i).required(),
});
const notFoundPath = path.join(__dirname, 'build/404.html');

app.use(bodyParser.json());

app.get('/:slug', async (req, res) => {
    let slug = req.params.slug;
    //See if exists
    try {
        const url = await urls.findOne({ slug });
        if (entry) {
            return res.redirect(url.url);
        }
        return res.status(404).sendFile(notFoundPath);
    } catch (err) {
        console.log(err);
        return res.status(404).sendFile(notFoundPath);
    }
})

app.post('/api', slowDown({
    windowMs: 60 * 1000,
    delayAfter: 5,
    delayMs: 500
}), rateLimit({
    windowMs: 60 * 1000,
    max: 5,
}), async (req, res) => {
    let {
        url,
        slug
    } = req.body.data;
    try {
        slug = slug.toLowerCase();
        await schema.validate({
            url,
            slug,
        });
        // if slug exists
        if (await urls.findOne({
                slug
            })) {
            throw new Error('Slug in use');
        }

        res.json(await urls.insert({
            url,
            slug,
        }));
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});
  
  // build mode
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.listen(port, () => console.log(`App listening at ${port}`))