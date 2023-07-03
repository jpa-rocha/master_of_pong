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
import bz_special from '../../images/Abilities/SubZeroSpecial.png';
import raiven_special from '../../images/Abilities/RaidenSpecial.png';
import ventail_special from '../../images/Abilities/ScorpionSpecial.png';
import mirage_ability from '../../images/Abilities/MirageAbility.png';
import freeze_ability from '../../images/Abilities/FreezeAbility.png';
import big_ball_ability from '../../images/Abilities/BiggerBallAbility.png';
import small_ball_ability from '../../images/Abilities/SmallerBallAbility.png';
import sound_ability from '../../images/Abilities/SoundGrenadeAbility.png';
import homing_ability from '../../images/Abilities/HomingAbility.png';
import deflect_ability from '../../images/Abilities/DeflectAbility.png';
import mountains from '../../images/win/mountains.png';
import cloud1 from '../../images/win/cloud1.png';
import cloud2 from '../../images/win/cloud2.png';
import cloud3 from '../../images/win/cloud3.png';
import lightning1 from '../../images/win/lightning1.png';
import lightning2 from '../../images/win/lightning2.png';
import lightning3 from '../../images/win/lightning3.png';
import lightning4 from '../../images/win/lightning4.png';
import button_menu from '../../images/button_menu.png';

export class Button {
	public name: string;
	public id: number;
	public image: HTMLImageElement | null;
	public icon: HTMLImageElement | null;
	public description: string;
	public isFocused: boolean;
	public selected: boolean;
	public size: {x : number, y : number};
	public coordinates: {x : number, y : number};

	constructor(name: string, id: number, size: {x: number, y: number}, coordinates: {x: number, y: number}, image: HTMLImageElement | null = null, icon: HTMLImageElement | null = null, description: string = "") {
		this.name = name;
		this.id = id;
		this.image = image;
		this.icon = icon;
		this.description = description;
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
	public hyper: boolean;
	public dodge: boolean;

	constructor (gamemode: number, paddle: number, character: number, hyper: boolean, dodge: boolean) {
		this.gameMode = gamemode;
		this.paddle = paddle;
		this.character = character;
		this.hyper = hyper;
		this.dodge = dodge;
	}
}

export class EndScreen {
	public Mountains;
	public Cloud1;
	public Cloud2;
	public Cloud3;
	public Lightning1;
	public Lightning2;
	public Lightning3;
	public Lightning4;
	public c1max = 700;
	public c1min = 200;
	public c1x = 200;
	public c1behind = false;
	public c2max = 800;
	public c2min = 250;
	public c2x = 700;
	public c2behind = true;
	public c3max = 800;
	public c3min = 300;
	public c3x = 800;
	public c3behind = false;
	public lightningCounter = 0;
	public c1LightningActive = false;
	public c2LightningActive = false;
	public c3LightningActive = false;
	public lightningPosition = 0;
	public lightningImage: HTMLImageElement;

