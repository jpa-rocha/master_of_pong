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

	public getName(): string {
		return (this.name);
	}

	public setIsFocused(focus: boolean) {
		this.isFocused = focus;
	}
}