import Phaser from 'phaser'
import Player from '../model/Player';
import { randomInt, setActive } from '../utils/utils';
import { CardPos } from '../data/CardData';
import { allowance, approve, buyBoxByContractWithGas2, getPlayer, openBoxByContract, w3ToNumber } from '../utils/web3utils';
import { GameContractAddress } from '../data/ConstData';


class Box {
	x:number | undefined;
	y:number | undefined;
	r:number | undefined;
	constructor(x:number,y:number,r:number) {
		this.x = x
		this.y = y
		this.r = r
	}
}

export default class GameView extends Phaser.Scene {
	boxs : Box[];
	buyContainer : Phaser.GameObjects.Container | undefined;
	luckContainer : Phaser.GameObjects.Container | undefined;
	player : Player;
	luckCard : Phaser.GameObjects.Image | undefined;
	textSurplus : Phaser.GameObjects.Text | undefined;
	textOwn : Phaser.GameObjects.Text | undefined;
	box : Phaser.GameObjects.RenderTexture | undefined;
	//
	sendCardIndex:number;
	sendCardDone: boolean;
	//
	cardSurplus : Phaser.GameObjects.Image[];
	nullColorNum: number;
	checkIndex: number;
	checkDone: boolean;
	//
	randomColors: Map<string,number>;
	cards: Map<number,Phaser.GameObjects.Image|undefined>;

	//
	IsCheckResult:boolean;

	constructor() {
		super('Game')
		this.boxs = [];
		this.player = new Player();

		this.cardSurplus = [];

		//
		this.sendCardIndex = 0;
		this.sendCardDone = false;
		//
		this.nullColorNum = 0;
		this.checkIndex = 0;
		this.checkDone = false;
		//
		this.randomColors = new Map([
			["0", 255],
			["1", 255],
			["2", 255],
			["3", 255],
			["4", 255],
			["5", 255],
			["6", 255],
			["7", 255],
			["8", 255],
			["9", 255],
		]);
		//
		this.cards = new Map<number,Phaser.GameObjects.Image>();

		this.IsCheckResult = false;
	}

	preload() {
		// TOP
		this.load.image(`wg_50-2`, `assets/image/wg_50-2.png`);
		this.load.image(`wg_47-1`, `assets/image/wg_47-1.png`);

		for(let i = 21 ; i <= 30 ; i++) {
			this.load.image(`wg_${i}`, `assets/image/wg_${i}.png`);
		}

		// TIP
		this.load.image(`x12`, `assets/image/x1.png`);

		// turtle
		for(let i = 11 ; i <= 20 ; i++) {
			this.load.image(`wg_${i}`, `assets/image/w_${i}.png`);
		}

		// light 
		this.load.image(`wg_37`, `assets/image/wg_37.png`);


		// center
		this.load.image(`wg_211_1`, `assets/image/wg_211_1.png`);


		// bottom
		this.load.image(`surplus`, `assets/image/x6.png`);
		this.load.image(`box`, `assets/image/wg_42.png`);
		this.load.image(`own`, `assets/image/x2.png`);

		this.load.image(`boxIcon`, `assets/image/wg_44-2.png`);

		// buy box
		this.load.image(`buy1bg`, `assets/image/wg_33.png`);
		this.load.image(`buy2bg`, `assets/image/wg_34.png`);
		this.load.image(`buy3bg`, `assets/image/wg_35.png`);

		this.load.image(`buyItem`, `assets/image/wg_45.png`);

		this.load.image(`btn`, `assets/image/wg_43.png`);

		this.load.image(`surplusBig`, `assets/image/x7.png`);
	}

