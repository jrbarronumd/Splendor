# Splendor

This is my attempt at a web app to play Splendor online.

This game is great.  You should go [buy it](https://www.amazon.com/Asmodee-SPL01-Splendor/dp/B00IZEUFIA/ref=sr_1_2).

## Playing

For the rules of the game, there is a good write-up [here](https://www.ultraboardgames.com/splendor/game-rules.php).

To create a new game, all you need to do is specify a number of players.  Optionally, you can name the game and the players to make it easier to come back later to finish.

Once in the game, when it is your turn, you may click on whatever objects you would like to take into your possession.  If a click does not do anything, it is either not your turn, or it is not a legal action.  As teh games goes on, each player's most recent action will be displayed with a magenta outline, which will reset as you complete your turn.

Make note of the "hamburger" icon at the top right for a menu that allows you to change some visual and audio/notification options, which will be saved in your browser for future visits.

## Direct Installation
You can run this game locally using `npm` and `node`.  For help installing these, there are plenty of resources easily found.  To start the game, run:

```
npm install
npm run start
```

This will start the game listening on port 8080. If you then point a web browser to http://localhost:8080 you will be on the game's homepage. To change this port from 8080, add `PORT=<new port>` in your `.env` file (create file in root directory).  The `PORT` variable is currently the only environment variable to utilize.

Incomplete games are saved indefinitely for now, and moved to the finished games list immediately after the last turn.  Once complete, the final state is saved in the finished games list indefinitely.  Both lists are maintained in SQLite databases that will be created when the server is started for the first time.

## Docker
There is a basic Dockerfile you can use to build a container to run.  For now, the port must be mapped to port 8080 of the container, for Docker installations.  While in your docker directory:

```
 git clone https://github.com/jrbarronumd/Splendor.git
```

Example docker-compose entry is below.  Be sure to replace `$DOCKERDIR` with your Docker directory from above.

```
version: "3.7"
services:
 ######################################### Splendor
  splendor:
    container_name: splendor
    build: $DOCKERDIR/Splendor/
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "8080:8080"
    volumes:
      - $DOCKERDIR/Splendor/db:/usr/src/app/db
```

The game will be available on port 8080 (or whatever is mapped to 8080 of the container) of your server.

## Plans

I have a few ideas, but for now, I am not planning to make any significant changes to the app unless there is a need.  

Please submit an issue if you find a bug, or want to suggest a new capability.  If the instructions on the page are insufficient, I will try to revise as quickly as possible as issues are submitted.  Please be kind - I am new at this.

See if you can find the few easter eggs hidden within the game to have some fun at your opponents' expense!
