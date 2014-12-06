(function osp (c) {
    var WIDTH = 1024;
    var HEIGHT = 768;
    var EDGE_WIDTH = 12;
    var EDGE_HEIGHT = 8;
    var SPRITE_HEIGHT = 10;
    var SPRITE_WIDTH = 10;

    c.width = WIDTH;
    c.height = HEIGHT;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, WIDTH, EDGE_HEIGHT);
    ctx.fillRect(0, 0, EDGE_WIDTH, HEIGHT);
    ctx.fillRect(WIDTH - EDGE_WIDTH, 0, WIDTH, HEIGHT);

    var STEP = 1/60;

    var delta = 0;
    var last = window.performance.now();
    var meter = new FPSMeter();

    var player_x = 100;
    var player_y = 100;
    var xspeed = 0;
    var yspeed = 0;
    var ACCELERATION = 0.05;
    var AIR_ACCELERATION = 0.1;
    var DECELERATION = 0.5;
    var FRICTION = 0.05;
    var TOP_SPEED = 6;
    var JUMP = -6.5;
    var UNJUMP = -4.0;
    var GRAVITY = 0.2;
    var TERMINAL_VELOCITY = 16;
    var press_left = false;
    var press_right = false;
    var press_jump = false;
    var unpress_jump = false;
    var in_the_air = false;

    var x = 0;
    var update = function () {
        ++x;

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
            in_the_air = true; // XXX: WRONG!
        }
        if (unpress_jump) {
            unpress_jump = false;
            if (yspeed < UNJUMP) {
                yspeed = UNJUMP;
            }
        }
        if (in_the_air) {
            yspeed = Math.min(TERMINAL_VELOCITY, yspeed + GRAVITY);
            if (player_y > 1000) {
                // XXX: WRONG!
                in_the_air = false;
                player_y = 100;
                yspeed = 0;
            }
        }

        player_x = player_x + xspeed;
        player_y = player_y + yspeed;
    };

    var keydown = function (e) {
        switch (e.keyCode) {
            case 37:
            case 65:
                press_left = true;
                break;
            case 39:
            case 68:
                press_right = true;
                break;
            case 38:
            case 32:
                unpress_jump = false;
                press_jump = true;
                break;
        };
    };
    var keyup = function (e) {
        switch (e.keyCode) {
            case 37:
            case 65:
                press_left = false;
                break;
            case 39:
            case 68:
                press_right = false;
                break;
            case 38:
            case 32:
                unpress_jump = true;
                press_jump = false;
                break;
        };
    };
    $(document).keydown(keydown);
    $(document).keyup(keyup);

    var render = function () {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0 + EDGE_WIDTH, 0 + EDGE_HEIGHT, WIDTH - (2 * EDGE_WIDTH), HEIGHT - EDGE_HEIGHT);
        ctx.fillStyle = "#000000";
        ctx.fillText(x, 30, 30);
        ctx.fillText(xspeed, 30, 40);
        ctx.fillText(yspeed, 30, 50);
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(player_x, player_y, SPRITE_HEIGHT, SPRITE_WIDTH);
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
