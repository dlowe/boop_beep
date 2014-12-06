(function osp (c) {
    var WIDTH = 1024;
    var HEIGHT = 768;
    var EDGE_WIDTH = 12;
    var EDGE_HEIGHT = 8;
    var SPRITE_HEIGHT = 14;
    var SPRITE_WIDTH = 14;
    var PLAYER_HEIGHT = 12;
    var PLAYER_WIDTH = 10;

    c.width = WIDTH;
    c.height = HEIGHT;

    var bwidth = Math.floor(WIDTH / SPRITE_WIDTH) + 1;
    var bheight = Math.floor(HEIGHT / SPRITE_HEIGHT) + 1;
    var offset_left = (WIDTH - (SPRITE_WIDTH * bwidth)) / 2;
    var offset_top = HEIGHT - (SPRITE_HEIGHT * bheight);

    var platforms = [];
    var new_platform = function(bx, by, despawn_frame) {
        return {
            'x': bx * SPRITE_WIDTH,
            'y': by * SPRITE_HEIGHT,
            'height': SPRITE_HEIGHT,
            'width': SPRITE_WIDTH,
            'despawn_frame': despawn_frame
        };
    };
    for (var bx = 0; bx < bwidth; ++bx) {
        platforms.push(new_platform(bx, 0, null));
        platforms.push(new_platform(bx, bheight - 1, Math.floor((Math.random() * 9000) + 1000)));
    }
    for (var by = 0; by < bheight; ++by) {
        platforms.push(new_platform(0, by, null));
        platforms.push(new_platform(bwidth - 1, by, null));
    }

    var collides = function(o1, o2) {
        if ((o1.x < (o2.x + o2.width)) &&
            ((o1.x + o1.width) > o2.x) &&
            (o1.y < (o2.y + o2.height)) &&
            ((o1.y + o1.height) > o2.y)) {
            return true;
        }
        return false;
    }
    var collides_with_platforms = function(obj) {
        for (var i = 0; i < platforms.length; ++i) {
            // console.log("checking for collision with platform: (" + platforms[i].x + ", " + platforms[i].y + ")");
            if (collides(obj, platforms[i])) {
                // console.log("bump");
                return true;
            }
        }
        // console.log("no bump");
        return false;
    }

    var clear = function (bx, by, len) {
        for (dx = 0; dx < len; ++dx) {
            if (collides_with_platforms(new_platform(bx+dx, by, null))) {
                return false;
            }
        }
        return true;
    }
    var add_platform = function (f) {
        var len = Math.floor(Math.random() * 10) + 1;
        var despawn = f + Math.floor((Math.random() * 9000) + 500);
        var bx;
        var by;
        do {
            bx = Math.floor(Math.random() * (bwidth - len));
            by = Math.floor(Math.random() * bheight);
        } while (! clear(bx, by, len));
        console.log("add platform: " + bx + ", " + by + " -> " + len);
        for (dx = 0; dx < len; ++dx) {
            platforms.push(new_platform(bx+dx, by, despawn));
        }
    }

    for (var i = 0; i < 30; ++i) {
        add_platform(0);
    }

    var ctx = c.getContext("2d");

    var STEP = 1/60;

    var delta = 0;
    var last = window.performance.now();
    //var meter = new FPSMeter();

    var frameno = 0;
    var SPAWN_CHANCE = 0.004;
    var ACCELERATION = 0.05;
    var AIR_ACCELERATION = 0.1;
    var DECELERATION = 0.5;
    var FRICTION = 0.15;
    var TOP_SPEED = 6; // setting to > SPRITE_WIDTH would be bad ;)
    var JUMP = -6.5;
    var UNJUMP = -3.0;
    var GRAVITY = 0.2;
    var TERMINAL_VELOCITY = 9; // setting to > SPRITE_HEIGHT would be bad ;)
    var press_left = false;
    var press_right = false;
    var press_jump = false;
    var unpress_jump = false;
    var player = {
        'x': 0,
        'y': 0,
        'height': PLAYER_HEIGHT,
        'width': PLAYER_WIDTH,
        'xspeed': 0,
        'yspeed': 0,
        'dead': true,
        'respawn_frame': 0,
    };

    var left_bx = function (x) { return Math.floor(x / SPRITE_WIDTH); };
    var right_bx = function (x) { return Math.floor((x + PLAYER_WIDTH - 1) / SPRITE_WIDTH); };
    var top_by = function (y) { return Math.floor(y / SPRITE_HEIGHT); };
    var bottom_by = function (y) { return Math.floor((y + PLAYER_HEIGHT - 1) / SPRITE_HEIGHT); };

    var maybe_despawn_platforms = function () {
        platforms = platforms.filter(function(p) {
                return ((! p.despawn_frame) || (p.despawn_frame > frameno));
        });
    }
    var maybe_spawn_platforms = function () {
        if (Math.random() < SPAWN_CHANCE) {
            add_platform(frameno);
        }
    };

    var new_player_at = function(player, new_x, new_y) {
        return {
            'x': new_x,
            'y': new_y,
            'height': player.height,
            'width': player.width,
        };
    };
    var under_feet = function(player) {
        return new_player_at(player, player.x, player.y+1);
    };
    var maybe_respawn_player = function () {
        console.log("RESPAWN");
        if (player.respawn_frame <= frameno) {
            player.dead = false;
            player.respawn_frame = 0;
            player.xspeed = 0;
            player.yspeed = 0;
            do {
                platform = platforms[Math.floor(Math.random() * platforms.length)];
                player.x = platform.x;
                player.y = platform.y - player.height;
                console.log("trying: (" + player.x + ", " + player.y + ")");
            } while ((player.y < 0) || collides_with_platforms(player) || (! collides_with_platforms(under_feet(player))));
        }
        console.log("RESPAWN DONE!");
    }

    var move_player = function () {
        // are we falling?
        var in_the_air = (! collides_with_platforms(under_feet(player)));
        //console.log(in_the_air);

        // left-right physics
        current_acceleration = in_the_air ? AIR_ACCELERATION : ACCELERATION;
        if (press_left) {
            if (player.xspeed > 0) {
                player.xspeed -= DECELERATION;
            } else if (player.xspeed >= (-TOP_SPEED + current_acceleration)) {
                player.xspeed = player.xspeed - current_acceleration;
            } else {
                player.xspeed = -TOP_SPEED;
            }
        } else if (press_right) {
            if (player.xspeed < 0) {
                player.xspeed += DECELERATION;
            } else if (player.xspeed <= (TOP_SPEED - current_acceleration)) {
                player.xspeed = player.xspeed + current_acceleration;
            } else {
                player.xspeed = TOP_SPEED;
            }
        } else {
            if (player.xspeed > 0) {
                player.xspeed = Math.max(0, player.xspeed - FRICTION);
            } else if (player.xspeed < 0) {
                player.xspeed = Math.min(0, player.xspeed + FRICTION);
            }
        }

        // up-down physics
        if ((! in_the_air) && (press_jump)) {
            press_jump = false;
            player.yspeed = JUMP;
        }
        if (unpress_jump) {
            unpress_jump = false;
            if (player.yspeed < UNJUMP) {
                player.yspeed = UNJUMP;
            }
        }
        if (in_the_air) {
            player.yspeed = Math.min(TERMINAL_VELOCITY, player.yspeed + GRAVITY);
        }

        // collisions & falling death
        var new_player_x = player.x + player.xspeed;
        var new_player_y = player.y + player.yspeed;
        if ((player.yspeed > 0) && (new_player_y >= HEIGHT + player.height)) {
            player.dead = true;
            player.respawn_frame = frameno + 20;
        } else {
            if (player.yspeed > 0) {
                while (collides_with_platforms(new_player_at(player, player.x, new_player_y))) {
                    console.log("bottom bump!");
                    player.yspeed = 0;
                    --new_player_y;
                }
            } else if (player.yspeed < 0) {
                while (collides_with_platforms(new_player_at(player, player.x, new_player_y))) {
                    console.log("top bump!");
                    player.yspeed = 0;
                    ++new_player_y;
                }
            }
            if (player.xspeed > 0) {
                while (collides_with_platforms(new_player_at(player, new_player_x, player.y))) {
                    console.log("right bump!");
                    player.xspeed = 0;
                    --new_player_x;
                }
            } else if (player.xspeed < 0) {
                while (collides_with_platforms(new_player_at(player, new_player_x, player.y))) {
                    console.log("left bump!");
                    player.xspeed = 0;
                    ++new_player_x;
                }
            }

            // apply motion
            player.x = new_player_x;
            player.y = new_player_y;
        }
    };

    var update = function () {
        ++frameno;
        maybe_despawn_platforms();
        maybe_spawn_platforms();
        if (player.dead) {
            maybe_respawn_player();
        } else {
            move_player();
        }
    };

    var keydown = function (e) {
        switch (e.keyCode) {
            case 37:
            case 65:
                press_left = true;
                return false;
                break;
            case 39:
            case 68:
                press_right = true;
                return false;
                break;
            case 38:
            case 32:
                unpress_jump = false;
                press_jump = true;
                return false;
                break;
        };
    };
    var keyup = function (e) {
        switch (e.keyCode) {
            case 37:
            case 65:
                press_left = false;
                return false;
                break;
            case 39:
            case 68:
                press_right = false;
                return false;
                break;
            case 38:
            case 32:
                unpress_jump = true;
                press_jump = false;
                return false;
                break;
        };
    };
    $(document).keydown(keydown);
    $(document).keyup(keyup);

    var render = function () {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        for (var i = 0; i < platforms.length; ++i) {
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(platforms[i].x + offset_left, platforms[i].y + offset_top, platforms[i].width, platforms[i].height);
        }

        //ctx.fillStyle = "#000000";
        //ctx.fillText(frameno, 30, 30);
        //ctx.fillText(player.xspeed, 30, 40);
        //ctx.fillText(player.yspeed, 30, 50);
        //ctx.fillText("(" + player.x + ", " + player.y + ")", 30, 60);
        //ctx.fillText("(" + left_bx(player.x) + ", " + top_by(player.y) + ")", 30, 70);
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(player.x + offset_left, player.y + offset_top, player.width, player.height);
    };
    var frame = function () {
        //meter.tickStart();
        now = window.performance.now();
        delta = delta + Math.min(1, (now - last) / 1000);
        while (delta > STEP) {
            delta = delta - STEP;
            update();
        }
        render();
        last = now;
        //meter.tick();
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
})(document.getElementById("osp"));
