if (view_current == 0) global.pov = "White";
else if (view_current == 1) global.pov = "Black";

var _is_visible = false;
var _alpha = 1.0;

if (color == "White") {
    _is_visible = true;
} else {
    var _state = Minefield.minefield[grid_x][grid_y];
    if (global.pov == "Black") {
        _is_visible = true;
        if (_state != cell_state.revealed_black_piece && _state != cell_state.flagged_black_piece) {
            _alpha = 0.5;
        }
    } else {
        if (_state == cell_state.revealed_black_piece || _state == cell_state.flagged_black_piece) {
            _is_visible = true;
        }
    }
}

if (_is_visible) {
    var _draw_x = x;
    var _draw_y = y;
    
    draw_set_alpha(_alpha);
    draw_sprite_ext(sprite_index, 0, _draw_x, _draw_y, 0.5, 0.5, 0, c_white, 1)
    
    // Draw flag on top if flagged
    var _state = Minefield.minefield[grid_x][grid_y];
    if (_state == cell_state.flagged_black_piece) {
        var _flag_alpha = _alpha;
        if (global.pov == "Black") _flag_alpha = 0.5;
        
        var map_id = layer_tilemap_get_id("Palette");
        var _tile_idx = 4;
        if (Minefield.anti_flag_field[grid_x][grid_y]) _tile_idx = 8;
        else if (Minefield.flag_field[grid_x][grid_y] == 3) _tile_idx = 5;
        else if (Minefield.flag_field[grid_x][grid_y] == 5) _tile_idx = 6;
        else if (Minefield.flag_field[grid_x][grid_y] == 9) _tile_idx = 7;
        
        var data = tilemap_get(map_id, _tile_idx, 0);
        var _prev_alpha = draw_get_alpha();
        draw_set_alpha(_flag_alpha);
        draw_tile(TileSet, data, 0, _draw_x, _draw_y);
        draw_set_alpha(_prev_alpha);
    }
    
    draw_set_alpha(1.0);
    
    if (selected) {
        draw_set_alpha(0.3);
        draw_set_color(c_yellow);
        for (var i = 0; i < array_length(legal_moves); i++) {
            var _m = legal_moves[i];
            draw_rectangle(global.board_x + _m[0] * global.tilesize, global.board_y + _m[1] * global.tilesize, global.board_x + (_m[0] + 1) * global.tilesize - 1, global.board_y + (_m[1] + 1) * global.tilesize - 1, false);
        }
        draw_set_color(c_blue);
        for (var i = 0; i < array_length(flagging_squares); i++) {
            var _f = flagging_squares[i];
            draw_rectangle(global.board_x + _f[0] * global.tilesize, global.board_y + _f[1] * global.tilesize, global.board_x + (_f[0] + 1) * global.tilesize - 1, global.board_y + (_f[1] + 1) * global.tilesize - 1, false);
        }
        draw_set_alpha(1);
        draw_set_color(c_white);
    }
}
