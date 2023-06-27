import heading_paddle from '../../images/heading_paddle.png';
import heading_character from '../../images/heading_character.png';
import heading_gamemode from '../../images/heading_gamemode.png';
import char_desc_bz from '../../images/char_desc_bz.png';
import char_desc_ventail from '../../images/char_desc_ventail.png';
import char_desc_raiven from '../../images/char_desc_raiven.png';
import button_mode_master from '../../images/button_mode_master.png';
import button_mode_regular from '../../images/button_mode_regular.png';
import button_mode_singleplayer from '../../images/button_mode_singleplayer.png';
import button_start from '../../images/button_start.png';
import big_paddle from "../../images/BigPaddle.png";
import regular_paddle from "../../images/RegularPaddle.png";
import small_paddle from "../../images/SmallPaddle.png";
import ice_block from '../../images/iceBlock.png';
import left_empty from '../../images/HealthBar/LeftEmpty.png';
import mid_empty from '../../images/HealthBar/MidEmpty.png';
import right_empty from '../../images/HealthBar/RightEmpty.png';
import left_full from '../../images/HealthBar/LeftFull.png';
import mid_full from '../../images/HealthBar/MidFull.png';
import right_full from '../../images/HealthBar/RightFull.png';
import icon_Background from '../../images/HealthBar/icon.png';
import icon_Symbol from '../../images/HealthBar/health.png';
import health_text from '../../images/HealthBar/healthText.png';
import paddle_bz_s from '../../images/paddle_bz_s.png';
import paddle_bz_m from '../../images/paddle_bz_m.png';
import paddle_bz_l from '../../images/paddle_bz_l.png';
import paddle_ventail_s from '../../images/paddle_ventail_s.png';
import paddle_ventail_m from '../../images/paddle_ventail_m.png';
import paddle_ventail_l from '../../images/paddle_ventail_l.png';
import paddle_raiven_l from '../../images/paddle_raiven_l.png';
import paddle_raiven_m from '../../images/paddle_raiven_m.png';
import paddle_raiven_s from '../../images/paddle_raiven_s.png';
import masterLogo from '../../images/logo.png';
import SubZeroSpecialImage from '../../images/Abilities/SubZeroSpecial.png';
import RaidenSpecialImage from '../../images/Abilities/RaidenSpecial.png';
import ScorpionSpecialImage from '../../images/Abilities/ScorpionSpecial.png';
import MirageAbilityImage from '../../images/Abilities/MirageAbility.png';
import FreezeAbilityImage from '../../images/Abilities/FreezeAbility.png';
import BiggerBallAbilityImage from '../../images/Abilities/BiggerBallAbility.png';
import SmallerBallAbilityImage from '../../images/Abilities/SmallerBallAbility.png';
import SoundGrenadeAbilityImage from '../../images/Abilities/SoundGrenadeAbility.png';

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

export class ImageContainer {
	public totalImages: number;
	public imagesLoaded: number;
	public headPaddle;
	public headCharacter;
	public headGamemode;
	public buttonCharBz;
	public buttonCharVentail;
	public buttonCharRaiven;
	public buttonModeMaster;
	public buttonModeRegular;
	public buttonModeSingle;
	public buttonPaddleSmall;
	public buttonPaddleRegular;
	public buttonPaddleBig;
	public buttonStart;
	public paddleVentailS;
	public paddleVentailM;
	public paddleVentailL;
	public paddleBzS;
	public paddleBzM;
	public paddleBzL;
	public paddleRaivenS;
	public paddleRaivenM;
	public paddleRaivenL;
	public iceBlock;
	public left_bar;
	public mid_bar;
	public right_bar;
	public left_health;
	public mid_health;
	public right_health;
	public iconBackground;
	public icon;
	public healthText;
	public logo;
	public SubZeroSpecial;
	public RaidenSpecial;
	public ScorpionSpecial;
	public MirageAbility;
	public FreezeAbility;
	public BiggerBallAbility;
	public SmallerBallAbility;
	public SoundGrenadeAbility;
	public ImageLoader;
	public YinYangRotate: HTMLImageElement [] = [];
	public YinYangEnd: HTMLImageElement [] = [];
	public Cooldown: HTMLImageElement [] = [];

	importAll(r: any) {
		return r.keys().map(r);
	}

	incrementCounter() {
		this.imagesLoaded++;
	}
	
