export class Button {
	public name: string;
	public isFocused: boolean;
	public selected: boolean;
	public size: {x : number, y : number};
	public coordinates: {x : number, y : number};

	constructor(name: string, size: {x: number, y: number}, coordinates: {x: number, y: number}) {
		this.name = name;
		this.isFocused = false;
		this.selected = false;
		this.size = size;
		this.coordinates = coordinates;
	}

	public setSizeLocation(size: {x: number, y: number}, coordinates: {x: number, y: number})
	{
		this.size = size;
		this.coordinates = coordinates;
	}

	public getName(): string {
		return (this.name);
	}

	public setIsFocused(focus: boolean) {
		this.isFocused = focus;
	}
}

export class Options {
	public gameMode: string;
	public paddle: string;
	public character: string;

	constructor (gamemode: string, paddle: string, character: string) {
		this.gameMode = gamemode;
		this.paddle = paddle;
		this.character = character;
	}
}