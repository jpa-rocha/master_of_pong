export interface Message {
	id: number;
	sender: User;
	content: string;
}

export interface User {
	id: string;
	socketID: string;
	username: string;
	status: string;
	isFriend: boolean;
	forty_two_id: number;
	refresh_token: string;
	email: string;
	avatar: string;
	is_2fa_enabled: boolean;
	xp: number;
	blocked: User[];
}

export interface Chat {
	id: number;
	title: string;
	creator: User;
	channel: string;
	password: string;
	users: User[];
	admins: User[];
	banned: User[];
	muted: User[];
}