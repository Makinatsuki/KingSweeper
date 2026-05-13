if mouse_check_button_pressed(mb_left)
{
    var mouse_grid_x = (mouse_x - global.board_x) div global.tilesize
    var mouse_grid_y = (mouse_y - global.board_y) div global.tilesize
    
    if grid_x == mouse_grid_x and grid_y == mouse_grid_y
    {
        if (global.turn == color) {
            with (Pieces) selected = false
            selected = true
            legal_moves = get_legal_moves()
            flagging_squares = get_flagging_squares()
        }
    }
    else if selected
    {
        var _moved = false
        for (var i = 0; i < array_length(legal_moves); i++)
        {
            var _m = legal_moves[i]
            if _m[0] == mouse_grid_x and _m[1] == mouse_grid_y
            {
                // Capture
                var _target = get_piece_at(mouse_grid_x, mouse_grid_y)
                var _exploding = false;
                if (_target != noone)
                {
                    if (_target.color == "Black" || color == "Black") {
                        _exploding = true;
                    }
                    instance_destroy(_target)
                }
                
                // Move
                var _old_gx = grid_x;
                var _old_gy = grid_y;
                var _start_was_wrongly_flagged = is_wrongly_flagged(_old_gx, _old_gy);
                
                grid_x = mouse_grid_x
                grid_y = mouse_grid_y
                x = global.board_x + grid_x * global.tilesize
                y = global.board_y + grid_y * global.tilesize
                has_moved = true

                // Reveal tile
                if (color == "White") {
                    var _state = Minefield.minefield[grid_x][grid_y];
                    if (_state == cell_state.hidden_mine) {
                        Minefield.minefield[grid_x][grid_y] = cell_state.revealed_mine;
                        Minefield.explode(grid_x, grid_y);
                    } else if (_state == cell_state.hidden) {
                        Minefield.reveal_tile(grid_x, grid_y);
                    } else if (_state == cell_state.hidden_black_piece) {
                        Minefield.minefield[grid_x][grid_y] = cell_state.revealed_black_piece;
                        _exploding = true;
                    }
                }
                
                if (_exploding) {
                    Minefield.explode(grid_x, grid_y);
                }
                
                // Update grid state if black piece moved
                if (color == "Black") {
                     var _new_state = Minefield.minefield[grid_x][grid_y];
                     var _old_state = Minefield.minefield[_old_gx][_old_gy];
                     
                     // Normal move (the mine the piece was on effectively moves with it)
                     var _old_had_mine = (_old_state == cell_state.hidden_black_piece || _old_state == cell_state.revealed_black_piece || _old_state == cell_state.flagged_black_piece);
                     var _new_had_mine = (_new_state == cell_state.hidden_mine || _new_state == cell_state.revealed_mine || _new_state == cell_state.flagged_mine);

                     // Update old tile state
                     if (_new_had_mine) {
                         if (_new_state == cell_state.revealed_mine) Minefield.minefield[_old_gx][_old_gy] = cell_state.revealed_mine;
                         else if (_new_state == cell_state.flagged_mine) Minefield.minefield[_old_gx][_old_gy] = cell_state.flagged_mine;
                         else Minefield.minefield[_old_gx][_old_gy] = cell_state.hidden_mine;
                     } else {
                         if (_old_state == cell_state.revealed_black_piece) Minefield.minefield[_old_gx][_old_gy] = cell_state.revealed;
                         else if (_old_state == cell_state.flagged_black_piece) Minefield.minefield[_old_gx][_old_gy] = cell_state.flagged;
                         else Minefield.minefield[_old_gx][_old_gy] = cell_state.hidden;
                     }
                     
                     // Update new tile state
                     if (_new_state == cell_state.revealed || _new_state == cell_state.revealed_mine) {
                         Minefield.minefield[grid_x][grid_y] = cell_state.revealed_black_piece;
                     } else if (_new_state == cell_state.flagged || _new_state == cell_state.flagged_mine) {
                         Minefield.minefield[grid_x][grid_y] = cell_state.flagged_black_piece;
                     } else {
                         Minefield.minefield[grid_x][grid_y] = cell_state.hidden_black_piece;
                     }
                     
                     // Destroy wrongly flagged tiles on path
                     var _path = [[_old_gx, _old_gy]];
                     var _dx = sign(mouse_grid_x - _old_gx);
                     var _dy = sign(mouse_grid_y - _old_gy);
                     
                     if ((type == "Rook" || type == "Bishop" || type == "Queen" || type == "Pawn") && (_dx == 0 || _dy == 0 || abs(mouse_grid_x - _old_gx) == abs(mouse_grid_y - _old_gy))) {
                          var _curr_x = _old_gx + _dx;
                          var _curr_y = _old_gy + _dy;
                          while (_curr_x != mouse_grid_x || _curr_y != mouse_grid_y) {
                              array_push(_path, [_curr_x, _curr_y]);
                              _curr_x += _dx;
                              _curr_y += _dy;
                              if (abs(_curr_x - _old_gx) > global.boardsize || abs(_curr_y - _old_gy) > global.boardsize) break;
                          }
                     }
                     array_push(_path, [mouse_grid_x, mouse_grid_y]);
                     
                     for (var i = 0; i < array_length(_path); i++) {
                         var _px = _path[i][0];
                         var _py = _path[i][1];
                         var _is_wrong = (i == 0) ? _start_was_wrongly_flagged : is_wrongly_flagged(_px, _py);
                         if (_is_wrong) {
                             Minefield.explode(_px, _py);
                         }
                     }
                }

                global.turn = (global.turn == "White") ? "Black" : "White";

                selected = false
                legal_moves = []
                flagging_squares = []
                _moved = true
                break
            }
        }
        
        if !_moved
        {
            selected = false
            legal_moves = []
            flagging_squares = []
        }
    }
}

