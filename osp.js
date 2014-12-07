(function osp (c) {
    var WIDTH = 1024;
    var HEIGHT = 768;
    var BLOCK_HEIGHT = 14;
    var BLOCK_WIDTH = 14;

    c.width = WIDTH;
    c.height = HEIGHT;

    var bwidth = Math.floor(WIDTH / BLOCK_WIDTH) + 1;
    var bheight = Math.floor(HEIGHT / BLOCK_HEIGHT) + 1;
    var offset_left = (WIDTH - (BLOCK_WIDTH * bwidth)) / 2;
    var offset_top = HEIGHT - (BLOCK_HEIGHT * bheight);

    var platforms = [];
    var new_platform = function(bx, by, despawn_frame) {
        return {
            'x': bx * BLOCK_WIDTH,
            'y': by * BLOCK_HEIGHT,
            'height': BLOCK_HEIGHT,
            'width': BLOCK_WIDTH,
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

    var player = {
        'x': 0,
        'y': 0,
        'facing': 1,
        'height': 12,
        'width': 10,
        'xspeed': 0,
        'yspeed': 0,
        'dead': true,
        'respawn_frame': 0,
        'death_counter': 0,
        'press_shoot': false,
        'press_left': false,
        'press_right': false,
        'press_jump': false,
        'unpress_jump': false,
        'top_speed': 6,
        'acceleration': 0.05,
        'air_acceleration': 0.1,
        'collectible_counter': 0,
        'cooldown_frame': 0,
    };
    var monsters = [];

    var collides = function(o1, o2) {
        if ((o1.moving_platform_id != null) &&
            (o2.moving_platform_id != null) &&
            (o1.moving_platform_id == o2.moving_platform_id)) {
            return false;
        }
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
            if ((! player.dead) && (collides(player, new_platform(bx+dx, by, null)))) {
                return false;
            }
            for (var i = 0; i < monsters.length; ++i) {
                if ((! monsters[i].dead) && (collides(monsters[i], new_platform(bx+dx, by, null)))) {
                    return false;
                }
            }
        }
        return true;
    }
    var legal_platform = function(len, despawn) {
        var bx;
        var by;
        do {
            bx = Math.floor(Math.random() * (bwidth - len));
            by = Math.floor(Math.random() * bheight);
        } while (! clear(bx, by, len));
        new_platforms = [];
        for (var dx = 0; dx < len; ++dx) {
            new_platforms.push(new_platform(bx+dx, by, despawn));
        }
        return new_platforms;
    };
    var add_platform = function (f) {
        var len = Math.floor(Math.random() * 10) + 1;
        var despawn = f + Math.floor((Math.random() * 9000) + 500);
        platforms = platforms.concat(legal_platform(len, despawn));
    };
    var moving_platforms = [];
    var add_moving_platform = function (f) {
        var vertical = (Math.random() < 0.5) ? true : false;
        var horizontal = ! vertical;
        var backwards = (Math.random() < 0.5) ? true : false;
        var speed = (Math.random() * 1.5) + 0.25;
        var moving_platform = {
                'id': f,
                'dx': (backwards ? -1 : 1) * (horizontal ? 1 : 0) * speed,
                'dy': (backwards ? -1 : 1) * (vertical ? 1 : 0) * speed
        };
        var len = Math.floor(Math.random() * 10) + 1;
        var despawn = f + Math.floor((Math.random() * 9000) + 500);
        new_platforms = legal_platform(len, despawn);
        // console.log(new_platforms);
        for (var i = 0; i < new_platforms.length; ++i) {
            new_platforms[i].moving_platform_id = moving_platform.id;
        }
        //console.log(new_platforms);
        platforms = platforms.concat(new_platforms);
        //console.log(platforms);
        moving_platforms.push(moving_platform);
        //console.log(moving_platforms);
    }

    for (var i = -5; i < 0; ++i) {
        add_moving_platform(i);
    }
    for (var i = 0; i < 30; ++i) {
        add_platform(0);
    }

    //var meter = new FPSMeter();

    var frameno = 0;
    var DECELERATION = 0.5;
    var FRICTION = 0.15;
    var JUMP = -6.5;
    var UNJUMP = -3.0;
    var GRAVITY = 0.2;
    var TERMINAL_VELOCITY = 9; // setting to > BLOCK_HEIGHT would be bad ;)

    var maybe_despawn_platforms = function () {
        platforms = platforms.filter(function(p) {
            return ((! p.despawn_frame) || (p.despawn_frame > frameno));
        });
    }
    var maybe_spawn_platforms = function () {
        if (Math.random() < 0.004) {
            if (Math.random() < 0.2) {
                add_moving_platform(frameno);
            } else {
                add_platform(frameno);
            }
        }
    };

    var new_obj_at = function(obj, new_x, new_y, moving_platform_id) {
        if (moving_platform_id === undefined) {
            moving_platform_id = obj.moving_platform_id;
        }
        return {
            'x': new_x,
            'y': new_y,
            'height': obj.height,
            'width': obj.width,
            'moving_platform_id': moving_platform_id
        };
    };
    var under_feet = function(player) {
        return new_obj_at(player, player.x, player.y+1);
    };

    var spawn = function(obj) {
        do {
            platform = platforms[Math.floor(Math.random() * platforms.length)];
            obj.x = platform.x;
            obj.y = platform.y - obj.height;
        } while ((obj.y < 0) || collides_with_platforms(obj) || (! collides_with_platforms(under_feet(obj))));
        return obj;
    };

    var air_spawn = function(obj) {
        do {
            obj.x = Math.floor(Math.random() * WIDTH);
            obj.y = Math.floor(Math.random() * HEIGHT);
        } while (collides_with_platforms(obj));
        return obj;
    };

    var maybe_respawn_player = function () {
        if (player.respawn_frame <= frameno) {
            // console.log("RESPAWN");
            player.dead = false;
            player.respawn_frame = 0;
            player.xspeed = 0;
            player.yspeed = 0;
            player.facing = 1;
            spawn(player);
        }
    }

    var move = function(obj) {
        // are we falling?
        var in_the_air = (! collides_with_platforms(under_feet(obj)));
        // console.log(in_the_air);

        // left-right physics
        var current_acceleration = in_the_air ? obj.air_acceleration : obj.acceleration;
        if (obj.press_left) {
            obj.facing = -1;
            if (obj.xspeed > 0) {
                obj.xspeed -= DECELERATION;
            } else if (obj.xspeed >= (-obj.top_speed + current_acceleration)) {
                obj.xspeed = obj.xspeed - current_acceleration;
            } else {
                obj.xspeed = -obj.top_speed;
            }
        } else if (obj.press_right) {
            obj.facing = 1;
            if (obj.xspeed < 0) {
                obj.xspeed += DECELERATION;
            } else if (obj.xspeed <= (obj.top_speed - current_acceleration)) {
                obj.xspeed = obj.xspeed + current_acceleration;
            } else {
                obj.xspeed = obj.top_speed;
            }
        } else {
            if (obj.xspeed > 0) {
                obj.xspeed = Math.max(0, obj.xspeed - FRICTION);
            } else if (obj.xspeed < 0) {
                obj.xspeed = Math.min(0, obj.xspeed + FRICTION);
            }
        }

        // up-down physics
        if ((! in_the_air) && (obj.press_jump)) {
            obj.press_jump = false;
            obj.yspeed = JUMP;
        }
        if (obj.unpress_jump) {
            obj.unpress_jump = false;
            if (obj.yspeed < UNJUMP) {
                obj.yspeed = UNJUMP;
            }
        }
        if (in_the_air) {
            obj.yspeed = Math.min(TERMINAL_VELOCITY, obj.yspeed + GRAVITY);
        }

        // collisions & falling death
        var new_x = obj.x + obj.xspeed;
        var new_y = obj.y + obj.yspeed;
        if (new_y >= HEIGHT + obj.height) {
            // console.log("fell out of the world");
            ++obj.death_counter;
            obj.dead = true;
            obj.respawn_frame = frameno + 20;
            return;
        }
        if (collides_with_platforms(obj)) {
            // console.log("squished");
            ++obj.death_counter;
            obj.dead = true;
            obj.respawn_frame = frameno + 20;
            return;
        }

        do { // janky loop works around a bug with corner collisions
            if (obj.yspeed > 0) {
                while (collides_with_platforms(new_obj_at(obj, obj.x, new_y))) {
                    // console.log("bottom bump!");
                    obj.yspeed = 0;
                    --new_y;
                }
            } else if (obj.yspeed < 0) {
                while (collides_with_platforms(new_obj_at(obj, obj.x, new_y))) {
                    // console.log("top bump!");
                    obj.yspeed = 0;
                    ++new_y;
                }
            }
            if (obj.xspeed > 0) {
                while (collides_with_platforms(new_obj_at(obj, new_x, obj.y))) {
                    // console.log("right bump!");
                    obj.xspeed = 0;
                    --new_x;
                }
            } else if (obj.xspeed < 0) {
                while (collides_with_platforms(new_obj_at(obj, new_x, obj.y))) {
                    // console.log("left bump!");
                    obj.xspeed = 0;
                    ++new_x;
                }
            }

            // apply motion
            obj.x = new_x;
            obj.y = new_y;
        } while (collides_with_platforms(obj));
    };
    var move_player = function() {
        move(player);
        for (var mi = 0; mi < monsters.length; ++mi) {
            if (collides(player, monsters[mi])) {
                // TODO: event: player died
                ++player.death_counter;
                player.dead = true;
                player.respawn_frame = frameno + 20;
            }
        }
        for (var ci = 0; ci < collectibles.length; ++ci) {
            if ((! collectibles[ci].gone) && (collides(player, collectibles[ci]))) {
                // TODO: event: collected collectible
                ++player.collectible_counter;
                collectibles[ci].gone = true;
            }
        }
    };

    var dork_ai = function(obj) {};
    var new_dork = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 8,
            'width': 8,
            'dead': false,
            'ai': dork_ai,
            'health': 1,
        };
    };
    var goomba_ai = function(obj) {
        if (obj.direction == 1) {
            if (collides_with_platforms(new_obj_at(obj, obj.x+1, obj.y))) {
                obj.direction = -1;
            }
        } else {
            if (collides_with_platforms(new_obj_at(obj, obj.x-1, obj.y))) {
                obj.direction = 1;
            }
        }
        if (obj.direction == 1) {
            obj.press_left = false;
            obj.press_right = true;
        } else {
            obj.press_right = false;
            obj.press_left = true;
        }
    }
    var new_goomba = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 24,
            'width': 24,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'ai': goomba_ai,
            'top_speed': 1,
            'acceleration': 0.02,
            'air_acceleration': 0.02,
            'health': 2,
        };
    };
    var paragoomba_ai = function(obj) {
        goomba_ai(obj);
        obj.press_jump = true;
    };
    var new_paragoomba = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 24,
            'width': 24,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'ai': paragoomba_ai,
            'top_speed': 1,
            'acceleration': 0.02,
            'air_acceleration': 0.02,
            'health': 2,
        };
    };
    var boss_ai = function(obj) {
        goomba_ai(obj);
    };
    var new_boss = function() {
        return {
            'boss': true,
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 120,
            'width': 120,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'ai': boss_ai,
            'top_speed': 1,
            'acceleration': 0.02,
            'air_acceleration': 0.02,
            'health': 15
        };
    };

    monsters.push(spawn(new_dork()));
    monsters.push(spawn(new_dork()));
    monsters.push(spawn(new_dork()));
    monsters.push(spawn(new_goomba()));
    monsters.push(spawn(new_paragoomba()));

    var move_monsters = function() {
        for (var i = 0; i < monsters.length; ++i) {
            monsters[i].ai(monsters[i]);
            move(monsters[i]);
        }
    };
    var maybe_despawn_monsters = function() {
        monsters = monsters.filter(function(m) {
            return (! m.dead);
        });
    };

    var game_over = false;
    var maybe_win_the_game = function() {
        dead_bosses = monsters.filter(function(m) {
            return (m.dead && m.boss);
        });
        if (dead_bosses.length > 0) {
            // TODO: event: you win!
            game_over = true;
        }
    };

    var new_collectible = function() {
        return {
            'x': 0,
            'y': 0,
            'height': 5,
            'width': 5,
            'gone': false
        };
    };
    var collectibles = [];

    for (var i = 0; i < 1; ++i) {
        collectibles.push(air_spawn(new_collectible()));
    }

    var maybe_despawn_collectibles = function() {
        if (collectibles.length > 0) {
            collectibles = collectibles.filter(function(c) {
                return (! c.gone);
            });
            if (collectibles.length == 0) {
                monsters.push(air_spawn(new_boss()));
            }
        }
    };

    var new_projectile = function(x, y, dx) {
        return {
            'x': x,
            'y': y,
            'dx': dx,
            'height': 2,
            'width': 2
        };
    };
    var projectiles = [];
    var shots_fired = function () {
        if ((player.cooldown_frame <= frameno) && (player.press_shoot)) {
            if (player.facing == 1) {
                projectiles.push(new_projectile(player.x + player.width, player.y + player.height / 2, 6.5));
            } else {
                projectiles.push(new_projectile(player.x, player.y + player.height / 2, -6.5));
            }
            player.cooldown_frame = frameno + 15;
        }
    };
    var move_projectiles = function() {
        for (var i = 0; i < projectiles.length; ++i) {
            projectiles[i].x += projectiles[i].dx;
        }
        for (var i = 0; i < projectiles.length; ++i) {
            for (var mi = 0; mi < monsters.length; ++mi) {
                if ((! projectiles[i].remove) && (collides(projectiles[i], monsters[mi]))) {
                    // TODO: event: hit!
                    console.log("hit frameno=" + frameno + ", mi=" + mi + ", i=" + i + ".... health=" + monsters[mi].health);
                    --monsters[mi].health;
                    projectiles[i].remove = true;
                    if (monsters[mi].health <= 0) {
                        // TODO: event: kill!
                        monsters[mi].dead = true;
                    }
                }
            }
        }
        projectiles = projectiles.filter(function(p) {
            return (! (p.remove || collides_with_platforms(p)));
        });
    };
    var maybe_slide = function(mp, obj) {
        var slide_obj = false;
        var feet = under_feet(obj);
        for (var j = 0; j < platforms.length; ++j) {
            if (platforms[j].moving_platform_id == mp.id) {
                if (collides(feet, platforms[j])) {
                    slide_obj = true;
                    break;
                }
            }
        }
        if (slide_obj) {
            new_x = obj.x + mp.dx;
            new_y = obj.y + mp.dy;
            if (! collides_with_platforms(new_obj_at(obj, new_x, new_y, mp.id))) {
                obj.x = new_x;
                obj.y = new_y;
            }
        }
    };
    var maybe_shove = function(shover, obj, dy, dx) {
        if (dy > 0) {
            while (collides(shover, obj)) {
                //console.log("adjust down!");
                ++obj.y;
            }
        } else if (dy < 0) {
            while (collides(shover, obj)) {
                //console.log("adjust up!");
                --obj.y;
            }
        }
        if (dx > 0) {
            while (collides(shover, obj)) {
                //console.log("adjust right!");
                ++obj.x;
            }
        } else if (dx < 0) {
            while (collides(shover, obj)) {
                //console.log("adjust left!");
                --obj.x;
            }
        }
    };
    var move_platforms = function() {
        for (var i = 0; i < moving_platforms.length; ++i) {
            var mp = moving_platforms[i];
            var collision = false;
            // check for bounce
            for (var j = 0; j < platforms.length; ++j) {
                if (platforms[j].moving_platform_id == mp.id) {
                    if (collides_with_platforms(new_obj_at(platforms[j], platforms[j].x + mp.dx, platforms[j].y + mp.dy))) {
                        mp.dx *= -1;
                        mp.dy *= -1;
                        collision = true;
                        break;
                    }
                }
            }
            if (collision) {
                continue;
            }
            // slide things standing on the platform
            maybe_slide(mp, player);
            for (var mi = 0; mi < monsters.length; ++mi) {
                maybe_slide(mp, monsters[mi]);
            }

            // apply motion
            for (var j = 0; j < platforms.length; ++j) {
                if (platforms[j].moving_platform_id == mp.id) {
                    platforms[j].x += mp.dx;
                    platforms[j].y += mp.dy;

                    // shove things if necessary
                    maybe_shove(platforms[j], player, mp.dy, mp.dx);
                    for (var mi = 0; mi < monsters.length; ++mi) {
                        maybe_shove(platforms[j], monsters[mi], mp.dy, mp.dx);
                    }
                }
            }
        }
    };

    var update = function () {
        ++frameno;
        move_platforms();
        move_projectiles();
        move_monsters();
        maybe_win_the_game();
        maybe_despawn_platforms();
        maybe_despawn_monsters();
        maybe_despawn_collectibles();
        maybe_spawn_platforms();
        if (player.dead) {
            maybe_respawn_player();
        } else {
            move_player();
            shots_fired();
        }
    };

    var keydown = function (e) {
        switch (e.keyCode) {
            case 37:
            case 65:
                player.press_left = true;
                return false;
                break;
            case 39:
            case 68:
                player.press_right = true;
                return false;
                break;
            case 38:
            case 32:
                player.unpress_jump = false;
                player.press_jump = true;
                return false;
                break;
            case 16:
            case 88:
                player.press_shoot = true;
                return false;
                break;
        };
    };
    var keyup = function (e) {
        switch (e.keyCode) {
            case 37:
            case 65:
                player.press_left = false;
                return false;
                break;
            case 39:
            case 68:
                player.press_right = false;
                return false;
                break;
            case 38:
            case 32:
                player.unpress_jump = true;
                player.press_jump = false;
                return false;
                break;
            case 16:
            case 88:
                player.press_shoot = false;
                return false;
                break;
        };
    };
    $(document).keydown(keydown);
    $(document).keyup(keyup);

    var ctx = c.getContext("2d");
    var render = function () {
        // clear
        ctx.fillStyle = "#999999";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // render collectibles
        for (var i = 0; i < collectibles.length; ++i) {
            if (! collectibles[i].gone) {
                ctx.fillStyle = "#FFFF00";
                ctx.fillRect(collectibles[i].x + offset_left, collectibles[i].y + offset_top, collectibles[i].width, collectibles[i].height);
            }
        }

        // render platforms
        for (var i = 0; i < platforms.length; ++i) {
            var saturation = 10;
            if (platforms[i].despawn_frame) {
                saturation = 153 - Math.min(143, platforms[i].despawn_frame - frameno);
            }
            ctx.fillStyle = "rgb(153, " + saturation + ", " + saturation + ")";
            ctx.fillRect(platforms[i].x + offset_left, platforms[i].y + offset_top, platforms[i].width, platforms[i].height);
        }

        // render projectiles
        for (var i = 0; i < projectiles.length; ++i) {
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(projectiles[i].x + offset_left, projectiles[i].y + offset_top, projectiles[i].width, projectiles[i].height);
        }

        //ctx.fillStyle = "#000000";
        //ctx.fillText(frameno, 30, 30);
        //ctx.fillText(player.xspeed, 30, 40);
        //ctx.fillText(player.yspeed, 30, 50);
        //ctx.fillText("(" + player.x + ", " + player.y + ")", 30, 60);
        ctx.fillStyle = "#000000";
        ctx.font = "14px Impact";
        ctx.fillText("DEATHS: " + player.death_counter, WIDTH - 68, 16);

        // render player
        if (! player.dead) {
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(player.x + offset_left, player.y + offset_top, player.width, player.height);
        }

        // render monsters
        for (var i = 0; i < monsters.length; ++i) {
            if (! monsters[i].dead) {
                ctx.fillStyle = "#FF00FF";
                ctx.fillRect(monsters[i].x + offset_left, monsters[i].y + offset_top, monsters[i].width, monsters[i].height);
            }
        }

        if (game_over) {
            ctx.fillStyle = "#000000";
            ctx.font = "100px Impact";
            ctx.fillText("YOU WIN!", WIDTH / 2 - 170, HEIGHT / 2);
        }
    };
    var STEP = 1/60;
    var delta = 0;
    var last = window.performance.now();
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
