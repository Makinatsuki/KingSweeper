entries = [P, N, B, R, Q, K, p, n, b, r, q, k]
sprite_dict = 
{
    P : [White_Pawn, "White", "Pawn"],
    N : [White_Knight, "White", "Knight"],
    B : [White_Bishop, "White", "Bishop"],
    R : [White_Rook, "White", "Rook"],
    Q : [White_Queen, "White", "Queen"],
    K : [White_King, "White", "King"],
    p : [Black_Pawn, "Black", "Pawn"],
    n : [Black_Knight, "Black", "Knight"],
    b : [Black_Bishop, "Black", "Bishop"],
    r : [Black_Rook, "Black", "Rook"],
    q : [Black_Queen, "Black", "Queen"],
    k : [Black_King, "Black", "King"]
}
if name != ""
{
    color = string_split(name, "_")[0]
    type = string_split(name, "_")[1]
}
for (var i = 0; i < array_length(entries); i++)
{
    if color == sprite_dict[$ entries[i]][1] and type == sprite_dict[$ entries[i]][2]
    {
        sprite_index = sprite_dict[$ entries[i]][0]
    }
}

selected = false
legal_moves = []
flagging_squares = []
has_moved = false

is_immobilized = false;
visible_on_board = (color == "White");
value = 0;
switch (type) {
    case "Queen": value = 9; break;
    case "Rook": value = 5; break;
    case "Knight": value = 3; break;
    case "Bishop": value = 3; break;
    case "Pawn": value = 1; break;
    case "King": value = -1; break;
}

is_wrongly_flagged = function(_gx, _gy) {
    var _f = Minefield.flag_field[_gx][_gy];
    var _af = Minefield.anti_flag_field[_gx][_gy];
    if (_f == 0 && !_af) return false;
    
    var _state = Minefield.minefield[_gx][_gy];
    var _p = noone;
    with (Pieces) {
        if (grid_x == _gx && grid_y == _gy) {
            _p = id;
            break;
        }
    }
    
    if (_p != noone && _p.color == "Black") {
        if (_p.type == "King") return !_af;
        return _f != _p.value;
    }
    
    if (_state == cell_state.hidden_mine || _state == cell_state.revealed_mine || _state == cell_state.flagged_mine) {
        return _f != 1;
    }
    
    return true;
}

get_piece_at = function(_gx, _gy) {
    var _found = noone;
    with (Pieces) {
        if (grid_x == _gx && grid_y == _gy) {
            _found = id;
            break;
        }
    }
    return _found;
}