	async create() {
		// bg
		for(let i = 0 ; i < 6 ; i++) {
			for(let j = 0 ; j < 9 ; j++) {
				this.add.image(i*160, j*161, 'wg_50-2');
			}
		}
		// top bg
		this.add.image(750 / 2, 127, 'wg_47-1');

		// random
		let index = 0;
		for(let i = 0 ; i < 2; i++){
			for(let j = 21 ; j <= 30 ; j++) {
				const x = -560 + j * 30 + i * 300;
				const randomY = Math.random()*80 - 40;
				const randomRotation = Math.random()*360;
				const y = 127 + randomY;
				const box = new Box(x,y,randomRotation);
				this.boxs[index] = box;
				index++;
			}
		}

		// random
		for(let i = 0 ; i < this.boxs.length ; i++){
			const random = Math.trunc(Math.random()*this.boxs.length);
			const temp = this.boxs[i] 
			this.boxs[i] = this.boxs[random];
			this.boxs[random] = temp;
		}
		
		// top box
		index = 0;
		for(let i = 0 ; i < 2; i++){
			for(let j = 21 ; j <= 30 ; j++) {
				const img:Phaser.GameObjects.Image = this.add.image(j * 30 + i * 400 , 127, `wg_${j}`);
				img.setScale(0.5);

				const box = this.boxs[index];
				img.setX(box.x);
				img.setY(box.y);
				img.setRotation(box.r);

				index++;
			}
		}

		// tip
		const image = this.add.image(-750 / 2 + 140, 0, 'x12').setScale(0.8);
		const text1 = this.add.text(-140, -60, 'Luck +1', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#895e48', 8);

		const text2 = this.add.text(40, -60, 'Pair +1', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#895e48', 8);

		const text3 = this.add.text(-140, 0, 'Three +3', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#895e48', 8);

		const text4 = this.add.text(40, 0, 'All +5', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(40).setStroke('#895e48', 8);

		// light 
        const light = this.add.image(0, 0, 'wg_37').setOrigin(0.5, 0.5);
        this.tweens.add({
            targets: light,
            angle: '+=360',
            duration: 5000,
            repeat: -1
        });

		this.luckCard = this.add.image(0, 0, 'wg_11').setScale(0.5);

		const textTip = this.add.text(-32, 20, 'LUCK', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(20).setStroke('#895e48', 8);
		

		const container1 = this.add.container(250 , 0, [ light, this.luckCard, textTip]);

		this.add.container(750 / 2, 340, [ image, container1, text1, text2, text3, text4]);

		// center
		this.add.image(750 / 2, 730, 'wg_211_1');


		// bottom
		const surplus = this.add.image(-750 / 2 + 40, 0, 'surplus').setScale(1.3,1);

		this.textSurplus = this.add.text(-750 / 2 + 40, -240, 'Surplus:0', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(60).setStroke('#895e48', 8).setOrigin(0.5,0.5);

		this.box = this.add.nineslice(0, 0,280, 280,'box',[15, 15, 15, 15]).setOrigin(0.5,0.5);
		
		const boxIcon = this.add.image(0, -60, 'boxIcon');

		const textBox= this.add.text(-90, 10, 'OPEN', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(60).setStroke('#895e48', 8);

		const own = this.add.image(750 / 2 - 40, 0, 'own').setScale(1.3,1.3);

		this.textOwn = this.add.text(750 / 2 - 60, -240, 'Own:0', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(60).setStroke('#895e48', 8).setOrigin(0.5,0.5);


		this.add.container(750 / 2 , 1200, [ surplus, this.textSurplus, this.box, boxIcon, textBox, own, this.textOwn]).setScale(0.6);

		this.box?.disableInteractive();
		const player = await getPlayer();
		if(player.status.toString() == "0"){
			this.buyBox();
		}else{
			this.reJoinRoom(w3ToNumber(player.luck),w3ToNumber(player.surplus),w3ToNumber(player.own),player.cards);

		}
		// this.luckBox();

		// event
		this.box.on('pointerdown', () =>
			{
				this.box?.disableInteractive();
				this.touchBtnAction(this.box,()=>{
					//
					this.openBox();
				});
			});

		// test
		// this.resultBox(24);
	}

	reJoinRoom(luck:number,surplus:number,own:number,cards:any[]){

		this.player.luck = luck;
		this.player.surplus = surplus;
		this.player.own = own;
		this.player.cards = [
			255,255,255,
			255,255,255,
			255,255,255
		];

		this.luckCard?.setTexture(`wg_${11+this.player.luck}`);
		this.textSurplus?.setText(`surplus:${this.player.surplus}`);
		this.textOwn?.setText(`Own:${this.player.own}`);
		// 
		this.sendCard(surplus);
		//
		for(let i = 0 ; i < this.player.cards.length ; i++){
			let color = w3ToNumber(cards[i]);
			if(color != 255){
				//
				const pos = CardPos[i];
				this.player.cards[i] = color;
				const randomRotation = Math.random()*360;
				const card1 = this.add.image(pos.x, pos.y, `wg_${11+color}`).setOrigin(0.5,0.5).setScale(0.8).setRotation(randomRotation);
				this.cards.set(i,card1);
				//
			}
		}
		//
		for(let i = 0 ; i < this.player.own ; i++){
			const randomRotation = Math.random()*360;
			const randomX = Math.random()*80 - 40;
			const randomY = Math.random()*60 - 30;
			const color = randomInt(10);
			this.add.image(570+randomX, 1190+randomY, `wg_${11+color}`).setOrigin(0.5,0.5).setScale(0.5).setRotation(randomRotation);
		}
		//
	}

	//game
	playerReInit(num:number,luck:number){
		this.player.luck = luck; //randomInt(10);
		this.player.surplus = num;
		this.player.own = 0;
		this.player.cards = [
			255,255,255,
			255,255,255,
			255,255,255
		];

		this.luckCard?.setTexture(`wg_${11+this.player.luck}`);
		this.textSurplus?.setText(`surplus:${this.player.surplus}`);
		this.textOwn?.setText(`Own:${this.player.own}`);

		// 
		this.sendCard(num);
	}

	sendCard(num:number){
		for(let i = 0 ; i < num ; i++){
			const color = randomInt(10);
			const randomX = Math.random()*80 - 40;
			const randomY = Math.random()*60 - 30;
			const randomRotation = Math.random()*360;

			// 375, 127
			const card = this.add.image(375, 127, `wg_${21+color}`).setOrigin(0.5,0.5).setRotation(randomRotation).setScale(0.5);
			this.tweens.add({
				targets: card,
				x: 170+randomX,
				y: 1190+randomY,
				delay: 300/num*i,
				duration: 200,
				repeat: 0,
				hold: 100,
				repeatDelay: 100,
				ease: 'quad.out',
				onComplete: () => {
					this.sendCardIndex++;
					if(this.sendCardIndex >= num){
						this.sendCardDone = true;
						this.box?.setInteractive();
						console.log("sendCardDone");
					}
				},
			});
			this.cardSurplus.push(card);
		}
	}

	async startGame(index:number){
		let coin1 = index;
		const player1 = await getPlayer();
		const coin = await allowance(player1.user,GameContractAddress);
		if(coin < coin1){
			await approve(GameContractAddress,coin1);
		}
		const player = await buyBoxByContractWithGas2(index);

		setActive(this.buyContainer,false);
		this.playerReInit(w3ToNumber(player.surplus),w3ToNumber(player.luck));
	}

	nextCard(){
		// console.log(`nextCard`);
		//
		const pos = CardPos[this.checkIndex];
		const color = this.player.cards[this.checkIndex];
		if(color == 255){
			this.nullColorNum ++ ;
			if(this.cardSurplus.length > 0){
				//
				this.player.surplus--;
				this.textSurplus?.setText(`surplus:${this.player.surplus}`);
				const card = this.cardSurplus.pop()!;
				card.setDepth(1);
				//
				const color = this.randomColors.get(this.checkIndex+"")!;
				// console.log("color =======> " + color);
				//
				this.tweens.add({
					targets: card, // 指定tween对象
					x: pos.x,
					y: pos.y,
					angle: 0,
					scale: 0.8, // 缩放至原大小的2倍
					ease: 'Power1', // 缓动函数
					duration: 200, // 动画持续时间，单位毫秒
					repeat: 0, // 重复次数，0为不重复
					yoyo: false, // 是否来回动画
					onComplete: () => {
						//open box
						
						const randomRotation = Math.random()*360;
						const card1 = this.add.image(pos.x, pos.y, `wg_${11+color}`).setOrigin(0.5,0.5).setScale(0.8).setRotation(randomRotation);
						this.cards.set(this.checkIndex,card1);
	
						this.player.cards[this.checkIndex] = color!;
	
						this.tweens.add({
							targets: card,
							alpha: 0, // 将透明度设置为0（完全透明）
							ease: 'Linear', // 使用线性缓动函数
							duration: 100, // 动画持续时间2000毫秒
							repeat: 0, // 重复次数
							yoyo: false,
							onComplete:() => {
								card.destroy();
							}
						});
	
						//
						this.checkIndex ++ ;
						if(this.checkIndex < this.player.cards.length){
							// console.log(`nextCard 1`);
							this.nextCard();
						}else{
							this.checkDone = true;
							console.log("checkDone");
							// this.box?.setInteractive();
							this.timeRun(100,()=>{
								this.IsCheckResult = true;
								this.checkResult();
							});
						}
					},
				});
				//
			}else{
				//
				this.IsCheckResult = true;
				this.checkResult();
				//
			}
			//
		}else{
			this.checkIndex ++ ;
			if(this.checkIndex < this.player.cards.length){
				// console.log(`nextCard 2`);
				this.nextCard();
			}else{
				this.checkDone = true;
				console.log("checkDone");
				// this.box?.setInteractive();
				this.timeRun(100,()=>{
					this.IsCheckResult = true;
					this.checkResult();
				});
			}
		}
		//
	}

	async openBox(){
		let randomCard = [
			randomInt(100000000),randomInt(100000000),randomInt(100000000),randomInt(100000000),
			randomInt(100000000),randomInt(100000000),randomInt(100000000),randomInt(100000000),
			randomInt(100000000)];
		console.log("randomCard => " + randomCard);

		const array = await openBoxByContract(randomCard);


		// return;
		this.randomColors.clear();


		for(let i = 0 ; i < this.player.cards.length ; i++){
			const color = this.player.cards[i];
			if(color == 255 && array[i] != 255){
				// const rand = randomInt(100000000);	// local
				const rand = w3ToNumber(array[i]);
				this.randomColors.set(i+"",rand);
			}
		}

		this.nullColorNum = 0;
		this.checkIndex = 0;
		this.nextCard();
	}

	checkResult(){
		if(!this.IsCheckResult){return;}
		this.IsCheckResult = false;
		console.log("checkResult => " + this.player.surplus)
		const map: Map<string,number> = new Map([
			["255", 0],
			["0", 0],
			["1", 0],
			["2", 0],
			["3", 0],
			["4", 0],
			["5", 0],
			["6", 0],
			["7", 0],
			["8", 0],
			["9", 0],
		]); 

		const mapArr: Map<string,number[]> = new Map([
			["255", []],
			["0", []],
			["1", []],
			["2", []],
			["3", []],
			["4", []],
			["5", []],
			["6", []],
			["7", []],
			["8", []],
			["9", []],
		]); 

		
		for(let i = 0 ;i < this.player.cards.length ; i++){
			const color = this.player.cards[i];
			let num = map.get(color+"");
			if(!num){ num = 0; }
			num++;
			map.set(color+"",num);
			//
			let arr = mapArr.get(color+"");
			if(!arr){arr = []}
			arr.push(i);
			mapArr.set(color+"",arr);
		}
		// 清台
		const number1 = map.get("255");
		if(number1 == 9){
			this.IsCheckResult = true;
			// 清台
			this.sendCardInGame(5);
			this.showTip("All +5",750/2,1334/2);
			this.updatePlayerUI(5);
			this.roundEnd();
			return;
		}

		for(let i = 0 ;i < this.player.cards.length ; i++){
			const color = this.player.cards[i];
			if(color == 255){
				continue;
			}
			const num = map.get(color+"");
			if(num){
				if(num >= 3){
					this.IsCheckResult = true;
					// 三连
					this.sendCardInGame(3);
					this.showTip("Three +3",750/2,1334/2);
					this.updatePlayerUI(3);
					const arr : number[] = mapArr.get(color+"")!;
					this.gotoOwn(arr,3,()=>{
						this.checkResult();
					});
					return;
				}
				if(num == 2){
					this.IsCheckResult = true;
					// 对碰
					this.sendCardInGame(1);
					this.showTip("Pair +1",750/2,1334/2);
					this.updatePlayerUI(2);
					const arr : number[] = mapArr.get(color+"")!;
					this.gotoOwn(arr,2,()=>{
						this.checkResult();
					});
					return;
				}
				if(color == this.player.luck){
					this.IsCheckResult = true;
					// 幸运
					this.sendCardInGame(1);
					this.showTip("Luck +1",750/2,1334/2);
					this.updatePlayerUI(1);
					this.gotoOwn([i],1,()=>{
						this.checkResult();
					});
					return;
				}
			}
		}

		// no card cant clear
		this.roundEnd();

	}

	gotoOwn(arr:number[],max:number,callback:any){

		for(let j = 0 ; arr && j < max; j++){
			const randomX = Math.random()*80 - 40;
			const randomY = Math.random()*60 - 30;

			const cardIndex = arr[j];
			const card = this.cards.get(cardIndex);
			//
			this.player.cards[cardIndex] = 255;
			let call:any = undefined;
			if(j == max -1){
				call = callback;
			}
			//
			this.tweens.add({
				targets: card,
				x: 570+randomX,
				y: 1190+randomY,
				scale: 0.5,
				delay: 100,
				duration: 1200,
				repeat: 0,
				hold: 100,
				repeatDelay: 100,
				ease: 'quad.out',
				onComplete: () => {
					this.cards.set(cardIndex,undefined);
					//
					call && call();
				},
			});
		}
	}

	roundEnd(){
		
		console.log("roundEnd => " + this.player.surplus)
		//
		if(this.player.surplus <= 0){
			this.gameEnd();
		}else{
			this.box?.setInteractive();
		}
	}

	gameEnd(){
		console.log("gameEnd")
		const arr:number[] = [];
		for(let i = 0 ;i < this.player.cards.length ; i++){
			const color = this.player.cards[i];
			if(color == 255){
				continue;
			}
			arr.push(i);
		}

		if(arr.length>0) {
			this.updatePlayerUI(arr.length);
			this.gotoOwn(arr,arr.length,()=>{
				this.resultBox(this.player.own);
			});
		}else{
			this.resultBox(this.player.own);
		}


	}

	sendCardInGame(num:number){
		for(let i = 0 ; i < num ; i++){
			const color = randomInt(10);
			const randomX = Math.random()*80 - 40;
			const randomY = Math.random()*60 - 30;
			const randomRotation = Math.random()*360;
			this.player.surplus++;
			this.textSurplus?.setText(`surplus:${this.player.surplus}`);
			// 375, 127
			const card = this.add.image(375, 127, `wg_${21+color}`).setOrigin(0.5,0.5).setRotation(randomRotation).setScale(0.5);
			this.tweens.add({
				targets: card,
				x: 170+randomX,
				y: 1190+randomY,
				delay: 300/num*i,
				duration: 1000,
				repeat: 0,
				hold: 100,
				repeatDelay: 100,
				ease: 'quad.out',
				onComplete: () => {
					//
				},
			});
			this.cardSurplus.push(card);
		}
	}

	// Player
	updatePlayerUI(num:number){
		this.player.own += num;
		this.textOwn?.setText(`Own:${this.player.own}`);
	}


	//box
	buyBox() {
		// bg
		const color1 = new Phaser.Display.Color(0, 0, 0);
		const rect1 = this.add.rectangle(0, 0, 750*2, 1334*2, color1.color,80);
		// title
		const title = this.add.text(750 / 2 - 160, 340, 'select bag', { fontFamily: 'Arial', color: '#ffc427' })
			.setFontSize(80).setStroke('#ffffff', 20);

		// order 1
		const buy1bg = this.add.image(0, 0, 'buy1bg')
		const buy1Item = this.add.image(-40, 20, 'buyItem')
		const btn1 = this.add.image(0, 260, 'btn')

		const title1 = this.add.text(-60, -120, 'Junior', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(30).setStroke('#000000', 2);

		const num1 = this.add.text(20, 20, 'X9', { fontFamily: 'Arial', color: '#2ad9e6' })
			.setFontSize(40);

		const coin1 = this.add.text(-60, 240, '1 token', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#387f11', 2);

		const container1 = this.add.container(750 / 2 - 240, 660, [ buy1bg, buy1Item, btn1, title1, num1, coin1]);
		// order 2
		const buy2bg = this.add.image(0, 0, 'buy2bg')
		const buy2Item = this.add.image(-40, 20, 'buyItem')
		const btn2 = this.add.image(0, 260, 'btn')

		const title2 = this.add.text(-60, -120, 'General', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(30).setStroke('#000000', 2);

		const num2 = this.add.text(20, 20, 'X16', { fontFamily: 'Arial', color: '#787dff' })
			.setFontSize(40);

		const coin2 = this.add.text(-60, 240, '2 token', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#387f11', 2);

		const container2 = this.add.container(750 / 2, 660, [ buy2bg, buy2Item, btn2, title2, num2, coin2]);


		// order 3
		const buy3bg = this.add.image(0, 0, 'buy3bg')
		const buy3Item = this.add.image(-40, 20, 'buyItem')
		const btn3 = this.add.image(0, 260, 'btn')

		const title3 = this.add.text(-60, -120, 'Senior', { fontFamily: 'Arial', color: '#ffffff' })
		.setFontSize(30).setStroke('#000000', 2);

		const num3 = this.add.text(20, 20, 'X16', { fontFamily: 'Arial', color: '#ffc22a' })
			.setFontSize(40);

		const coin3 = this.add.text(-60, 240, '3 token', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#387f11', 2);

		const container3 = this.add.container(750 / 2 + 240, 660, [ buy3bg, buy3Item, btn3,  title3, num3, coin3]);


		this.buyContainer = this.add.container(0, 0, [ rect1, title, container1,container2,container3]);


		// event
		btn1.setInteractive();
		btn2.setInteractive();
		btn3.setInteractive();

		btn1.on('pointerdown', () =>
			{
				this.touchBtnAction(btn1,()=>{
					this.startGame(1); //9
				});
			});

		btn2.on('pointerdown', () =>
			{
				this.touchBtnAction(btn2,()=>{
					this.startGame(2); //,18
				});
			});

		btn3.on('pointerdown', () =>
			{
				this.touchBtnAction(btn3,()=>{
					this.startGame(3); //,36
				});
			});

		// test
		// this.setActive(this.buyContainer,false);

	}

	luckBox() {
		// bg
		const color1 = new Phaser.Display.Color(0, 0, 0);
		const rect1 = this.add.rectangle(0, 0, 750*2, 1334*2, color1.color,80);

		// title
		const title = this.add.text(750 / 2 - 200, 340, '选择幸运色', { fontFamily: 'Arial', color: '#ffc427' })
			.setFontSize(80).setStroke('#ffffff', 20);


		// select item


		// yes call
		const btnYes = this.add.image(0, 260, 'btn')

		const textYes = this.add.text(-40, 240, '确定', { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#387f11', 2);

		const containerYes = this.add.container(750 / 2, 760, [ btnYes, textYes]);


		//
		this.luckContainer = this.add.container(0, 0, [ rect1, title, containerYes]);
	}

	resultBox(num:number) {
		// bg
		const color1 = new Phaser.Display.Color(0, 0, 0);
		const rect1 = this.add.rectangle(0, 0, 750*2, 1334*2, color1.color,80);

		// title
		const title = this.add.text(0, -500, 'coin:'+num, { fontFamily: 'Arial', color: '#ffc427' }).setOrigin(0.5,0.5)
			.setFontSize(80).setStroke('#ffffff', 20);

		const own = this.add.image(0, 0, 'surplusBig').setOrigin(0.5,0.5)

		const btn = this.add.image(0, 500, 'btn').setOrigin(0.5,0.5)

		const textBtn = this.add.text(0, 500, 'home', { fontFamily: 'Arial', color: '#ffffff' }).setOrigin(0.5,0.5)
			.setFontSize(40).setStroke('#387f11', 2);

		const container = this.add.container(750 / 2, 1334 / 2, [ rect1, title, own,  btn, textBtn]);
		btn.setInteractive();
		btn.on('pointerdown', () =>
			{
				this.touchBtnActionOnce(btn,()=>{
					this.gotoHome();
				});
			});
		this.resultOwnCard(container,num);
	}

	resultOwnCard(container:any,num:number){
		for(let i = 0 ; i < num ; i++){
			const color = randomInt(10);
			const randomX = Math.random()*400-200;
			const randomY = Math.random()*400-200;
			const randomRotation = Math.random()*360;

			// 375, 127
			const card = this.add.image(randomX, randomY, `wg_${11+color}`).setOrigin(0.5,0.5).setRotation(randomRotation).setScale(0.8);
			container.add(card);
			this.tweens.add({
				targets: card,
				x: randomX,
				y: randomY,
				delay: 300/num*i,
				duration: 200,
				repeat: 0,
				hold: 100,
				repeatDelay: 100,
				ease: 'quad.out',
				onComplete: () => {
					//
				},
			});
			
		}
	}

	// func touch button
	touchBtnAction(targets : any,callback: any){
		// 创建放大的补间动画
		this.zoom(targets,1.2);
		// 设置延迟还原
		this.timeRun(100,()=>{
			this.zoom(targets,1);
			this.timeRun(100,()=>{
				callback();
			});
		});
		//
	}

	touchBtnActionOnce(targets : any,callback: any){
		targets.setInteractive();
		// 创建放大的补间动画
		this.zoom(targets,1.2);
		// 设置延迟还原
		this.timeRun(100,()=>{
			this.zoom(targets,1);
			this.timeRun(100,()=>{
				targets.disableInteractive();
				callback();
			});
		});
		//
	}

	zoom(targets : any,scale : number){
		this.tweens.add({
			targets: targets,
			scaleX: scale,
			scaleY: scale,
			ease: 'Power1', // 缩放动画的缓动函数
			duration: 100 // 动画持续时间100毫秒
		});
	}

	timeRun(delay: number,callback: any,data?:any){
		this.time.addEvent({
			delay: delay, // 延迟100毫秒
			callback: () => {
				callback(data);
			},
			loop: false
		});
	}

	// Anim
	showTip(text:string,x:number,y:number,callback?:any){
		//
		const text1 = this.add.text(x, y, text, { fontFamily: 'Arial', color: '#ffffff' })
			.setFontSize(40).setStroke('#895e48', 8);
			this.tweens.add({
				targets: text1, // 指定tween对象
				x: x,
				y: y,
				angle: 0,
				scale: 1.2, // 缩放至原大小的2倍
				ease: 'Power1', // 缓动函数
				duration: 600, // 动画持续时间，单位毫秒
				repeat: 0, // 重复次数，0为不重复
				yoyo: false, // 是否来回动画
				onComplete: () => {
					//
					text1.destroy();
					callback&&callback();
				}
			});
	}


	//
	gotoHome(){
		this.scene.start('MainMenu');
	}

	//
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
