import Phaser from 'phaser'
import { allowance, balanceOf, checkWeb3Network, getPlayer, Init, receiveByContract, receiveByContractWithGas, withdrawByContract } from '../utils/web3utils';
import { touchBtnAction } from '../utils/anim';
import { popTipBox } from '../utils/ui';
import { GameContractAddress } from '../data/ConstData';

export default class MainMenu extends Phaser.Scene {
	coinText:any;
	balanceText:any;
	constructor() {
		super('MainMenu')
	}

	preload() {
		this.load.image('background', 'assets/bg.jpg');
        this.load.image('logo', 'assets/logo.png');
		this.load.image('logo2', 'assets/logo2.png');

		// anim
		for(let i = 11 ; i <= 20 ; i++) {
			this.load.image(`w_${i}`, `assets/image/w_${i}.png`);
		}

		// button
		this.load.image('start_btn1', 'assets/start_btn1.png');
		this.load.image('start', 'assets/start.png');
		this.load.image('start_btn', 'assets/start_btn.png');
		// 
		this.load.image('popTip', 'assets/image/wg_33.png');
	}

	async create() {
		
		// const logo : Phaser.GameObjects.Image = 
		this.add.image(750 / 2, 1334 / 2, 'background');
		this.add.image(750 / 2 + 100, 340, 'logo2');
		this.add.image(750 / 2, 360, 'logo');
		

		//
		this.anims.create({
            key: 'wg',
            frames: [
                { key: 'w_11' },
                { key: 'w_12' },
                { key: 'w_13' },
                { key: 'w_14' },
				{ key: 'w_15' },
				{ key: 'w_16' },
				{ key: 'w_17' },
				{ key: 'w_18' },
				{ key: 'w_19' },
				{ key: 'w_20' },
            ],
            frameRate: 8,
            repeat: -1
        });

        this.add.sprite(750 / 2, 650, 'w_11')
            .play('wg');
		//button
		const text = this.add.text(0, 0, 'Start', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);


		const startBtn1 = this.add.image(0, 0, 'start_btn1');
        const start = this.add.image(-90, 0, 'start');

		//

		//
		this.coinText = this.add.text(0, -280, `coin:0`, { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);

		this.balanceText = this.add.text(0, -230, `token:0`, { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);
		//

        const container = this.add.container(750 / 2, 1120, [ startBtn1, start, text, this.coinText, this.balanceText]);


        startBtn1.setInteractive();

        startBtn1.on('pointerdown', () =>
			{
				console.log('start game')
				// startBtn.setTint(Math.random() * 0xffffff);
				// 创建放大的补间动画
				this.tweens.add({
					targets: container,
					scaleX: 1.2, // 放大1.5倍
					scaleY: 1.2,
					ease: 'Power1', // 缩放动画的缓动函数
					duration: 100 // 动画持续时间100毫秒
				});
				//
				// 设置延迟还原
				this.time.addEvent({
					delay: 100, // 延迟100毫秒
					callback: () => {
						// 创建还原的补间动画
						this.tweens.add({
							targets: container,
							scaleX: 1, // 还原到原始大小
							scaleY: 1,
							ease: 'Power1',
							duration: 100 // 动画持续时间100毫秒
						});
						//
						this.gotoNext();
					},
					loop: false
				});
				//
				
				//
			});

		// receive
		const receiveText = this.add.text(-20, 100, 'receive', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);
		const receiveBtn = this.add.nineslice(-20, 100, 180, 80,'start_btn',[15, 15, 15, 15]).setOrigin(0.5,0.5);
		receiveBtn.setInteractive();
		receiveBtn.on('pointerdown', () =>
			{
				touchBtnAction(this,receiveBtn,async ()=>{
					//receiveByContractWithGas  receiveByContract
					const coin = await receiveByContractWithGas();
					popTipBox(this,`tip`,`receive ${coin} coin`,'popTip',"start_btn");

					this.updateText();
					//
				});
			});
		// withdraw
		const withdrawText = this.add.text(-20, 200, 'withdraw', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#387f11', 8).setOrigin(0.5,0.5);
		const withdrawBtn = this.add.nineslice(-20, 200, 180, 80,'start_btn',[15, 15, 15, 15]).setOrigin(0.5,0.5);
		withdrawBtn.setInteractive();
		withdrawBtn.on('pointerdown', () =>
			{
				touchBtnAction(this,withdrawBtn,async ()=>{
					//
					const coin = await withdrawByContract();
					popTipBox(this,`tip`,`Withdrawal ${coin} coin`,'popTip',"start_btn");

					this.updateText();
					//
				});
			});

		this.add.container(750 - 80, 0, [ receiveBtn, receiveText, withdrawBtn, withdrawText]);


		
		await Init();
		this.updateText();
		// test
		// popTipBox(this,`tip`,`Withdrawal ${1} coin`,'popTip',"start_btn");
		await allowance("0x0fb895089b9A41312B06Acac25CfDc98CD3444b0",GameContractAddress);
		await allowance("0x0fb895089b9A41312B06Acac25CfDc98CD3444b0","0x0d2aa26Cb57c84b3086EE605E3F9624d0afAAC8F");
	}

	async gotoNext() {
		if(await checkWeb3Network()){
			console.log("Web3 Network is OK")
			this.scene.start('Game');
		}else{
			popTipBox(this,`tip`,`Web3 Network is \n Linea Sepolia`,'popTip',"start_btn");
		}
        // Please install the MetaMask extension
    }

	async updateText(){
		const player = await getPlayer();
		const balance = await balanceOf(player.user.toString());

		this.coinText.setText(`coin:${player.coin}`);
		this.balanceText.setText(`token:${balance}`);
	}

	onDestroy() {
		// 销毁所有引用的游戏对象
		this.registry.destroy();
		// 销毁场景引用的任何资源
		this.textures.destroy();
		// 确保销毁场景中的所有Tween
		this.tweens.destroy();
		// 销毁所有正在播放的动画
		this.anims.destroy();
		this.load.reset();
	}




}
