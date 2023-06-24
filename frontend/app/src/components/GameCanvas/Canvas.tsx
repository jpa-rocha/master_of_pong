export class Button {
	public name: string;
	public id: number;
	public image: HTMLImageElement;
	public isFocused: boolean;
	public selected: boolean;
	public size: {x : number, y : number};
	public coordinates: {x : number, y : number};

	constructor(name: string, id: number, size: {x: number, y: number}, coordinates: {x: number, y: number}, image: HTMLImageElement = new Image()) {
		this.name = name;
		this.id = id;
		this.image = image;
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
	public gameMode: number;
	public paddle: number;
	public character: number;

	constructor (gamemode: number, paddle: number, character: number) {
		this.gameMode = gamemode;
		this.paddle = paddle;
		this.character = character;
	}
}