// Enable and setup viewports
view_enabled = true;
view_visible[0] = true;
view_visible[1] = true;

// Viewport 0 - White's POV (Left)
view_xport[0] = 0;
view_yport[0] = 0;
view_wport[0] = 512;
view_hport[0] = 512;
view_camera[0] = camera_create_view(0, 0, 512, 512, 0, noone, -1, -1, -1, -1);

// Viewport 1 - Black's POV (Right)
view_xport[1] = 512;
view_yport[1] = 0;
view_wport[1] = 512;
view_hport[1] = 512;
view_camera[1] = camera_create_view(0, 0, 512, 512, 0, noone, -1, -1, -1, -1);

window_set_size(1024, 512);
surface_resize(application_surface, 1024, 512);

#macro print show_debug_message
global.tilesize = 16
global.boardsize = 32
global.board_x = 0
global.board_y = 0
global.pov = "White"
global.turn = "White"
global.get_local_pov = function() {
    if (window_mouse_get_x() < window_get_width() / 2) return "White";
    return "Black";
}
game_started = false
minefield = array_create(global.boardsize)
flag_field = array_create(global.boardsize)
anti_flag_field = array_create(global.boardsize)
for (var i = 0; i < global.boardsize; i++)
{
    minefield[i] = array_create(global.boardsize)
    flag_field[i] = array_create(global.boardsize, 0)
    anti_flag_field[i] = array_create(global.boardsize, false)
}

mine_density = 0.2
black_piece_count = 36
black_pieces_to_spawn = [
    "Black_King", 
    "Black_Queen", 
    "Black_Rook", "Black_Rook", 
    "Black_Bishop", "Black_Bishop", "Black_Bishop", "Black_Bishop",
    "Black_Knight", "Black_Knight", "Black_Knight", "Black_Knight", "Black_Knight", "Black_Knight", "Black_Knight", "Black_Knight",
    "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn",
    "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn", "Black_Pawn"
]

available_space = power(global.boardsize, 2)
mine_count = available_space * mine_density
safe_tiles = power(8, 2)

enum cell_state
{
    hidden_mine,
    revealed_mine,
    hidden,
    revealed,
    flagged,
    flagged_mine,
    mine_piece,
    sweeper_piece,
    hidden_black_piece,
    revealed_black_piece,
    flagged_black_piece
}

for (var i = 0; i < array_length(minefield); i++)
{
    for (var j = 0; j < array_length(minefield[i]); j++)
    {
        minefield[i][j] = cell_state.hidden
    }
}

for (var i = 0; i < array_length(minefield); i++)
{
    for (var j = 0; j < array_length(minefield[i]); j++)
    {
        if i >= array_length(minefield) div 2 - 4 and i < array_length(minefield) div 2 + 4 and j >= array_length(minefield) div 2 - 4 and j < array_length(minefield) div 2 + 4 
        {
            minefield[i][j] = cell_state.revealed
        }
    }
}

if mine_count < available_space - safe_tiles
{
    while mine_count > 0
    {
        var row_idx = irandom_range(0, global.boardsize - 1)
        var col_idx = irandom_range(0, global.boardsize - 1)
        if minefield[col_idx][row_idx] == cell_state.hidden
        {
            minefield[col_idx][row_idx] = cell_state.hidden_mine
            mine_count--
        }
    }
}

// Spawn Black Pieces
var _all_mines = [];
for (var i = 0; i < global.boardsize; i++) {
    for (var j = 0; j < global.boardsize; j++) {
        if (minefield[i][j] == cell_state.hidden_mine) {
            array_push(_all_mines, [i, j]);
        }
    }
}

// Shuffle mines array
for (var i = array_length(_all_mines) - 1; i > 0; i--) {
    var _j = irandom(i);
    var _temp = _all_mines[i];
    _all_mines[i] = _all_mines[_j];
    _all_mines[_j] = _temp;
}

var _num_to_spawn = min(array_length(_all_mines), array_length(black_pieces_to_spawn));
for (var i = 0; i < _num_to_spawn; i++) {
    var _pos = _all_mines[i];
    var _gx = _pos[0];
    var _gy = _pos[1];
    
    instance_create_depth(global.board_x + _gx * global.tilesize, global.board_y + _gy * global.tilesize, depth - 100, Pieces, {
        name: black_pieces_to_spawn[i],
        grid_x: _gx,
        grid_y: _gy
    });
    
    minefield[_gx][_gy] = cell_state.hidden_black_piece;
}

