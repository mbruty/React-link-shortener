# Url Shortener
This app does exactly that. It takes a url and a slug, stores it and re-direct's any requests from that slug to the url... But how?
The *domain name*/u/*slug* route triggers a request to a mongodb server to fetch the stored url for the slug.
The mongodb database is just used as a key/value pair database, so other services like redis could also be used or even a SQL server with one table and a column for the slug and url!
Once the url has been obtained, the request is then redirected to the target url.
If the slug isn't found, the user is forwarded to a 404 page
On a POST to the back-end, the chosen slug is checked against the database to ensure it hasn't already been taken, if it hasn't the url is stored with the slug for later use.