if mouse_check_button_pressed(mb_right)
{
    var mouse_grid_x = (mouse_x - global.board_x) div global.tilesize
    var mouse_grid_y = (mouse_y - global.board_y) div global.tilesize
    
    if selected
    {
        for (var i = 0; i < array_length(flagging_squares); i++)
        {
            var _f = flagging_squares[i]
            if _f[0] == mouse_grid_x and _f[1] == mouse_grid_y
            {
                var _state = Minefield.minefield[mouse_grid_x][mouse_grid_y];
                var _p = get_piece_at(mouse_grid_x, mouse_grid_y);
                
                var _f = Minefield.flag_field[mouse_grid_x][mouse_grid_y];
                var _af = Minefield.anti_flag_field[mouse_grid_x][mouse_grid_y];
                
                if (!_af) {
                    if (_f == 0) Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 1;
                    else if (_f == 1) Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 3;
                    else if (_f == 3) Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 5;
                    else if (_f == 5) Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 9;
                    else if (_f == 9) {
                        Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 0;
                        Minefield.anti_flag_field[mouse_grid_x][mouse_grid_y] = true;
                    }
                    else Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 0; // Fallback
                } else {
                    Minefield.anti_flag_field[mouse_grid_x][mouse_grid_y] = false;
                    Minefield.flag_field[mouse_grid_x][mouse_grid_y] = 0;
                }
                
                // Update state for visuals if needed
                var _has_flags = (Minefield.flag_field[mouse_grid_x][mouse_grid_y] > 0 || Minefield.anti_flag_field[mouse_grid_x][mouse_grid_y]);
                
                if (_p != noone && _p.color == "Black") {
                    if (_has_flags) Minefield.minefield[mouse_grid_x][mouse_grid_y] = cell_state.flagged_black_piece;
                    else Minefield.minefield[mouse_grid_x][mouse_grid_y] = cell_state.revealed_black_piece;
                    
                    // Immobilization check
                    if (_p.type == "King") {
                        _p.is_immobilized = Minefield.anti_flag_field[mouse_grid_x][mouse_grid_y];
                    } else {
                        _p.is_immobilized = (Minefield.flag_field[mouse_grid_x][mouse_grid_y] == _p.value);
                    }
                } else {
                    if (_state == cell_state.hidden || _state == cell_state.flagged) {
                        if (_has_flags) Minefield.minefield[mouse_grid_x][mouse_grid_y] = cell_state.flagged;
                        else Minefield.minefield[mouse_grid_x][mouse_grid_y] = cell_state.hidden;
                    } else if (_state == cell_state.hidden_mine || _state == cell_state.flagged_mine) {
                        if (_has_flags) Minefield.minefield[mouse_grid_x][mouse_grid_y] = cell_state.flagged_mine;
                        else Minefield.minefield[mouse_grid_x][mouse_grid_y] = cell_state.hidden_mine;
                    }
                }
                Minefield.check_win();
                break;
            }
        }
    }
}

if keyboard_check_pressed(vk_space)
{
    if (global.turn == "Black") {
        global.turn = "White";
        with (Pieces) {
            selected = false;
            legal_moves = [];
            flagging_squares = [];
        }
    }
}