get_legal_moves = function() {
    // Immobilization check
    if (color == "Black") {
        if (type == "King") {
            if (Minefield.anti_flag_field[grid_x][grid_y]) return [];
        } else {
            if (Minefield.flag_field[grid_x][grid_y] == value) return [];
        }
    }

    var _moves = [];
    var _dirs = [];
    
    var _start_state = Minefield.minefield[grid_x][grid_y];
    _start_is_hidden = (_start_state == cell_state.hidden || _start_state == cell_state.hidden_mine || _start_state == cell_state.hidden_black_piece || _start_state == cell_state.flagged || _start_state == cell_state.flagged_mine || _start_state == cell_state.flagged_black_piece);
    
    _is_boundary = false;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) continue;
            var _nx = grid_x + i;
            var _ny = grid_y + j;
            if (_nx >= 0 && _nx < global.boardsize && _ny >= 0 && _ny < global.boardsize) {
                var _nstate = Minefield.minefield[_nx][_ny];
                var _n_is_hidden = (_nstate == cell_state.hidden || _nstate == cell_state.hidden_mine || _nstate == cell_state.hidden_black_piece || _nstate == cell_state.flagged || _nstate == cell_state.flagged_mine || _nstate == cell_state.flagged_black_piece);
                if (_start_is_hidden != _n_is_hidden) {
                    _is_boundary = true;
                    break;
                }
            }
        }
        if (_is_boundary) break;
    }

    var _check_move = function(_gx, _gy, __moves, _is_sliding) {
        if (_gx < 0 || _gx >= global.boardsize || _gy < 0 || _gy >= global.boardsize) return false;
        var _p = get_piece_at(_gx, _gy);
        
        var _state = Minefield.minefield[_gx][_gy];
        var _is_hidden = (_state == cell_state.hidden || _state == cell_state.hidden_mine || _state == cell_state.hidden_black_piece || _state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece);
        
        var _is_flagged = (_state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece);

        // Boundary Rule for sliding pieces
        if (_is_sliding && color == "Black") {
            if (_start_is_hidden && !_is_hidden && !_is_boundary) return false;
        }

        if (_p == noone) {
            if (color == "White") {
                if (!_is_flagged) {
                    array_push(__moves, [_gx, _gy]);
                }
                return !_is_hidden; 
            } else {
                // Black pieces
                var _pov = global.get_local_pov();
                if ((!_is_flagged || is_wrongly_flagged(_gx, _gy)) && (_is_hidden || _pov == "Black" || _state == cell_state.revealed || _state == cell_state.revealed_black_piece)) {
                    array_push(__moves, [_gx, _gy]);
                    if (_is_sliding && _start_is_hidden != _is_hidden) return false;
                    return true;
                }
                return false;
            }
        } else {
            if (_p.color != color) {
                if (_is_flagged && !is_wrongly_flagged(_gx, _gy)) return false;
                if (color == "Black") {
                    if (_is_sliding && _start_is_hidden && !_is_hidden && !_is_boundary) return false;
                }
                array_push(__moves, [_gx, _gy]);
            }
            return false;
        }
    }

    switch (type) {
        case "Rook":
            _dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                for (var j = 1; j < global.boardsize; j++) {
                    if (!_check_move(grid_x + _d[0] * j, grid_y + _d[1] * j, _moves, true)) break;
                }
            }
            break;
        case "Bishop":
            _dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                for (var j = 1; j < global.boardsize; j++) {
                    if (!_check_move(grid_x + _d[0] * j, grid_y + _d[1] * j, _moves, true)) break;
                }
            }
            break;
        case "Queen":
            _dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                for (var j = 1; j < global.boardsize; j++) {
                    if (!_check_move(grid_x + _d[0] * j, grid_y + _d[1] * j, _moves, true)) break;
                }
            }
            break;
        case "Knight":
            _dirs = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                _check_move(grid_x + _d[0], grid_y + _d[1], _moves, false);
            }
            break;
        case "King":
            _dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                _check_move(grid_x + _d[0], grid_y + _d[1], _moves, false);
            }
            break;
        case "Pawn":
            var _move_dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (var i = 0; i < array_length(_move_dirs); i++) {
                var _d = _move_dirs[i];
                var _gx = grid_x + _d[0];
                var _gy = grid_y + _d[1];
                if (_gx >= 0 && _gx < global.boardsize && _gy >= 0 && _gy < global.boardsize) {
                    var _p = get_piece_at(_gx, _gy);
                    var _state = Minefield.minefield[_gx][_gy];
                    var _is_hidden = (_state == cell_state.hidden || _state == cell_state.hidden_mine || _state == cell_state.hidden_black_piece || _state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece);
                    var _is_flagged = (_state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece);
                    if (_p == noone) {
                        if (color == "White" || ((!_is_flagged || is_wrongly_flagged(_gx, _gy)) && (_is_hidden || global.get_local_pov() == "Black" || _state == cell_state.revealed || _state == cell_state.revealed_black_piece))) {
                            array_push(_moves, [_gx, _gy]);
                            if (!has_moved) {
                                var _gx2 = grid_x + _d[0] * 2;
                                var _gy2 = grid_y + _d[1] * 2;
                                if (_gx2 >= 0 && _gx2 < global.boardsize && _gy2 >= 0 && _gy2 < global.boardsize) {
                                    var _p2 = get_piece_at(_gx2, _gy2);
                                    var _state2 = Minefield.minefield[_gx2][_gy2];
                                    var _is_hidden2 = (_state2 == cell_state.hidden || _state2 == cell_state.hidden_mine || _state2 == cell_state.hidden_black_piece || _state2 == cell_state.flagged || _state2 == cell_state.flagged_mine || _state2 == cell_state.flagged_black_piece);
                                    var _is_flagged2 = (_state2 == cell_state.flagged || _state2 == cell_state.flagged_mine || _state2 == cell_state.flagged_black_piece);
                                    if (_p2 == noone && (color == "White" || ((!_is_flagged2 || is_wrongly_flagged(_gx2, _gy2)) && (_is_hidden2 || global.get_local_pov() == "Black" || _state2 == cell_state.revealed || _state2 == cell_state.revealed_black_piece)))) {
                                        array_push(_moves, [_gx2, _gy2]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var _cap_dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_cap_dirs); i++) {
                var _d = _cap_dirs[i];
                var _gx = grid_x + _d[0];
                var _gy = grid_y + _d[1];
                if (_gx >= 0 && _gx < global.boardsize && _gy >= 0 && _gy < global.boardsize) {
                    var _cp = get_piece_at(_gx, _gy);
                    var _state = Minefield.minefield[_gx][_gy];
                    var _is_hidden = (_state == cell_state.hidden || _state == cell_state.hidden_mine || _state == cell_state.hidden_black_piece || _state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece);
                    var _is_flagged = (_state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.flagged_black_piece);
                    if (_cp != noone && _cp.color != color) {
                        if (color == "White" || ((!_is_flagged || is_wrongly_flagged(_gx, _gy)) && (_is_hidden || global.get_local_pov() == "Black" || _state == cell_state.revealed || _state == cell_state.revealed_black_piece))) {
                            array_push(_moves, [_gx, _gy]);
                        }
                    }
                }
            }
            break;
    }
    return _moves;
}

get_flagging_squares = function() {
    if (color == "Black") return [];
    var _moves = [];
    var _dirs = [];
    
    var _check_flag = function(_gx, _gy, __moves) {
        if (_gx < 0 || _gx >= global.boardsize || _gy < 0 || _gy >= global.boardsize) return false;
        var _p = get_piece_at(_gx, _gy);
        var _state = Minefield.minefield[_gx][_gy];
        var _is_hidden = (_state == cell_state.hidden || _state == cell_state.hidden_mine || _state == cell_state.flagged || _state == cell_state.flagged_mine || _state == cell_state.hidden_black_piece || _state == cell_state.flagged_black_piece);
        
        if (_p == noone) {
            array_push(__moves, [_gx, _gy]);
            return !_is_hidden;
        } else if (_p.color == "Black") {
            array_push(__moves, [_gx, _gy]);
            return false;
        }
        return false;
    }

    switch (type) {
        case "Rook":
            _dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                for (var j = 1; j < global.boardsize; j++) {
                    if (!_check_flag(grid_x + _d[0] * j, grid_y + _d[1] * j, _moves)) break;
                }
            }
            break;
        case "Bishop":
            _dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                for (var j = 1; j < global.boardsize; j++) {
                    if (!_check_flag(grid_x + _d[0] * j, grid_y + _d[1] * j, _moves)) break;
                }
            }
            break;
        case "Queen":
            _dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                for (var j = 1; j < global.boardsize; j++) {
                    if (!_check_flag(grid_x + _d[0] * j, grid_y + _d[1] * j, _moves)) break;
                }
            }
            break;
        case "Knight":
            _dirs = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                _check_flag(grid_x + _d[0], grid_y + _d[1], _moves);
            }
            break;
        case "King":
            _dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                _check_flag(grid_x + _d[0], grid_y + _d[1], _moves);
            }
            break;
        case "Pawn":
            _dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (var i = 0; i < array_length(_dirs); i++) {
                var _d = _dirs[i];
                _check_flag(grid_x + _d[0], grid_y + _d[1], _moves);
            }
            break;
    }
    return _moves;
}
