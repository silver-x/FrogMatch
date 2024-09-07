export default class Player {
	luck:number;  // luck color
	surplus:number;
	own:number;
    cards:number[];
	constructor() {
		this.luck = 0
		this.surplus = 0
		this.own = 0
        this.cards = [];
	}
}