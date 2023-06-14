const socket = io('http://localhost:3000');
const msgBox = document.getElementById('exampleFormControlTextarea1');
const msgCont = document.getElementById('data-container');
const email = document.getElementById('email');
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let raf;
let pressed_down;
let pressed_up;

function roundedRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x, y + radius);
	ctx.arcTo(x, y + height, x + radius, y + height, radius);
	ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
	ctx.arcTo(x + width, y, x + width - radius, y, radius);
	ctx.arcTo(x, y, x, y + radius, radius);
	ctx.fill();
}

// function getPos() {
// 	try {
// 		let response = fetch('http://localhost:3000/api/pos')
// 		// response = response.json();
// 	}
//     catch (err) {
// 		console.error(err);
// 	}
// 	return 200;
// };

const ball = {
	x: 400,
	y: 250,
	radius: 8,
	vx: 4,
	vy: 2,
	colour: "rgb(0, 150, 150)",
	draw() {
		ctx.fillStyle = this.colour;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ball.x += ball.vx;
		ball.y += ball.vy;
		if (ball.y + ball.vy > canvas.height || ball.y + ball.vy < 0) {
			ball.vy = -ball.vy;
		}
		if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
			ball.vx = -ball.vx;
		}
	},
};

const player = {
	pos_x: 778,
	pos_y: 25,
	x: 12,
	y: 60,
	radius: 5,
	colour: "rgb(200, 0, 0)",
	draw() {
		ctx.fillStyle = this.colour;
		roundedRect(ctx, this.pos_x, this.pos_y, this.x, this.y, this.radius);	
	},
};

const opponent = {
	pos_x: 10,
	pos_y: 250,
	x: 12,
	y: 60,
	radius: 5,
	colour: "rgb(200, 0, 150)",
	draw() {
		ctx.fillStyle = this.colour;
		roundedRect(ctx, this.pos_x, this.pos_y, this.x, this.y, this.radius);	
	},
};

function draw() {
	if (pressed_down) {
		player.pos_y += 3;
		if (player.pos_y > canvas.height - player.y)
			player.pos_y = canvas.height - player.y;
		sendEvent({ pos: player.pos_y });
	}
	if (pressed_up) {
		player.pos_y -= 3;
		if (player.pos_y < 0)
			player.pos_y = 0;
		sendEvent({ pos: player.pos_y });
	}
	// opponent.pos_y = getPos();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.draw();
	opponent.draw();
	ball.draw();
	raf = window.requestAnimationFrame(draw);
}

canvas.addEventListener("keydown", function(event) {
	if (event.key === 'ArrowDown')
	{
		socket.emit('keydown', 'ArrowDown');
		pressed_down = 1;
	}
	if (event.key === 'ArrowUp')
	{
		socket.emit('keydown', 'ArrowUp');
		pressed_up = 1;
	}
});

canvas.addEventListener("keyup", function(event) {
	if (event.key === 'ArrowDown')
		pressed_down = 0;
	if (event.key === 'ArrowUp')
		pressed_up = 0;
});

//get old messages from the server
const messages = [];
function getMessages() {
  fetch('http://localhost:3000/api/chat')
    .then((response) => response.json())
    .then((data) => {
      loadDate(data);
      data.forEach((el) => {
        messages.push(el);
      });
    })
    .catch((err) => console.error(err));
}
getMessages();

//When a user press the enter key,send message.
msgBox.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {
    sendMessage({ email: email.value, text: e.target.value });
    e.target.value = '';
  }
});

//Display messages to the users
function loadDate(data) {
  let messages = '';
  data.map((message) => {
    messages += ` <li class="bg-primary p-2 rounded mb-2 text-light">
       <span class="fw-bolder">${message.email}</span>
       ${message.text}
     </li>`;
  });
  msgCont.innerHTML = messages;
}

function sendEvent(event) {
  socket.emit('sendEvent', event);
}
//socket.io
//emit sendMessage event to send message
function sendMessage(message) {
  socket.emit('sendMessage', message);
}
//Listen to recMessage event to get the messages sent by users
socket.on('recMessage', (message) => {
  messages.push(message);
  loadDate(messages);
});