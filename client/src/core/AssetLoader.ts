import { Assets, Texture } from 'pixi.js';

export class AssetLoader {
    private static assets = [
        'Black_Bishop_0', 'Black_King_0', 'Black_Knight_0', 'Black_Pawn_0', 'Black_Queen_0', 'Black_Rook_0',
        'Cursor_Black_0', 'Cursor_White_0',
        'Numbers_0', 'Numbers_1', 'Numbers_2', 'Numbers_3', 'Numbers_4', 'Numbers_5', 'Numbers_6', 'Numbers_7', 'Numbers_8', 'Numbers_9', 'Numbers_10', 'Numbers_11',
        'Numbers_Colors_0', 'Numbers_Colors_1', 'Numbers_Colors_2', 'Numbers_Colors_3', 'Numbers_Colors_4', 'Numbers_Colors_5', 'Numbers_Colors_6', 'Numbers_Colors_7', 'Numbers_Colors_8', 'Numbers_Colors_9',
        'Tiles_0',
        'White_Bishop_0', 'White_King_0', 'White_Knight_0', 'White_Pawn_0', 'White_Queen_0', 'White_Rook_0',
        'output_tileset'
    ];

    public static async load(): Promise<void> {
        for (const asset of this.assets) {
            Assets.add({ alias: asset, src: `./assets/${asset}.png` });
        }
        await Assets.load(this.assets);
    }

    public static getTexture(name: string): Texture {
        return Assets.get(name);
    }
}