	constructor () {
		this.totalImages = 0;
		this.imagesLoaded = 0;
		this.headPaddle = new Image();
		this.totalImages++;
		this.headPaddle.onload = this.incrementCounter.bind(this);
		this.headPaddle.src = heading_paddle;
		this.headCharacter = new Image();
		this.totalImages++;
		this.headCharacter.onload = this.incrementCounter.bind(this);
		this.headCharacter.src = heading_character;
		this.headGamemode = new Image();
		this.totalImages++;
		this.headGamemode.onload = this.incrementCounter.bind(this);
		this.headGamemode.src = heading_gamemode;
		this.buttonCharBz = new Image();
		this.totalImages++;
		this.buttonCharBz.onload = this.incrementCounter.bind(this);
		this.buttonCharBz.src = char_desc_bz;
		this.buttonCharVentail = new Image();
		this.totalImages++;
		this.buttonCharVentail.onload = this.incrementCounter.bind(this);
		this.buttonCharVentail.src = char_desc_ventail;
		this.buttonCharRaiven = new Image();
		this.totalImages++;
		this.buttonCharRaiven.onload = this.incrementCounter.bind(this);
		this.buttonCharRaiven.src = char_desc_raiven;
		this.buttonModeMaster = new Image();
		this.totalImages++;
		this.buttonModeMaster.onload = this.incrementCounter.bind(this);
		this.buttonModeMaster.src = button_mode_master;
		this.buttonModeRegular = new Image();
		this.totalImages++;
		this.buttonModeRegular.onload = this.incrementCounter.bind(this);
		this.buttonModeRegular.src = button_mode_regular;
		this.buttonModeSingle = new Image();
		this.totalImages++;
		this.buttonModeSingle.onload = this.incrementCounter.bind(this);
		this.buttonModeSingle.src = button_mode_singleplayer;
		this.buttonPaddleSmall = new Image();
		this.totalImages++;
		this.buttonPaddleSmall.onload = this.incrementCounter.bind(this);
		this.buttonPaddleSmall.src = small_paddle;
		this.buttonPaddleRegular = new Image();
		this.totalImages++;
		this.buttonPaddleRegular.onload = this.incrementCounter.bind(this);
		this.buttonPaddleRegular.src = regular_paddle;
		this.buttonPaddleBig = new Image();
		this.totalImages++;
		this.buttonPaddleBig.onload = this.incrementCounter.bind(this);
		this.buttonPaddleBig.src = big_paddle;
		this.buttonStart = new Image();
		this.totalImages++;
		this.buttonStart.onload = this.incrementCounter.bind(this);
		this.buttonStart.src = button_start;
		this.paddleVentailS = new Image();
		this.totalImages++;
		this.paddleVentailS.onload = this.incrementCounter.bind(this);
		this.paddleVentailS.src = paddle_ventail_s;
		this.paddleVentailM = new Image();
		this.totalImages++;
		this.paddleVentailM.onload = this.incrementCounter.bind(this);
		this.paddleVentailM.src = paddle_ventail_m;
		this.paddleVentailL = new Image();
		this.totalImages++;
		this.paddleVentailL.onload = this.incrementCounter.bind(this);
		this.paddleVentailL.src = paddle_ventail_l;
		this.paddleBzS = new Image();
		this.totalImages++;
		this.paddleBzS.onload = this.incrementCounter.bind(this);
		this.paddleBzS.src = paddle_bz_s;
		this.paddleBzM = new Image();
		this.totalImages++;
		this.paddleBzM.onload = this.incrementCounter.bind(this);
		this.paddleBzM.src = paddle_bz_m;
		this.paddleBzL = new Image();
		this.totalImages++;
		this.paddleBzL.onload = this.incrementCounter.bind(this);
		this.paddleBzL.src = paddle_bz_l;
		this.paddleRaivenS = new Image();
		this.totalImages++;
		this.paddleRaivenS.onload = this.incrementCounter.bind(this);
		this.paddleRaivenS.src = paddle_raiven_s;
		this.paddleRaivenM = new Image();
		this.totalImages++;
		this.paddleRaivenM.onload = this.incrementCounter.bind(this);
		this.paddleRaivenM.src = paddle_raiven_m;
		this.paddleRaivenL = new Image();
		this.totalImages++;
		this.paddleRaivenL.onload = this.incrementCounter.bind(this);
		this.paddleRaivenL.src = paddle_raiven_l;
		this.iceBlock = new Image();
		this.totalImages++;
		this.iceBlock.onload = this.incrementCounter.bind(this);
		this.iceBlock.src = ice_block;
		this.left_bar = new Image();
		this.totalImages++;
		this.left_bar.onload = this.incrementCounter.bind(this);
		this.left_bar.src = left_empty;
		this.mid_bar = new Image();
		this.totalImages++;
		this.mid_bar.onload = this.incrementCounter.bind(this);
		this.mid_bar.src = mid_empty;
		this.right_bar = new Image();
		this.totalImages++;
		this.right_bar.onload = this.incrementCounter.bind(this);
		this.right_bar.src = right_empty;
		this.left_health = new Image();
		this.totalImages++;
		this.left_health.onload = this.incrementCounter.bind(this);
		this.left_health.src = left_full;
		this.mid_health = new Image();
		this.totalImages++;
		this.mid_health.onload = this.incrementCounter.bind(this);
		this.mid_health.src = mid_full;
		this.right_health = new Image();
		this.totalImages++;
		this.right_health.onload = this.incrementCounter.bind(this);
		this.right_health.src = right_full;
		this.iconBackground = new Image();
		this.totalImages++;
		this.iconBackground.onload = this.incrementCounter.bind(this);
		this.iconBackground.src = icon_Background;
		this.icon = new Image();
		this.totalImages++;
		this.icon.onload = this.incrementCounter.bind(this);
		this.icon.src = icon_Symbol;
		this.healthText = new Image();
		this.totalImages++;
		this.healthText.onload = this.incrementCounter.bind(this);
		this.healthText.src = health_text;
		this.logo = new Image();
		this.totalImages++;
		this.logo.onload = this.incrementCounter.bind(this);
		this.logo.src = masterLogo;
		this.SubZeroSpecial = new Image();
		this.totalImages++;
		this.SubZeroSpecial.onload = this.incrementCounter.bind(this);
		this.SubZeroSpecial.src = SubZeroSpecialImage;
		this.RaidenSpecial = new Image();
		this.totalImages++;
		this.RaidenSpecial.onload = this.incrementCounter.bind(this);
		this.RaidenSpecial.src = RaidenSpecialImage;
		this.ScorpionSpecial = new Image();
		this.totalImages++;
		this.ScorpionSpecial.onload = this.incrementCounter.bind(this);
		this.ScorpionSpecial.src = ScorpionSpecialImage;
		this.MirageAbility = new Image();
		this.totalImages++;
		this.MirageAbility.onload = this.incrementCounter.bind(this);
		this.MirageAbility.src = MirageAbilityImage;
		this.FreezeAbility = new Image();
		this.totalImages++;
		this.FreezeAbility.onload = this.incrementCounter.bind(this);
		this.FreezeAbility.src = FreezeAbilityImage;
		this.BiggerBallAbility = new Image();
		this.totalImages++;
		this.BiggerBallAbility.onload = this.incrementCounter.bind(this);
		this.BiggerBallAbility.src = BiggerBallAbilityImage;
		this.SmallerBallAbility = new Image();
		this.totalImages++;
		this.SmallerBallAbility.onload = this.incrementCounter.bind(this);
		this.SmallerBallAbility.src = SmallerBallAbilityImage;
		this.SoundGrenadeAbility = new Image();
		this.totalImages++;
		this.SoundGrenadeAbility.onload = this.incrementCounter.bind(this);
		this.SoundGrenadeAbility.src = SoundGrenadeAbilityImage;
		this.ImageLoader = this.importAll(require.context('../../images/loadscreen/rotate', false, /\.(png|jpe?g|svg)$/));
		this.ImageLoader.forEach((image: any) => {
			this.totalImages++;
			this.YinYangRotate.push(new Image());
			this.YinYangRotate[this.YinYangRotate.length - 1].onload = this.incrementCounter.bind(this);
			this.YinYangRotate[this.YinYangRotate.length - 1].src = image;
		});
		this.ImageLoader = this.importAll(require.context('../../images/loadscreen/end', false, /\.(png|jpe?g|svg)$/));
		this.ImageLoader.forEach((image: any) => {
			this.totalImages++;
			this.YinYangEnd.push(new Image());
			this.YinYangEnd[this.YinYangEnd.length - 1].onload = this.incrementCounter.bind(this);
			this.YinYangEnd[this.YinYangEnd.length - 1].src = image;
		});
		this.ImageLoader = this.importAll(require.context('../../images/cd', false, /\.(png|jpe?g|svg)$/));
		this.ImageLoader.forEach((image: any) => {
			this.totalImages++;
			this.Cooldown.push(new Image());
			this.Cooldown[this.Cooldown.length - 1].onload = this.incrementCounter.bind(this);
			this.Cooldown[this.Cooldown.length - 1].src = image;
		});
		console.log("yinyangrotate length: " + this.YinYangRotate.length);
		console.log("yinyangend length: " + this.YinYangEnd.length);
		console.log("cooldown length: " + this.Cooldown.length);
	}
}