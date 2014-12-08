(function boop_beep (c) {
    var WIDTH = 1024;
    var HEIGHT = 768;
    var BLOCK_HEIGHT = 18;
    var BLOCK_WIDTH = 18;

    var sounds = {
        "bg": new Audio("drums.mp3"),
        "jump": new Audio("jump.mp3"),
        "boss_rage": new Audio("boss_rage.mp3"),
        "shoot": new Audio("shoot.mp3"),
        "collect": new Audio("collect.mp3"),
        "kill": new Audio("kill.mp3"),
        "boss_kill": new Audio("boss_kill.mp3"),
        "enemy_shoot": new Audio("enemy_shoot.mp3"),
        "hit": new Audio("hit.mp3"),
        "dead": new Audio("dead.mp3"),
        "spawn": new Audio("spawn.mp3"),
        "enemy_spawn": new Audio("enemy_spawn.mp3"),
    };

    var sprites = {
        "collectible": new Image(),
        "platform": new Image(),
        "dork": [ new Image(), new Image(), new Image(), new Image() ],
        "goomba": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
        "boss": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
        "player_right": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
        "player_left": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
        "sniper_left": new Image(),
        "sniper_right": new Image(),
        "mine": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
        "pod": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
        "podling": [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ],
    }

    sprites.collectible.src = "collectible.png";
    sprites.platform.src = "platform.png";
    sprites.dork[0].src = "dork1.png";
    sprites.dork[1].src = "dork2.png";
    sprites.dork[2].src = "dork3.png";
    sprites.dork[3].src = "dork4.png";
    sprites.goomba[0].src = "goomba1.png";
    sprites.goomba[1].src = "goomba2.png";
    sprites.goomba[2].src = "goomba3.png";
    sprites.goomba[3].src = "goomba4.png";
    sprites.goomba[4].src = "goomba5.png";
    sprites.goomba[5].src = "goomba6.png";
    sprites.goomba[6].src = "goomba7.png";
    sprites.goomba[7].src = "goomba8.png";
    sprites.boss[0].src = "boss1.png";
    sprites.boss[1].src = "boss2.png";
    sprites.boss[2].src = "boss3.png";
    sprites.boss[3].src = "boss4.png";
    sprites.boss[4].src = "boss5.png";
    sprites.boss[5].src = "boss6.png";
    sprites.boss[6].src = "boss7.png";
    sprites.boss[7].src = "boss8.png";
    sprites.boss[8].src = "boss9.png";
    sprites.boss[9].src = "boss10.png";
    sprites.player_right[0].src = "player_right1.png";
    sprites.player_right[1].src = "player_right2.png";
    sprites.player_right[2].src = "player_right3.png";
    sprites.player_right[3].src = "player_right4.png";
    sprites.player_right[4].src = "player_right5.png";
    sprites.player_right[5].src = "player_right6.png";
    sprites.player_right[6].src = "player_right7.png";
    sprites.player_right[7].src = "player_right8.png";
    sprites.player_left[0].src = "player_left1.png";
    sprites.player_left[1].src = "player_left2.png";
    sprites.player_left[2].src = "player_left3.png";
    sprites.player_left[3].src = "player_left4.png";
    sprites.player_left[4].src = "player_left5.png";
    sprites.player_left[5].src = "player_left6.png";
    sprites.player_left[6].src = "player_left7.png";
    sprites.player_left[7].src = "player_left8.png";
    sprites.sniper_left.src = "sniper_left.png";
    sprites.sniper_right.src = "sniper_right.png";
    sprites.mine[0].src = "mine1.png";
    sprites.mine[1].src = "mine2.png";
    sprites.mine[2].src = "mine3.png";
    sprites.mine[3].src = "mine4.png";
    sprites.mine[4].src = "mine5.png";
    sprites.mine[5].src = "mine6.png";
    sprites.mine[6].src = "mine7.png";
    sprites.mine[7].src = "mine8.png";
    sprites.pod[0].src = "pod1.png";
    sprites.pod[1].src = "pod2.png";
    sprites.pod[2].src = "pod3.png";
    sprites.pod[3].src = "pod4.png";
    sprites.pod[4].src = "pod5.png";
    sprites.pod[5].src = "pod6.png";
    sprites.podling[0].src = "podling1.png";
    sprites.podling[1].src = "podling2.png";
    sprites.podling[2].src = "podling3.png";
    sprites.podling[3].src = "podling4.png";
    sprites.podling[4].src = "podling5.png";
    sprites.podling[5].src = "podling6.png";
    sprites.podling[6].src = "podling7.png";
    sprites.podling[7].src = "podling8.png";
    sprites.podling[8].src = "podling9.png";
    sprites.podling[9].src = "podling10.png";

    sounds["bg"].load();
    sounds["bg"].loop = true;
    sounds["bg"].play();

    c.width = WIDTH;
    c.height = HEIGHT;

    var bwidth = Math.floor(WIDTH / BLOCK_WIDTH) + 1;
    var bheight = Math.floor(HEIGHT / BLOCK_HEIGHT) + 1;
    var offset_left = (WIDTH - (BLOCK_WIDTH * bwidth)) / 2;
    var offset_top = HEIGHT - (BLOCK_HEIGHT * bheight);

    var platforms = [];
    var new_platform = function(bx, by, despawn_frame, indestructable) {
        if (indestructable === undefined) {
            indestructable = false;
        }
        return {
            'x': bx * BLOCK_WIDTH,
            'y': by * BLOCK_HEIGHT,
            'height': BLOCK_HEIGHT,
            'width': BLOCK_WIDTH,
            'despawn_frame': despawn_frame,
            'indestructable': indestructable,
            'sprite': function(obj) {
                return sprites["platform"];
            },
        };
    };
    for (var bx = 0; bx < bwidth; ++bx) {
        platforms.push(new_platform(bx, 0, null, true));
        platforms.push(new_platform(bx, bheight - 1, null, false)); // floor is not indestructible!
    }
    for (var by = 0; by < bheight; ++by) {
        platforms.push(new_platform(0, by, null, true));
        platforms.push(new_platform(bwidth - 1, by, null, true));
    }

    var player = {
        'x': 0,
        'y': 0,
        'facing': 1,
        'height': 16,
        'width': 12,
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
        'jump': -6.5,
        'unjump': -3.0,
        'top_speed': 6,
        'acceleration': 0.05,
        'deceleration': 0.5,
        'air_acceleration': 0.1,
        'collectible_counter': 0,
        'cooldown_frame': 0,
        'kill': function(p) {
            sounds["dead"].load();
            sounds["dead"].volume = 0.1;
            sounds["dead"].play();
            p.dead = true;
            ++p.death_counter;
            p.respawn_frame = frameno + 20;
            make_particles(p.x + p.width / 2, p.y + p.height / 2, 1400, 19, "#00FF00");
        },
        'sprite_speed': 2,
        'sprite_index': 0,
        'sprite_array': null,
        'sprite': function(p) {
            if (p.facing == 1) {
                p.sprite_array = sprites.player_right;
            } else {
                p.sprite_array = sprites.player_left;
            }
            if (p.xspeed == 0) {
                return p.sprite_array[p.sprite_index];
            } else {
                return animated_sprite(p);
            }
        },
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
            if (collides(obj, platforms[i])) {
                // console.log("bump");
                return true;
            }
        }
        // console.log("no bump");
        return false;
    }
    var collectibles = [];
    var collides_with_collectibles = function(obj) {
        for (var i = 0; i < collectibles.length; ++i) {
            if (collides(obj, collectibles[i])) {
                return true;
            }
        }
        return false;
    }

    var clear = function (bx, by, len) {
        for (dx = 0; dx < len; ++dx) {
            if (collides_with_platforms(new_platform(bx+dx, by, null))) {
                return false;
            }
            if (collides_with_collectibles(new_platform(bx+dx, by, null))) {
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
    var scaled_platform_length = function(f) {
        return Math.floor(Math.random() * 5) + Math.max(2, (5 - (5 * (f / 28800))));
    };
    var scaled_platform_despawn = function(f) {
        return f + Math.floor(Math.random() * 9000) + Math.max(200, (500 - (500 * (f / 28800))));
    };
    var scaled_platform_speed = function(f) {
        return Math.floor(Math.random() * 1.6) + Math.max(0.25, (f / 28800));
    };
    var add_platform = function (f) {
        var len = scaled_platform_length(f);
        var despawn = scaled_platform_despawn(f);
        platforms = platforms.concat(legal_platform(len, despawn));
    };
    var moving_platforms = [];
    var add_moving_platform = function (f) {
        var vertical = (Math.random() < 0.65) ? true : false;
        var horizontal = ! vertical;
        var backwards = (Math.random() < 0.5) ? true : false;
        var speed = scaled_platform_speed(f);
        var moving_platform = {
                'id': f,
                'dx': (backwards ? -1 : 1) * (horizontal ? 1 : 0) * speed,
                'dy': (backwards ? -1 : 1) * (vertical ? 1 : 0) * speed
        };
        var len = scaled_platform_length(f);
        var despawn = scaled_platform_despawn(f);
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

    for (var i = -8; i < 0; ++i) {
        add_moving_platform(i);
    }
    for (var i = 0; i < 18; ++i) {
        add_platform(0);
    }

    var frameno = 0;
    var FRICTION = 0.15;
    var GRAVITY = 0.2;
    var TERMINAL_VELOCITY = 9; // setting to > BLOCK_HEIGHT would be bad ;)

    var maybe_despawn_platforms = function () {
        platforms = platforms.filter(function(p) {
            return ((! p.despawn_frame) || (p.despawn_frame > frameno));
        });
    }
    var maybe_spawn_platforms = function () {
        if (Math.random() < 0.006) {
            if (Math.random() < 0.21) {
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
        } while ((collides_with_platforms(obj)) || (collides_with_collectibles(obj)));
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
            sounds["spawn"].load();
            sounds["spawn"].volume = 0.1;
            sounds["spawn"].play();
            bullseyes.push(new_bullseye(player.x + player.width / 2, player.y + player.height / 2, 120, "#00FF00"));
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
                obj.xspeed -= obj.deceleration;
            } else if (obj.xspeed >= (-obj.top_speed + current_acceleration)) {
                obj.xspeed = obj.xspeed - current_acceleration;
            } else {
                obj.xspeed = -obj.top_speed;
            }
        } else if (obj.press_right) {
            obj.facing = 1;
            if (obj.xspeed < 0) {
                obj.xspeed += obj.deceleration;
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
            sounds["jump"].load();
            sounds["jump"].volume = 0.1;
            sounds["jump"].play();
            obj.press_jump = false;
            obj.yspeed = obj.jump;
        }
        if (obj.unpress_jump) {
            obj.unpress_jump = false;
            if (obj.yspeed < obj.unjump) {
                obj.yspeed = obj.unjump;
            }
        }
        if ((in_the_air) && (! obj.flying)) {
            obj.yspeed = Math.min(TERMINAL_VELOCITY, obj.yspeed + GRAVITY);
        }

        // collisions & falling death
        var new_x = obj.x + obj.xspeed;
        var new_y = obj.y + obj.yspeed;
        if (new_y >= HEIGHT + obj.height) {
            // console.log("fell out of the world");
            obj.kill(obj);
            return;
        }
        if (collides_with_platforms(obj)) {
            // console.log("squished");
            if (obj.squish) {
                obj.squish(obj);
            } else {
                obj.kill(obj);
            }
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
                player.kill(player);
            }
        }
        for (var ci = 0; ci < collectibles.length; ++ci) {
            if ((! collectibles[ci].gone) && (collides(player, collectibles[ci]))) {
                sounds["collect"].load();
                sounds["collect"].volume = 0.1;
                sounds["collect"].play();
                ++player.collectible_counter;
                collectibles[ci].gone = true;
            }
        }
    };

    var animated_sprite = function(m) {
        if ((frameno % m.sprite_speed) == 0) {
            ++m.sprite_index;
            if (m.sprite_index >= m.sprite_array.length) {
                m.sprite_index = 0;
            }
        }
        return m.sprite_array[m.sprite_index];
    };

    var dork_ai = function(obj) {};
    var monster_kill = function(m) {
        sounds["kill"].load();
        sounds["kill"].volume = 0.1;
        sounds["kill"].play();
        make_particles(m.x + (m.width / 2), m.y + (m.height / 2), 100, 10, "#FF00FF");
        m.dead = true;
    };
    var new_dork = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 10,
            'width': 10,
            'dead': false,
            'ai': dork_ai,
            'health': 2,
            'kill': monster_kill,
            'sprite_speed': 10,
            'sprite_index': 0,
            'sprite_array': sprites.dork,
            'sprite': animated_sprite,
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
            'height': 28,
            'width': 28,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'ai': goomba_ai,
            'top_speed': 1,
            'acceleration': 0.02,
            'air_acceleration': 0.02,
            'deceleration': 0.5,
            'health': 3,
            'sprite_speed': 2,
            'sprite_index': 0,
            'sprite_array': sprites.goomba,
            'sprite': animated_sprite,
            'kill': monster_kill,
        };
    }
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
            'height': 28,
            'width': 28,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'ai': paragoomba_ai,
            'top_speed': 1,
            'acceleration': 0.02,
            'air_acceleration': 0.02,
            'deceleration': 0.5,
            'jump': -6.5,
            'unjump': -3.0,
            'health': 3,
            'sprite_speed': 2,
            'sprite_index': 0,
            'sprite_array': sprites.goomba,
            'sprite': animated_sprite,
            'kill': monster_kill,
        };
    };
    var rage = function(obj, distance) {
        sounds["boss_rage"].load();
        sounds["boss_rage"].volume = 0.1;
        sounds["boss_rage"].play();
        range_obj = {
            'x': obj.x - distance,
            'y': obj.y - distance,
            'width': obj.width + 2 * distance,
            'height': obj.width + 2 * distance,
        };
        for (i = 0; i < platforms.length; ++i) {
            if ((! platforms[i].indestructable) && (collides(range_obj, platforms[i]))) {
                make_particles(platforms[i].x + platforms[i].width / 2, platforms[i].y + platforms[i].height / 2, 100, 20, "#FF0000");
                platforms[i].despawn_frame = frameno;
            }
        }
    }
    var boss_rage = function(obj) {
        rage(obj, 60);
    };
    var boss_ai = function(obj) {
        goomba_ai(obj);
        if (obj.y > 150) {
            obj.yspeed = (Math.random() * 0.75) - 1.5;
        } else {
            obj.yspeed = (Math.random() * 0.5) - 0.1;
        }
        if (obj.health < obj.last_health) {
            obj.next_rage -= 500;
            if (player.x > obj.x) {
                obj.direction = 1;
                obj.press_right = true;
                obj.press_left = false;
            } else {
                obj.direction = -1;
                obj.press_left = true;
                obj.press_right = false;
            }
        }
        obj.last_health = obj.health;
        if (obj.next_rage <= frameno) {
            boss_rage(obj);
            obj.next_rage = frameno + 500 - Math.floor(Math.random() * 50);
        }
        if (obj.cooldown_frame <= frameno) {
            sounds["enemy_shoot"].load();
            sounds["enemy_shoot"].volume = 0.1;
            sounds["enemy_shoot"].play();
            projectiles.push(new_projectile(obj.x + obj.width / 2, obj.y + obj.height, 0, 6.5));
            obj.cooldown_frame = frameno + 5;
        }
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
            'top_speed': 5,
            'acceleration': 0.05,
            'air_acceleration': 0.05,
            'deceleration': 1,
            'last_health': 15,
            'health': 25,
            'cooldown_frame': 0,
            'kill': function(m) {
                sounds["boss_kill"].load();
                sounds["boss_kill"].volume = 0.1;
                sounds["boss_kill"].play();
                make_particles(m.x + (m.width / 2), m.y + (m.height / 2), 2000, 60, "#FF00FF");
                m.dead = true;
            },
            'squish': function(m) {
                boss_rage(m);
                if (collides_with_platforms(m)) {
                    // console.log("adjusting boss");
                    if (m.x < (WIDTH / 2)) {
                        ++m.x;
                    } else {
                        --m.x;
                    }
                    if (m.y < (HEIGHT / 2)) {
                        ++m.y;
                    } else {
                        --m.y;
                    }
                }
            },
            'next_rage': frameno,
            'flying': true,
            'sprite_speed': 15,
            'sprite_index': 0,
            'sprite_array': sprites.boss,
            'sprite': animated_sprite,
        };
    };
    var sniper_ai = function(obj) {
        if ((player.y > (obj.y - 2)) && (player.y < (obj.y + obj.height))) {
            if (obj.cooldown_frame <= frameno) {
                sounds["enemy_shoot"].load();
                sounds["enemy_shoot"].volume = 0.1;
                sounds["enemy_shoot"].play();
                var x;
                var dx;
                if (player.x > obj.x) {
                    obj.facing = 1;
                    x = obj.x + obj.width;
                    dx = 6.5;
                } else {
                    obj.facing = 0;
                    x = obj.x;
                    dx = -6.5;
                }
                projectiles.push(new_projectile(x, obj.y + obj.height / 2, dx, 0));
                obj.cooldown_frame = frameno + 30;
            }
        }
    };
    var new_sniper = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 16,
            'width': 12,
            'dead': false,
            'ai': sniper_ai,
            'health': 1,
            'kill': monster_kill,
            'cooldown_frame': 0,
            'facing': 1,
            'sprite': function(m) {
                if (m.facing == 1) {
                    return sprites.sniper_right;
                }
                return sprites.sniper_left;
            },
        };
    };
    var mine_ai = function(obj) {
        range_obj = {
            'x': obj.x - 30,
            'y': obj.y - 30,
            'width': obj.width + 2 * 30,
            'height': obj.height + 2 * 30,
        };
        if (collides(player, range_obj)) {
            obj.kill(obj);
            rage(obj, 30);
        }
    };
    var new_mine = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 22,
            'width': 20,
            'dead': false,
            'ai': mine_ai,
            'health': 5,
            'kill': monster_kill,
            'sprite_speed': 8,
            'sprite_index': 0,
            'sprite_array': sprites.mine,
            'sprite': animated_sprite,
        };
    };
    var podling_ai = function(m) {
        goomba_ai(m);
        if (Math.random() < 0.005) {
            m.press_jump = true;
        }
        if (Math.random() < 0.02) {
            if (player.x > m.x) {
                m.direction = 1;
                m.press_right = true;
                m.press_left = false;
            } else {
                m.direction = -1;
                m.press_right = false;
                m.press_left = true;
            }
        }
    };
    var new_podling = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 5,
            'width': 12,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'top_speed': 5.5,
            'acceleration': 0.04,
            'air_acceleration': 0.04,
            'deceleration': 0.4,
            'jump': -5,
            'unjump': -2.5,
            'ai': podling_ai,
            'health': 1,
            'kill': monster_kill,
            'sprite_speed': 2,
            'sprite_index': 0,
            'sprite_array': sprites.podling,
            'sprite': animated_sprite,
        };
    };
    var pod_kill = function(m) {
        monster_kill(m);
        for (var i = 0; i < 3; ++i) {
            var podling = new_podling();
            podling.x = m.x + m.width/2;
            podling.y = m.y + m.height/2;
            monsters.push(podling);
        }
    };
    var new_pod = function() {
        return {
            'x': 0,
            'y': 0,
            'xspeed': 0,
            'yspeed': 0,
            'height': 30,
            'width': 30,
            'dead': false,
            'direction': (Math.random() < 0.5) ? 1 : 0,
            'top_speed': 0.5,
            'acceleration': 0.03,
            'air_acceleration': 0.03,
            'deceleration': 0.3,
            'ai': goomba_ai,
            'health': 1,
            'kill': pod_kill,
            'sprite_speed': 12,
            'sprite_index': 0,
            'sprite_array': sprites.pod,
            'sprite': animated_sprite,
        };
    };

    var monster_spawn_frame = 0;
    var maybe_spawn_monsters = function() {
        if (monster_spawn_frame <= frameno) {
            constructors = [ new_dork, new_mine ];
            if (frameno > 1800) {
                constructors.push(new_sniper);
                constructors.push(new_goomba);
            }
            if (frameno > 3600) {
                constructors.push(new_paragoomba);
                constructors.push(new_pod);
            }
            constructor = constructors[Math.floor(Math.random() * constructors.length)];
            new_monster = spawn(constructor());
            monsters.push(new_monster);
            sounds["enemy_spawn"].load();
            sounds["enemy_spawn"].volume = 0.1;
            sounds["enemy_spawn"].play();
            bullseyes.push(new_bullseye(new_monster.x + new_monster.width / 2, new_monster.y + new_monster.height / 2, 30, "#FF00FF"));
            monster_spawn_frame = frameno + Math.floor(Math.random() * 600) + 200;
        }
    };
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
            game_over = true;
        }
    };

    var new_collectible = function() {
        return {
            'x': 0,
            'y': 0,
            'height': 8,
            'width': 8,
            'gone': false,
            'sprite': function(obj) {
                return sprites["collectible"];
            }
        };
    };
    for (var i = 0; i < 20; ++i) {
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

    var bullseyes = [];
    var new_bullseye = function(x, y, r, color) {
        return {
            'x': x,
            'y': y,
            'r': r,
            'color': color
        };
    };
    var move_bullseyes = function() {
        for (var i = 0; i < bullseyes.length; ++i) {
            bullseyes[i].r -= 3;
        }
    };
    var maybe_despawn_bullseyes = function() {
        bullseyes = bullseyes.filter(function(b) {
            return (b.r > 0);
        });
    };

    var new_particle = function(x, y, dx, dy, duration, color) {
        return {
            'x': x,
            'y': y,
            'dx': dx,
            'dy': dy,
            'despawn_frame': frameno + duration,
            'color': color,
        };
    };
    var make_particles = function(x, y, n, duration, color) {
        particles = particles.concat([
            new_particle(x, y, 8, 0, duration, color),
            new_particle(x, y, 4, 4, duration, color),
            new_particle(x, y, 0, 8, duration, color),
            new_particle(x, y, -4, 4, duration, color),
            new_particle(x, y, 4, -4, duration, color),
            new_particle(x, y, -8, 0, duration, color),
            new_particle(x, y, -4, -4, duration, color),
            new_particle(x, y, 0, -8, duration, color),
        ]);
        for (var i = 0; i < n; ++i) {
            particles.push(new_particle(x, y, Math.random() * 16 - 8, Math.random() * 16 - 8, duration, color));
        }
    };
    var particles = [];
    var move_particles = function() {
        for (var i = 0; i < particles.length; ++i) {
            particles[i].x += particles[i].dx;
            particles[i].y += particles[i].dy;
        }
    };
    var maybe_despawn_particles = function() {
        particles = particles.filter(function (p) {
            return (p.despawn_frame > frameno);
        });
    };

    var new_projectile = function(x, y, dx, dy) {
        return {
            'x': x,
            'y': y,
            'dx': dx,
            'dy': dy,
            'height': 3,
            'width': 5
        };
    };
    var projectiles = [];
    var shots_fired = function () {
        if ((player.cooldown_frame <= frameno) && (player.press_shoot)) {
            sounds["shoot"].load();
            sounds["shoot"].volume = 0.1;
            sounds["shoot"].play();
            if (player.facing == 1) {
                make_particles(player.x + player.width, player.y + player.height / 2, 10, 5, "#FF00FF");
                projectiles.push(new_projectile(player.x + player.width, player.y + player.height / 2, 6.5, 0));
            } else {
                make_particles(player.x, player.y + player.height / 2, 10, 5, "#FF00FF");
                projectiles.push(new_projectile(player.x, player.y + player.height / 2, -6.5, 0));
            }
            player.cooldown_frame = frameno + 15;
        }
    };
    var move_projectiles = function() {
        for (var i = 0; i < projectiles.length; ++i) {
            projectiles[i].x += projectiles[i].dx;
            projectiles[i].y += projectiles[i].dy;
        }
        for (var i = 0; i < projectiles.length; ++i) {
            if (! projectiles[i].remove) {
                if ((! player.dead) && (collides(projectiles[i], player))) {
                    player.kill(player);
                }
                for (var mi = 0; mi < monsters.length; ++mi) {
                    if (collides(projectiles[i], monsters[mi])) {
                        sounds["hit"].load();
                        sounds["hit"].volume = 0.1;
                        sounds["hit"].play();
                        // console.log("hit frameno=" + frameno + ", mi=" + mi + ", i=" + i + ".... health=" + monsters[mi].health);
                        --monsters[mi].health;
                        projectiles[i].remove = true;
                        if (monsters[mi].health <= 0) {
                            monsters[mi].kill(monsters[mi]);
                        }
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
            var mdy = Math.abs(dy);
            while ((mdy > 0) && (collides(shover, obj))) {
                //console.log("adjust down!");
                ++obj.y;
                --mdy;
            }
        } else if (dy < 0) {
            var mdy = Math.abs(dy);
            while ((mdy > 0) && (collides(shover, obj))) {
                //console.log("adjust up!");
                --obj.y;
                --mdy;
            }
        }
        if (dx > 0) {
            var mdx = Math.abs(dx);
            while ((mdx > 0) && (collides(shover, obj))) {
                //console.log("adjust right!");
                ++obj.x;
                --mdx;
            }
        } else if (dx < 0) {
            var mdx = Math.abs(dx);
            while ((mdx > 0) && (collides(shover, obj))) {
                //console.log("adjust left!");
                --obj.x;
                --mdx;
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
        move_particles();
        move_bullseyes();
        move_platforms();
        move_projectiles();
        move_monsters();
        maybe_win_the_game();
        maybe_despawn_platforms();
        maybe_despawn_monsters();
        maybe_despawn_collectibles();
        maybe_despawn_particles();
        maybe_despawn_bullseyes();
        maybe_spawn_platforms();
        maybe_spawn_monsters();
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
        ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        var dsp = function(obj, alpha) {
            if (alpha === undefined) {
                alpha = 1.0;
            }
            ctx.globalAlpha = alpha;
            ctx.drawImage(obj.sprite(obj), obj.x + offset_left, obj.y + offset_top, obj.width, obj.height);
            ctx.globalAlpha = 1.0;
        };

        // render collectibles
        for (var i = 0; i < collectibles.length; ++i) {
            if (! collectibles[i].gone) {
                dsp(collectibles[i]);
            }
        }

        // render platforms
        for (var i = 0; i < platforms.length; ++i) {
            var alpha = 1.0;
            if (platforms[i].despawn_frame) {
                alpha = Math.min(1.0, (platforms[i].despawn_frame - frameno) / 100);
            }
            dsp(platforms[i], alpha);
        }

        // render projectiles
        for (var i = 0; i < projectiles.length; ++i) {
            ctx.fillStyle = "#00FFFF";
            ctx.fillRect(projectiles[i].x + offset_left, projectiles[i].y + offset_top, projectiles[i].width, projectiles[i].height);
        }

        ctx.fillStyle = "#000000";
        ctx.font = "14px Impact";
        ctx.fillText("DEATHS: " + player.death_counter, WIDTH - 68, 16);

        // render bullseyes
        for (var i = 0; i < bullseyes.length; ++i) {
            if (bullseyes[i].r > 0) {
                ctx.strokeStyle = bullseyes[i].color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(bullseyes[i].x + offset_left, bullseyes[i].y + offset_top, bullseyes[i].r, 0, 2*Math.PI);
                ctx.stroke();
            }
        }

        // render player
        if (! player.dead) {
            dsp(player);
        }

        // render monsters
        for (var i = 0; i < monsters.length; ++i) {
            if (! monsters[i].dead) {
                if (monsters[i].sprite) {
                    dsp(monsters[i]);
                } else {
                    ctx.fillStyle = "#FF00FF";
                    ctx.fillRect(monsters[i].x + offset_left, monsters[i].y + offset_top, monsters[i].width, monsters[i].height);
                }
            }
        }

        // render particles
        for (var i = 0; i < particles.length; ++i) {
            ctx.fillStyle = particles[i].color;
            ctx.fillRect(particles[i].x + offset_left, particles[i].y + offset_top, 2, 2);
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
        now = window.performance.now();
        delta = delta + Math.min(1, (now - last) / 1000);
        while (delta > STEP) {
            delta = delta - STEP;
            update();
        }
        render();
        last = now;
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
})(document.getElementById("boop_beep"));
