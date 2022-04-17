# osu! Country Score Ranking Server

This is an API project which is intended to be used for the [viewer](https://github.com/shigeru22/osu-inactive-score) data, currently also used for the client's server handling.

Uses [osu!api v2](https://osu.ppy.sh/docs) to retrieve the scores to a database periodically due to rate limits. The score ranking would be analyzed per country to see the users' inactive status and score to the database.