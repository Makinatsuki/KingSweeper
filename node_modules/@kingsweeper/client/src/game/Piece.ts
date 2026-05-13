import { Container, Sprite } from 'pixi.js';
import { Piece as SharedPiece } from '../../../shared/Piece';
import { AssetLoader } from '../core/AssetLoader';
import { TILE_SIZE } from './Board';

export class PieceView {
    public container: Container;
    private pieceSprites: Map<string, Sprite>;
    private sharedPieces: SharedPiece[];

    constructor(sharedPieces: SharedPiece[]) {
        this.container = new Container();
        this.pieceSprites = new Map();
        this.sharedPieces = sharedPieces;
    }

    public update() {
        const currentKeys = new Set<string>();

        // Add or update sprites for current pieces
        for (const piece of this.sharedPieces) {
            const key = `${piece.gridX},${piece.gridY}`;
            currentKeys.add(key);

            let sprite = this.pieceSprites.get(key);
            const assetName = `${piece.color.toLowerCase()}_${piece.type.toLowerCase()}_0`;
            
            if (!sprite) {
                sprite = new Sprite(AssetLoader.getTexture(assetName));
                sprite.width = TILE_SIZE;
                sprite.height = TILE_SIZE;
                this.container.addChild(sprite);
                this.pieceSprites.set(key, sprite);
            } else {
                // Update texture if piece type changed at this location (unlikely but possible if captured and replaced)
                sprite.texture = AssetLoader.getTexture(assetName);
            }

            sprite.x = piece.gridX * TILE_SIZE;
            sprite.y = piece.gridY * TILE_SIZE;
        }

        // Remove sprites for pieces that no longer exist
        for (const [key, sprite] of this.pieceSprites.entries()) {
            if (!currentKeys.has(key)) {
                this.container.removeChild(sprite);
                this.pieceSprites.delete(key);
            }
        }
    }
}
