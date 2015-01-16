/*初始化canvas，标准尺寸:640*1024 = 5:8，放在屏幕中间，上下填充满*/
var SCREEN_WIDTH=document.documentElement.clientWidth;//屏幕宽度高度
var SCREEN_HEIGHT=document.documentElement.clientHeight;
var WIDTH = SCREEN_HEIGHT*5/8;
var HEIGHT = SCREEN_HEIGHT;
$('body').prepend('<canvas id="canv" tabindex="0" style="position:absolute;left:'+(SCREEN_WIDTH-WIDTH)/2+'px;top:0px;" width='+WIDTH+'px height='+HEIGHT+'px>请换个浏览器。。</canvas>');
var ctx=$('#canv')[0].getContext('2d');

/*数学计算函数*/
var cos=Math.cos, sin=Math.sin, random=Math.random, PI=Math.PI, abs=Math.abs, atan2=Math.atan2, round=Math.round, floor=Math.floor, sqrt=Math.sqrt;
	
function cube(x)//平方
{
	return x*x;
}

function rad(d)//角度-->弧度
{
	return d/180*PI;
}

function xy(u)//转极坐标为直角坐标
{
	return {x:u.r*cos(u.t), y:u.r*sin(u.t)};
}

function dis2(x1,y1,x2,y2)//距离的平方
{
	return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}

function ran(a,b)//生成[a, b)的随机实数
{
	return a+(b-a)*random();
}

function ranInt(a,b)//生成[a, b]的随机整数
{
	return floor(a+(b-a+1)*random());
}

function min(a,b)
{
	return a>b?b:a;
}

/*全局变量*/
var THEME;
var BACKGROUND_IMAGE = new Image();
var SOURCE_IMAGE = new Image();
var DOODLE_IMAGE = {
	l: new Image(),
	ls: new Image(),
	r: new Image(),
	rs: new Image(),
	u: new Image(),
	us: new Image()
};
var DOODLE = {
	x: WIDTH/2,
	y: HEIGHT/2-90*HEIGHT / 1024,
	vx: 0,
	vy: 0,
	ax: 0,
	ay: -0.29,
	status: 'l',
	hidden: false
};
var PLATFORM = [];
var TIMER;
var CLOCK;
var FPS;
var SIZE;//缩放比例 = HEIGHT / 1024

function init()
{
	changeTheme('lik');
	FPS = 60;
	CLOCK = 0;
	SIZE = HEIGHT / 1024;
	PLATFORM.push({x:WIDTH/2,y:HEIGHT/8,t:'std',frame:0});
	PLATFORM.push({x:WIDTH/2-90,y:HEIGHT/8+2,t:'std',frame:0});
	PLATFORM.push({x:WIDTH/2+90,y:HEIGHT/8+4,t:'std',frame:0});
	PLATFORM.push({x:WIDTH/2+180,y:HEIGHT/8-2,t:'std',frame:0});
	PLATFORM.push({x:WIDTH/2-180,y:HEIGHT/8,t:'std',frame:0});
}
/*字符串*/

/*绘图函数*/
//图像裁剪方法:drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth, destHeight)
function drawBackground()
{
	ctx.drawImage(BACKGROUND_IMAGE, 0, 0, WIDTH, HEIGHT);
}

function drawDoodle()//脚下中心点为基准
{
	if (!DOODLE.hidden)
	{
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2, HEIGHT-DOODLE.y-120*SIZE, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2+WIDTH, HEIGHT-DOODLE.y-120*SIZE, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2-WIDTH, HEIGHT-DOODLE.y-120*SIZE, 124*SIZE, 120*SIZE);
	}
}

function drawOnePlatForm(p)//上中心点为基准
{
	with(p)
	{
		ctx.drawImage(SOURCE_IMAGE, 1, 2, 117, 32 , x-116*SIZE/2, HEIGHT-y-2, 116*SIZE, 30*SIZE);
	}
}

function drawPlatForms()//1,117,2,32
{
	for (p in PLATFORM)
	{
		drawOnePlatForm(PLATFORM[p]);
	}
}

function drawAll()
{
	drawBackground();
	drawPlatForms();
	drawDoodle();
}

/*计算位置、移动等*/
function changeDoodlePosition()
{
	with(DOODLE)
	{
		vx += ax;
		vy += ay;
		x += vx;
		y += vy;
		if (x<0) x += WIDTH;
		if (x>WIDTH) x -= WIDTH;

		var u = HEIGHT/8;
		if (y<u) {
			y=2*u-y;
			vy = -vy;
		}
		//if (ran(0,1)<0.01||abs(vx)>5) ax*=-1;

		var t = ['l','ls','r','rs','u','us'];
		if (vx>0) status = 'r';
		if (vx<0) status = 'l';;
	}
}

function computeNextFrame()
{
	changeDoodlePosition();
}

/*主题相关*/
function changeTheme(theme)
{
	THEME = theme;
	var sr = 'img/' + THEME +'/';
	BACKGROUND_IMAGE.src = sr + 'bg.png';
	SOURCE_IMAGE.src = sr + 'src.png';
	with(DOODLE_IMAGE) {
		l.src = sr + 'l.png';
		ls.src = sr + 'ls.png';
		r.src = sr + 'r.png';
		rs.src = sr + 'rs.png';
		u.src = sr + 'u.png';
		us.src = sr + 'us.png';
	}
}

/*事件*/
function pressLeft()
{

	DOODLE.vx = -5;
}

function pressRight()
{
	DOODLE.vx = 5;
}

function upLeft()
{
	DOODLE.vx = 0;
}

function upRight()
{
	DOODLE.vx = 0;
}

function addEvent()
{
	document.addEventListener('keydown',function(e)//按下键盘
	{
		console.log(e.keyCode);
		switch(e.keyCode)
		{
		case 37: pressLeft();break;
		case 39: pressRight();break;
		}
	});
	document.addEventListener('keyup',function(e)//按下键盘
	{
		console.log(e.keyCode);
		switch(e.keyCode)
		{
		case 37: upLeft();break;
		case 39: upRight();break;
		}
	});
}

function addTimer()
{
	TIMER = setInterval(function(){
		CLOCK ++;
		drawAll();
		if (CLOCK % 1 == 0) computeNextFrame();
	}, 1000/FPS);
}

/*运行游戏*/
function runNewGame()
{
	init();
	addEvent();
	addTimer();
}

runNewGame();