	constructor () {
		this.Mountains = new Image();
		this.Mountains.src = mountains;
		this.Cloud1 = new Image();
		this.Cloud1.src = cloud1;
		this.Cloud2 = new Image();
		this.Cloud2.src = cloud2;
		this.Cloud3 = new Image();
		this.Cloud3.src = cloud3;
		this.Lightning1 = new Image();
		this.Lightning1.src = lightning1;
		this.Lightning2 = new Image();
		this.Lightning2.src = lightning2;
		this.Lightning3 = new Image();
		this.Lightning3.src = lightning3;
		this.Lightning4 = new Image();
		this.Lightning4.src = lightning4;
		this.lightningImage = this.Lightning1;
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
	public buttonMenu;
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
	public BelowZeroSpecial;
	public BelowZeroDesc;
	public RaivenSpecial;
	public RaivenDesc;
	public VenomtailSpecial;
	public VenomtailDesc;
	public MirageAbility;
	public FreezeAbility;
	public BiggerBallAbility;
	public SmallerBallAbility;
	public SoundGrenadeAbility;
	public HomingAbility;
	public DeflectAbility;
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
		this.headPaddle.onload = this.incrementCounter;
		this.headPaddle.src = heading_paddle;
		this.headCharacter = new Image();
		this.totalImages++;
		this.headCharacter.onload = this.incrementCounter;
		this.headCharacter.src = heading_character;
		this.headGamemode = new Image();
		this.totalImages++;
		this.headGamemode.onload = this.incrementCounter;
		this.headGamemode.src = heading_gamemode;
		this.buttonCharBz = new Image();
		this.totalImages++;
		this.buttonCharBz.onload = this.incrementCounter;
		this.buttonCharBz.src = char_desc_bz;
		this.buttonCharVentail = new Image();
		this.totalImages++;
		this.buttonCharVentail.onload = this.incrementCounter;
		this.buttonCharVentail.src = char_desc_ventail;
		this.buttonCharRaiven = new Image();
		this.totalImages++;
		this.buttonCharRaiven.onload = this.incrementCounter;
		this.buttonCharRaiven.src = char_desc_raiven;
		this.buttonModeMaster = new Image();
		this.totalImages++;
		this.buttonModeMaster.onload = this.incrementCounter;
		this.buttonModeMaster.src = button_mode_master;
		this.buttonModeRegular = new Image();
		this.totalImages++;
		this.buttonModeRegular.onload = this.incrementCounter;
		this.buttonModeRegular.src = button_mode_regular;
		this.buttonModeSingle = new Image();
		this.totalImages++;
		this.buttonModeSingle.onload = this.incrementCounter;
		this.buttonModeSingle.src = button_mode_singleplayer;
		this.buttonPaddleSmall = new Image();
		this.totalImages++;
		this.buttonPaddleSmall.onload = this.incrementCounter;
		this.buttonPaddleSmall.src = small_paddle;
		this.buttonPaddleRegular = new Image();
		this.totalImages++;
		this.buttonPaddleRegular.onload = this.incrementCounter;
		this.buttonPaddleRegular.src = regular_paddle;
		this.buttonPaddleBig = new Image();
		this.totalImages++;
		this.buttonPaddleBig.onload = this.incrementCounter;
		this.buttonPaddleBig.src = big_paddle;
		this.buttonStart = new Image();
		this.totalImages++;
		this.buttonStart.onload = this.incrementCounter;
		this.buttonStart.src = button_start;
		this.paddleVentailS = new Image();
		this.totalImages++;
		this.paddleVentailS.onload = this.incrementCounter;
		this.paddleVentailS.src = paddle_ventail_s;
		this.paddleVentailM = new Image();
		this.totalImages++;
		this.paddleVentailM.onload = this.incrementCounter;
		this.paddleVentailM.src = paddle_ventail_m;
		this.paddleVentailL = new Image();
		this.totalImages++;
		this.paddleVentailL.onload = this.incrementCounter;
		this.paddleVentailL.src = paddle_ventail_l;
		this.paddleBzS = new Image();
		this.totalImages++;
		this.paddleBzS.onload = this.incrementCounter;
		this.paddleBzS.src = paddle_bz_s;
		this.paddleBzM = new Image();
		this.totalImages++;
		this.paddleBzM.onload = this.incrementCounter;
		this.paddleBzM.src = paddle_bz_m;
		this.paddleBzL = new Image();
		this.totalImages++;
		this.paddleBzL.onload = this.incrementCounter;
		this.paddleBzL.src = paddle_bz_l;
		this.paddleRaivenS = new Image();
		this.totalImages++;
		this.paddleRaivenS.onload = this.incrementCounter;
		this.paddleRaivenS.src = paddle_raiven_s;
		this.paddleRaivenM = new Image();
		this.totalImages++;
		this.paddleRaivenM.onload = this.incrementCounter;
		this.paddleRaivenM.src = paddle_raiven_m;
		this.paddleRaivenL = new Image();
		this.totalImages++;
		this.paddleRaivenL.onload = this.incrementCounter;
		this.paddleRaivenL.src = paddle_raiven_l;
		this.iceBlock = new Image();
		this.totalImages++;
		this.iceBlock.onload = this.incrementCounter;
		this.iceBlock.src = ice_block;
		this.left_bar = new Image();
		this.totalImages++;
		this.left_bar.onload = this.incrementCounter;
		this.left_bar.src = left_empty;
		this.mid_bar = new Image();
		this.totalImages++;
		this.mid_bar.onload = this.incrementCounter;
		this.mid_bar.src = mid_empty;
		this.right_bar = new Image();
		this.totalImages++;
		this.right_bar.onload = this.incrementCounter;
		this.right_bar.src = right_empty;
		this.left_health = new Image();
		this.totalImages++;
		this.left_health.onload = this.incrementCounter;
		this.left_health.src = left_full;
		this.mid_health = new Image();
		this.totalImages++;
		this.mid_health.onload = this.incrementCounter;
		this.mid_health.src = mid_full;
		this.right_health = new Image();
		this.totalImages++;
		this.right_health.onload = this.incrementCounter;
		this.right_health.src = right_full;
		this.iconBackground = new Image();
		this.totalImages++;
		this.iconBackground.onload = this.incrementCounter;
		this.iconBackground.src = icon_Background;
		this.icon = new Image();
		this.totalImages++;
		this.icon.onload = this.incrementCounter;
		this.icon.src = icon_Symbol;
		this.healthText = new Image();
		this.totalImages++;
		this.healthText.onload = this.incrementCounter;
		this.healthText.src = health_text;
		this.logo = new Image();
		this.totalImages++;
		this.logo.onload = this.incrementCounter;
		this.logo.src = masterLogo;
		this.BelowZeroSpecial = new Image();
		this.totalImages++;
		this.BelowZeroSpecial.onload = this.incrementCounter;
		this.BelowZeroSpecial.src = bz_special;
		this.BelowZeroDesc = "Below-Zero freezes his\nopponent in a tomb of ice.";
		this.RaivenSpecial = new Image();
		this.totalImages++;
		this.RaivenSpecial.onload = this.incrementCounter;
		this.RaivenSpecial.src = raiven_special;
		this.RaivenDesc = "Ability description placeholder";
		this.VenomtailSpecial = new Image();
		this.totalImages++;
		this.VenomtailSpecial.onload = this.incrementCounter;
		this.VenomtailSpecial.src = ventail_special;
		this.VenomtailDesc = "Ability description placeholder";
		this.MirageAbility = new Image();
		this.totalImages++;
		this.MirageAbility.onload = this.incrementCounter;
		this.MirageAbility.src = mirage_ability;
		this.FreezeAbility = new Image();
		this.totalImages++;
		this.FreezeAbility.onload = this.incrementCounter;
		this.FreezeAbility.src = freeze_ability;
		this.BiggerBallAbility = new Image();
		this.totalImages++;
		this.BiggerBallAbility.onload = this.incrementCounter;
		this.BiggerBallAbility.src = big_ball_ability;
		this.SmallerBallAbility = new Image();
		this.totalImages++;
		this.SmallerBallAbility.onload = this.incrementCounter;
		this.SmallerBallAbility.src = small_ball_ability;
		this.SoundGrenadeAbility = new Image();
		this.totalImages++;
		this.SoundGrenadeAbility.onload = this.incrementCounter;
		this.SoundGrenadeAbility.src = sound_ability;
		this.HomingAbility = new Image();
		this.totalImages++;
		this.HomingAbility.onload = this.incrementCounter;
		this.HomingAbility.src = homing_ability;
		this.DeflectAbility = new Image();
		this.totalImages++;
		this.DeflectAbility.onload = this.incrementCounter;
		this.DeflectAbility.src = deflect_ability;
		this.ImageLoader = this.importAll(require.context('../../images/loadscreen/rotate', false, /\.(png|jpe?g|svg)$/));
		this.ImageLoader.forEach((image: any) => {
			this.totalImages++;
			this.YinYangRotate.push(new Image());
			this.YinYangRotate[this.YinYangRotate.length - 1].onload = this.incrementCounter;
			this.YinYangRotate[this.YinYangRotate.length - 1].src = image;
		});
		this.ImageLoader = this.importAll(require.context('../../images/loadscreen/end', false, /\.(png|jpe?g|svg)$/));
		this.ImageLoader.forEach((image: any) => {
			this.totalImages++;
			this.YinYangEnd.push(new Image());
			this.YinYangEnd[this.YinYangEnd.length - 1].onload = this.incrementCounter;
			this.YinYangEnd[this.YinYangEnd.length - 1].src = image;
		});
		this.ImageLoader = this.importAll(require.context('../../images/cd', false, /\.(png|jpe?g|svg)$/));
		this.ImageLoader.forEach((image: any) => {
			this.totalImages++;
			this.Cooldown.push(new Image());
			this.Cooldown[this.Cooldown.length - 1].onload = this.incrementCounter;
			this.Cooldown[this.Cooldown.length - 1].src = image;
		});
		this.buttonMenu = new Image();
		this.totalImages++;
		this.buttonMenu.onload = this.incrementCounter;
		this.buttonMenu.src = button_menu;
	}
}