import Phaser from 'phaser'
import MainMenu from './scene/MainMenu'
import GameView from './scene/GameView';
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
	width: 750,
	height: 1334,
    parent: 'game-container',
    backgroundColor: '#c8ec64',
    plugins: {
		global: [ NineSlicePlugin.DefaultCfg ],
	},
    scene: [
        MainMenu,
		GameView,
        // Boot,
        // Preloader,
        // MainMenu,
        // MainGame,
        // GameOver
    ],
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT, // 单向撑满，另一向可能留空
		autoCenter:Phaser.Scale.Center.CENTER_BOTH,
		min: {
            width: 375,
            height: 667
        },
	}
};

const StartGame = (parent: string) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