count_adjacent_mines = function(_gx, _gy) {
    var _count = 0;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            var _nx = _gx + i;
            var _ny = _gy + j;
            if (_nx >= 0 && _nx < global.boardsize && _ny >= 0 && _ny < global.boardsize) {
                var _nstate = minefield[_nx][_ny];
                if (_nstate == cell_state.hidden_mine || _nstate == cell_state.revealed_mine || _nstate == cell_state.flagged_mine) {
                    _count++;
                }
                
                // Add values of Black Pieces
                with (Pieces) {
                    if (grid_x == _nx && grid_y == _ny && color == "Black") {
                        _count += value;
                    }
                }
            }
        }
    }
    return _count;
}

is_king_adjacent = function(_gx, _gy) {
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            var _nx = _gx + i;
            var _ny = _gy + j;
            if (_nx >= 0 && _nx < global.boardsize && _ny >= 0 && _ny < global.boardsize) {
                var _found = false;
                with (Pieces) {
                    if (grid_x == _nx && grid_y == _ny && type == "King" && color == "Black") {
                        _found = true;
                        break;
                    }
                }
                if (_found) return true;
            }
        }
    }
    return false;
}

explode = function(_gx, _gy) {
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            var _nx = _gx + i;
            var _ny = _gy + j;
            if (_nx >= 0 && _nx < global.boardsize && _ny >= 0 && _ny < global.boardsize) {
                // Clear flags
                flag_field[_nx][_ny] = 0;
                anti_flag_field[_nx][_ny] = false;
                
                // Destroy pieces
                with (Pieces) {
                    if (grid_x == _nx && grid_y == _ny) {
                        instance_destroy();
                        Minefield.minefield[_nx][_ny] = cell_state.revealed;
                    }
                }
                
                // Clear visual flags even if no piece was there
                var _state = minefield[_nx][_ny];
                if (_state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece) {
                    minefield[_nx][_ny] = cell_state.revealed;
                }
            }
        }
    }
    // Remove mine from grid
    minefield[_gx][_gy] = cell_state.revealed;
}

reveal_tile = function(_gx, _gy) {
    if (_gx < 0 || _gx >= global.boardsize || _gy < 0 || _gy >= global.boardsize) return;
    
    var _state = minefield[_gx][_gy];
    if (_state != cell_state.hidden) return;
    
    minefield[_gx][_gy] = cell_state.revealed;
    
    if (count_adjacent_mines(_gx, _gy) == 0 && !is_king_adjacent(_gx, _gy)) {
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;
                reveal_tile(_gx + i, _gy + j);
            }
        }
    }
}

check_win = function() {
    var _black_king_found = false;
    var _white_king_found = false;
    var _black_king_flagged = false;
    with (Pieces) {
        if (type == "King") {
            if (color == "Black") {
                _black_king_found = true;
                if (Minefield.anti_flag_field[grid_x][grid_y]) _black_king_flagged = true;
            } else if (color == "White") {
                _white_king_found = true;
            }
        }
    }

    if (!game_started) {
        if (_black_king_found && _white_king_found) game_started = true;
        return;
    }

    var _all_solved = true;
    for (var i = 0; i < global.boardsize; i++) {
        for (var j = 0; j < global.boardsize; j++) {
            var _state = minefield[i][j];
            if (_state == cell_state.hidden) {
                _all_solved = false;
                break;
            }
        }
        if (!_all_solved) break;
    }

    if (!_black_king_found || !_white_king_found || (_black_king_flagged && global.turn == "Black") || _all_solved) {
        game_end(); 
    }
}

// Pre-calculate number colors from Numbers_Colors sprite
num_colors = array_create(10);
var _surf = surface_create(1, 1);
surface_set_target(_surf);
for (var i = 0; i < 10; i++) {
    draw_clear_alpha(c_black, 0);
    draw_sprite(Numbers_Colors, i, 0, 0);
    num_colors[i] = surface_getpixel(_surf, 0, 0);
}
surface_reset_target();
surface_free(_surf);