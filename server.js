const express = require('express')
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
var bodyParser = require('body-parser');
const Monk = require('monk')
const cors = require('cors');
const yup = require('yup');


const db = Monk((JSON.parse(fs.readFileSync('credentials.json')).mongo_conn_string));
const urls = db.get('urls');
urls.createIndex({
    slug: 1
}, {
    unique: true
});
const app = express();
const port = 8080;
const schema = yup.object().shape({
    url: yup.string().trim().url().required(),
    slug: yup.string().trim().matches(/^[\w\-]+$/i).required(),
});
const notFoundPath = path.join(__dirname, 'src/404.html');

app.use(bodyParser.json());
app.use(cors());

app.get('/:slug', async (req, res, next) => {
    let slug = req.params.slug;
    //See if exists
    try {
        const entry = await urls.findOne({
            slug
        });
        if (entry) {
            console.log(entry);
            return res.redirect(entry.url);
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

app.listen(port, () => console.log(`App listening at ${port}`))