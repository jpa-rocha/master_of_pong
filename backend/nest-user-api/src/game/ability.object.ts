// import { publicDecrypt } from "crypto";

// export class Ability {
//   //public function abilityLightning()
// 	public lightning: function name(params:type) {
// 		if (this.map.lightning) {
// 		  if (this.map.lightningDir === 0) {
// 			if (this.map.ballVel.x < 0) {
// 			  this.map.lightningDir = -1;
// 			} else {
// 			  this.map.lightningDir = 1;
// 			}
// 			this.map.ballVel.y =
// 			  (Math.abs(this.map.ballVel.y) + Math.abs(this.map.ballVel.x)) * 2;
// 			this.map.ballVel.x = 0;
// 			if (this.map.ballPos.y > 300) {
// 			  this.map.ballVel.y = -this.map.ballVel.y;
// 			  this.map.ballPosTarget = this.map.ballPos.y - 250;
// 			} else {
// 			  this.map.ballPosTarget = this.map.ballPos.y + 250;
// 			}
// 		  }
// 		  if (
// 			(this.map.ballVel.y >= 0 &&
// 			  this.map.ballPos.y >= this.map.ballPosTarget) ||
// 			(this.map.ballVel.y < 0 && this.map.ballPos.y <= this.map.ballPosTarget)
// 		  ) {
// 			this.map.lightning = false;
// 			const hypotenuse = 5;
// 			this.map.ballVel.y = -this.map.ballVel.y / 4;
// 			if (this.map.lightningDir < 0) {
// 			  this.map.ballVel.x = -Math.sqrt(
// 				hypotenuse ** 2 - this.map.ballVel.y ** 2,
// 			  );
// 			} else
// 			  this.map.ballVel.x = Math.sqrt(
// 				hypotenuse ** 2 + this.map.ballVel.y ** 2,
// 			  );
// 			setTimeout(() => {
// 			  this.gameGateway.server.emit('lightning', {
// 				lightning: false,
// 			  });
// 			  const lengthNew = Math.sqrt(
// 				this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2,
// 			  );
// 			  const scaleFactor = 5 / lengthNew;
// 			  this.map.ballVel.x *= scaleFactor;
// 			  this.map.ballVel.y *= scaleFactor;
// 			}, 800);
// 			this.map.lightningDir = 0;
// 		  }
// 		}
// 	}
// }
