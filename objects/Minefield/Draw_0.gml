if (view_current == 0) global.pov = "White";
else if (view_current == 1) global.pov = "Black";

for (var i = 0; i < array_length(minefield); i++)
{
    for (var j = 0; j < array_length(minefield[i]); j++)
    {
        var map_id = layer_tilemap_get_id("Palette")
        
        var _draw_x = i * global.tilesize;
        var _draw_y = j * global.tilesize;

        // If Black POV, draw revealed background under hidden tiles
        if global.pov == "Black"
        {
            var data = tilemap_get(map_id, (i + j) % 2, 0)
            draw_tile(TileSet, data, 0, _draw_x, _draw_y)
        }

        if minefield[i][j] == cell_state.revealed_mine || (global.pov == "Black" && (minefield[i][j] == cell_state.hidden_mine || minefield[i][j] == cell_state.flagged_mine))
        {
            if (global.pov == "Black" && minefield[i][j] != cell_state.revealed_mine) draw_set_alpha(0.5);
            var data = tilemap_get(map_id, 3, 0)
            draw_tile(TileSet, data, 0, _draw_x, _draw_y)
            draw_set_alpha(1);
        }
        if minefield[i][j] == cell_state.revealed || minefield[i][j] == cell_state.revealed_black_piece || minefield[i][j] == cell_state.flagged_black_piece
        {
            if global.pov != "Black" // Already drawn background for Black POV
            {
                var data = tilemap_get(map_id, (i + j) % 2, 0)
                draw_tile(TileSet, data, 0, _draw_x, _draw_y)
            }
            
            var _count = count_adjacent_mines(i, j);
            var _has_king = is_king_adjacent(i, j);
            var _is_flagged = (minefield[i][j] == cell_state.flagged_black_piece) || (flag_field[i][j] > 0) || (anti_flag_field[i][j]);
            
            if ((_count != 0 || _has_king) && !_is_flagged)
            {
                if (_count == -1) {
                    // King - draw with outline but no custom coloring
                    gpu_set_fog(true, c_white, 0, 0);
                    draw_sprite(Numbers, 1, _draw_x - 1, _draw_y);
                    draw_sprite(Numbers, 1, _draw_x + 1, _draw_y);
                    draw_sprite(Numbers, 1, _draw_x, _draw_y - 1);
                    draw_sprite(Numbers, 1, _draw_x, _draw_y + 1);
                    gpu_set_fog(false, c_white, 0, 0);
                    draw_sprite(Numbers, 1, _draw_x, _draw_y);
                } else {
                    var _abs_count = abs(_count);
                    var _str = string(_abs_count);
                    var _first_digit = real(string_char_at(_str, 1));
                    var _color = num_colors[_first_digit];
                    
                    if (_abs_count < 10) {
                        var _sub = _abs_count + 2;
                        gpu_set_fog(true, c_white, 0, 0);
                        draw_sprite(Numbers, _sub, _draw_x - 1, _draw_y);
                        draw_sprite(Numbers, _sub, _draw_x + 1, _draw_y);
                        draw_sprite(Numbers, _sub, _draw_x, _draw_y - 1);
                        draw_sprite(Numbers, _sub, _draw_x, _draw_y + 1);
                        gpu_set_fog(false, c_white, 0, 0);
                        gpu_set_fog(true, _color, 0, 0);
                        draw_sprite(Numbers, _sub, _draw_x, _draw_y);
                        gpu_set_fog(false, _color, 0, 0);
                    } else {
                        // Two digits
                        var _d1 = real(string_char_at(_str, 1));
                        var _d2 = real(string_char_at(_str, 2));
                        var _sub1 = _d1 + 2;
                        var _sub2 = _d2 + 2;
                        
                        var _x1 = _draw_x - 4;
                        var _x2 = _draw_x + 4;
                        
                        gpu_set_fog(true, c_white, 0, 0);
                        draw_sprite(Numbers, _sub1, _x1 - 1, _draw_y);
                        draw_sprite(Numbers, _sub1, _x1 + 1, _draw_y);
                        draw_sprite(Numbers, _sub1, _x1, _draw_y - 1);
                        draw_sprite(Numbers, _sub1, _x1, _draw_y + 1);
                        
                        draw_sprite(Numbers, _sub2, _x2 - 1, _draw_y);
                        draw_sprite(Numbers, _sub2, _x2 + 1, _draw_y);
                        draw_sprite(Numbers, _sub2, _x2, _draw_y - 1);
                        draw_sprite(Numbers, _sub2, _x2, _draw_y + 1);
                        gpu_set_fog(false, c_white, 0, 0);
                        
                        gpu_set_fog(true, _color, 0, 0);
                        draw_sprite(Numbers, _sub1, _x1, _draw_y);
                        draw_sprite(Numbers, _sub2, _x2, _draw_y);
                        gpu_set_fog(false, _color, 0, 0);
                    }
                }
            }
        }
        if minefield[i][j] == cell_state.hidden or minefield[i][j] == cell_state.hidden_mine or minefield[i][j] == cell_state.hidden_black_piece
        {
            if global.pov == "Black" draw_set_alpha(0.5);
            var data = tilemap_get(map_id, 2, 0)
            draw_tile(TileSet, data, 0, _draw_x, _draw_y)
            draw_set_alpha(1);
        }
        if minefield[i][j] == cell_state.flagged or minefield[i][j] == cell_state.flagged_mine
        {
            if global.pov == "Black" draw_set_alpha(0.5);
            var _tile_idx = 4;
            if (anti_flag_field[i][j]) _tile_idx = 8;
            else if (flag_field[i][j] == 3) _tile_idx = 5;
            else if (flag_field[i][j] == 5) _tile_idx = 6;
            else if (flag_field[i][j] == 9) _tile_idx = 7;
            
            var data = tilemap_get(map_id, _tile_idx, 0)
            draw_set_alpha(1);
            draw_tile(TileSet, data, 0, _draw_x, _draw_y)
        }
    }
}