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

    var platforms = []
    for (var x = 0; x < bwidth; ++x) {
        platforms[x] = [];
        for (var y = 0; y < bheight; ++y) {
            platforms[x][y] = {
                'p': false,
                'despawn_frame': null,
            };
        }
    }
    for (var x = 0; x < bwidth; ++x) {
        platforms[x][0].p = true;
        platforms[x][bheight-1].p = true;
        platforms[x][bheight-1].despawn_frame = 150;
    }
    for (var y = 0; y < bheight; ++y) {
        platforms[0][y].p = true;
        platforms[0][y].despawn_frame = null;
        platforms[bwidth-1][y].p = true;
        platforms[bwidth-1][y].despawn_frame = null;
    }
    for (var y = 4; y < (bheight - 4); y += Math.floor(Math.random() * 3 + 4)) {
        for (var x = 1; x < bwidth - 1; ++x) {
            platforms[x][y].p = (Math.random() > 0.6) ? true : false;
        }
    }

    var ctx = c.getContext("2d");

    var STEP = 1/60;

    var delta = 0;
    var last = window.performance.now();
    var meter = new FPSMeter();

    var frameno = 0;
    var player_x = 100;
    var player_y = SPRITE_HEIGHT * (bheight - 1) - PLAYER_HEIGHT;
    var xspeed = 0;
    var yspeed = 0;
    var ACCELERATION = 0.05;
    var AIR_ACCELERATION = 0.1;
    var DECELERATION = 0.5;
    var FRICTION = 0.05;
    var TOP_SPEED = 6; // setting to > SPRITE_WIDTH would be bad ;)
    var JUMP = -6.5;
    var UNJUMP = -3.0;
    var GRAVITY = 0.2;
    var TERMINAL_VELOCITY = 9; // setting to > SPRITE_HEIGHT would be bad ;)
    var press_left = false;
    var press_right = false;
    var press_jump = false;
    var unpress_jump = false;

    var left_bx = function (x) { return Math.floor(x / SPRITE_WIDTH); };
    var right_bx = function (x) { return Math.floor((x + PLAYER_WIDTH - 1) / SPRITE_WIDTH); };
    var top_by = function (y) { return Math.floor(y / SPRITE_HEIGHT); };
    var bottom_by = function (y) { return Math.floor((y + PLAYER_HEIGHT - 1) / SPRITE_HEIGHT); };

    var update = function () {
        ++frameno;

        var in_the_air = (! (platforms[left_bx(player_x)][bottom_by(player_y+1)].p || platforms[right_bx(player_x)][bottom_by(player_y+1)].p));

        // left-right physics
        current_acceleration = in_the_air ? AIR_ACCELERATION : ACCELERATION;
        if (press_left) {
            if (xspeed > 0) {
                xspeed -= DECELERATION;
            } else if (xspeed >= (-TOP_SPEED + current_acceleration)) {
                xspeed = xspeed - current_acceleration;
            } else {
                xspeed = -TOP_SPEED;
            }
        } else if (press_right) {
            if (xspeed < 0) {
                xspeed += DECELERATION;
            } else if (xspeed <= (TOP_SPEED - current_acceleration)) {
                xspeed = xspeed + current_acceleration;
            } else {
                xspeed = TOP_SPEED;
            }
        } else {
            if (xspeed > 0) {
                xspeed = Math.max(0, xspeed - FRICTION);
            } else if (xspeed < 0) {
                xspeed = Math.min(0, xspeed + FRICTION);
            }
        }

        // up-down physics
        if ((! in_the_air) && (press_jump)) {
            press_jump = false;
            yspeed = JUMP;
        }
        if (unpress_jump) {
            unpress_jump = false;
            if (yspeed < UNJUMP) {
                yspeed = UNJUMP;
            }
        }
        if (in_the_air) {
            yspeed = Math.min(TERMINAL_VELOCITY, yspeed + GRAVITY);
        }

        // collisions
        var new_player_x = player_x + xspeed;
        var new_player_y = player_y + yspeed;
        if (yspeed > 0) {
            if ((platforms[left_bx(player_x)][bottom_by(new_player_y)].p) || (platforms[right_bx(player_x)][bottom_by(new_player_y)].p)) {
                //console.log("bottom bump!");
                yspeed = 0;
                new_player_y = SPRITE_HEIGHT * bottom_by(new_player_y) - PLAYER_HEIGHT;
            }
        } else if (yspeed < 0) {
            if ((platforms[left_bx(player_x)][top_by(new_player_y)].p) || (platforms[right_bx(player_x)][top_by(new_player_y)].p)) {
                //console.log("top bump!");
                yspeed = 0;
                new_player_y = SPRITE_HEIGHT * (top_by(new_player_y) + 1);
            }
        }
        if (xspeed > 0) {
            if ((platforms[right_bx(new_player_x)][top_by(player_y)].p) || (platforms[right_bx(new_player_x)][bottom_by(player_y)].p)) {
                //console.log("right bump!");
                xspeed = 0;
                new_player_x = SPRITE_WIDTH * right_bx(new_player_x) - PLAYER_WIDTH;
            }
        } else if (xspeed < 0) {
            if ((platforms[left_bx(new_player_x)][top_by(player_y)].p) || (platforms[left_bx(new_player_x)][bottom_by(player_y)].p)) {
                //console.log("left bump!");
                xspeed = 0;
                new_player_x = SPRITE_WIDTH * (left_bx(new_player_x) + 1);
            }
        }

        player_x = new_player_x;
        player_y = new_player_y;

        // despawn blocks
        for (var x = 0; x < bwidth; ++x) {
            for (var y = 0; y < bheight; ++y) {
                if (platforms[x][y].despawn_frame && (platforms[x][y].despawn_frame <= frameno)) {
                   platforms[x][y].p = false;
                }
            }
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
        for (var x = 0; x < bwidth; ++x) {
            for (var y = 0; y < bheight; ++y) {
                if (platforms[x][y].p) {
                    ctx.fillStyle = "#FF0000";
                    ctx.fillRect((SPRITE_WIDTH * x) + offset_left,
                                 (SPRITE_HEIGHT * y) + offset_top,
                                 SPRITE_HEIGHT, SPRITE_WIDTH);
                }
            }
        }

        ctx.fillStyle = "#000000";
        ctx.fillText(frameno, 30, 30);
        ctx.fillText(xspeed, 30, 40);
        ctx.fillText(yspeed, 30, 50);
        ctx.fillText("(" + player_x + ", " + player_y + ")", 30, 60);
        ctx.fillText("(" + left_bx(player_x) + ", " + top_by(player_y) + ")", 30, 70);
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(player_x + offset_left, player_y + offset_top, PLAYER_WIDTH, PLAYER_HEIGHT);
    };
    var frame = function () {
        meter.tickStart();
        now = window.performance.now();
        delta = delta + Math.min(1, (now - last) / 1000);
        while (delta > STEP) {
            delta = delta - STEP;
            update();
        }
        render();
        last = now;
        meter.tick();
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
})(document.getElementById("osp"));
