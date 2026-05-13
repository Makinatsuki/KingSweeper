if instance_exists(Minefield) == false
{
    exit
}
for (var i = 0; i < array_length(layout); i++)
{
    for (var j = 0; j < array_length(layout[i]); j++)
    {
        var _gx = (x - global.board_x) div global.tilesize + i
        var _gy = (y - global.board_y) div global.tilesize + j
        instance_create_depth(x + i * global.tilesize, y + j * global.tilesize, -100, Pieces, {name : layout[i][j], grid_x : _gx, grid_y : _gy})
    }
}
instance_destroy()