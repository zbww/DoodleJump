// 这写的都是啥=。=

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

function cos_gizagiza(i)
{
	if (i%2<1)
		return 2*(i%1)-1;
	else
		return 1-2*(i%1);
}

/*全局变量*/
var THEME;								//string, 主题的文件夹名
var BACKGROUND_IMAGE = new Image();		//背景图片
var SOURCE_IMAGE = new Image();			//各个platform、妖怪等的图片
var BOTTOM_IMAGE = new Image();			//底部装饰图片
var HEAD_IMAGE = new Image();			//顶部计分图片
var BULLET_IMAGE = new Image();
var LOADING_IMAGE = new Image();
var TITLE_IMAGE = new Image();
var DOODLE_IMAGE = {					//doodle的图片，分为各个动作
	l: new Image(),
	ls: new Image(),
	r: new Image(),
	rs: new Image(),
	u: new Image(),
	us: new Image()
};
var DOODLE;
var TITLE_Y;
var PLATFORM = [];						//当前的platform的状态数组，内含多个对象，每个platform的属性包括位置、类型、帧(用于控制动画)
var PLATFORM_ID;
var NEXT_DISTANCE;
var BULLET = [];						//Bullet状态数组，对象属性为子弹位置、frame、speed
var MOUSEX;								//鼠标横坐标
var MOUSEY;								//鼠标纵坐标
var PLAT;								//当前doodle会降落的plat序号
var SCORE;								//分数
var TIMER = 0;								//定时器
var CLOCK;								//全局计数器
var FPS;								//帧率
var SIZE;								//缩放比例 = HEIGHT / 1024，每个绘制对象的大小都要乘上这个
var IMAGE_LOADED;
var THEMES = ['bunny','doodlestein','ghost','ice','jungle','lik','ninja','snow','soccer','space','underwater'];
										//各个主题的文件夹名
var PLATFORM_TYPE = ['std','movex','movey','burn','hide','break'];
var SOUND_NAME = ['jump','lomise','explodingplatform','explodingplatform2','pucanje','pucanje2','pada'];


function init(changetheme)
{
	console.log('init', changetheme);
//	LOADING_IMAGE.src = 'img/loading.png';
//	ctx.drawImage(LOADING_IMAGE,WIDTH/2-LOADING_IMAGE.width/2,HEIGHT/2-LOADING_IMAGE.height/2);
	ctx.font = '20px sans-serif';
	ctx.fillText(IMAGE_LOADED + '/' + 12 + ' loading, please wait...',100,HEIGHT/2);
	loadSound();
	IMAGE_LOADED = 0;
	if (changetheme) changeTheme(THEMES[ranInt(0,THEMES.length-1)]);
	FPS = 60;
	if (TIMER) clearInterval(TIMER);
	TIMER = 0;
	CLOCK = 0;
	SCORE = 0;
	TITLE_Y = 0;
	PLATFORM_ID = -1;
	NEXT_DISTANCE = getNextDistance();
	PLAT = createPlatform(-1000,-1000,'break',0,0);
	MOUSEX = SCREEN_WIDTH/2;
	SIZE = HEIGHT / 1024;
	DOODLE = {							//doodle的状态，包括位置、速度、加速度、面部朝向、是否隐藏
		x: WIDTH/2,
		y: HEIGHT/2-90*HEIGHT / 1024,
		vx: 0,
		vy: 0,
		ax: 0,
		ay: 0,
		status: 'r',
		hidden: false,
		died: false
	};
	DOODLE.ay=-((HEIGHT*3/8-90*HEIGHT/1024)/((60*FPS/46/2)*(60*FPS/46/2)/2)),
	PLATFORM = [];

	PLATFORM.push(createPlatform(WIDTH/2,HEIGHT/8,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2-85*HEIGHT/703,HEIGHT/8+2*HEIGHT/703,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2+85*HEIGHT/703,HEIGHT/8+4*HEIGHT/703,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2+170*HEIGHT/703,HEIGHT/8-2*HEIGHT/703,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2+-170*HEIGHT/703,HEIGHT/8,'std',0,0));
	// PLATFORM.push(createPlatform(WIDTH/2+ranInt(-170,170)*HEIGHT/703,HEIGHT/8*3,'std',0,0));
	// PLATFORM.push(createPlatform(WIDTH/2+ranInt(-170,170)*HEIGHT/703,HEIGHT/8*5,'std',0,0));
	// PLATFORM.push(createPlatform(WIDTH/2+ranInt(-170,170)*HEIGHT/703,HEIGHT/8*7,'std',0,0));
	createRandomPlatform();
}

/*绘图函数*/
//图像裁剪方法:drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth, destHeight)
function drawBackground()
{
	ctx.drawImage(BACKGROUND_IMAGE, 0, 0, WIDTH, HEIGHT);
	ctx.drawImage(TITLE_IMAGE, WIDTH/2-TITLE_IMAGE.width/2*SIZE,TITLE_Y+HEIGHT/3-TITLE_IMAGE.height/2*SIZE,412*SIZE*0.8,100*SIZE*0.8);
}

function drawDoodle()//脚下中心点为基准
{
	if (!DOODLE.hidden)
	{
		if (DOODLE.vy > 6*SIZE)
		{
			if (DOODLE.status.length==1)
				DOODLE.status+='s';
		}
		else
			DOODLE.status = DOODLE.status[0];
		var offset = DOODLE.status.length==1?8*SIZE:0;
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2, HEIGHT-DOODLE.y-120*SIZE+offset, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2+WIDTH, HEIGHT-DOODLE.y-120*SIZE+offset, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2-WIDTH, HEIGHT-DOODLE.y-120*SIZE+offset, 124*SIZE, 120*SIZE);
	}
	if (DOODLE.y < -30*SIZE)
	{
		doodleDie();
	}
}

function drawOnePlatForm(p)//上中心点为基准
{
	with(p)
	{
		if (t=='movex' || t=='break'&&speed>180)
			x = WIDTH/2 + (WIDTH/2-116*SIZE/2)*cos_gizagiza(CLOCK/speed);
		if (t=='movey')
			if ((CLOCK + (speed-80)/160*400)% 400 < 200)
				y -= 1;
			else
				y += 1;
		if (f) f++;
		if (t == 'std') 	ctx.drawImage(SOURCE_IMAGE, 1, 2, 116, 30 , x-116*SIZE/2, HEIGHT-y-2*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 30*SIZE);
		if (t == 'movex') 	ctx.drawImage(SOURCE_IMAGE, 1, 35, 116, 34 , x-116*SIZE/2, HEIGHT-y-3*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 34*SIZE);		
		if (t == 'movey') 	ctx.drawImage(SOURCE_IMAGE, 1, 71, 116, 34 , x-116*SIZE/2, HEIGHT-y-3*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 34*SIZE);
		if (t == 'hide') 	ctx.drawImage(SOURCE_IMAGE, 1, 108, 116, 34 , x-116*SIZE/2, HEIGHT-y-2*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 34*SIZE);
		if (t == 'break') 	
		{
			var x0=1,y0=145,w0=124,h0=33;
			switch (f)
			{
			case 0: break;
			case 1: case 2: case 3: y-=4; y0=182; h0=43; break;
			case 4: case 5: case 6: y-=4; y0=230; h0=58; break;
			default: y-=4; y0=297; h0=66; break;
			}
			ctx.drawImage(SOURCE_IMAGE, x0, y0, w0, h0, x-w0*SIZE/2, HEIGHT-y-3*HEIGHT/703/*平台像素的偏移*/, w0*SIZE, h0*SIZE);
		}
		if (t == 'burn') 	
		{
			if (!f&&y<=(speed-80)*5*SIZE)
				f++;
			var x0=1,y0=367,w0=116,h0=32;
			if (f>=2&&f<5) y0=403;
			if (f>=5&&f<8) y0=440;
			if (f>=8&&f<11) y0=476;
			if (f>=11&&f<77) y0=512;
			if (f==77) playSound('explodingplatform'+(random()<0.5?'':'2'));
			if (f>=77&&f<80) y0=550;
			if (f>=80&&f<83) {y0=597;h0=40;w0=123;}
			if (f>=83) {y0=648;h0=53;w0=123;}	
			if (f<86)
				ctx.drawImage(SOURCE_IMAGE, x0, y0, w0, h0 , x-w0*SIZE/2, HEIGHT-y-2*HEIGHT/703/*平台像素的偏移*/, w0*SIZE, h0*SIZE);
			else
			{
				y=-1000;
			}
		}
		
	}
}

function drawPlatForms()//1,117,2,32
{
	for (var i in PLATFORM)
	{
		if (PLATFORM[i].y>0&&PLATFORM[i].y<HEIGHT+50)
		drawOnePlatForm(PLATFORM[i]);
	}
	for (var i = PLATFORM.length-1; i>=0; i--)
	{
		if (PLATFORM[i].y<0)
			PLATFORM.splice(i,1);
	}
}

function drawOneBullet(p)
{
	ctx.drawImage(BULLET_IMAGE,0,0,22,22,p.x,HEIGHT-p.y-130*SIZE,22*SIZE,22*SIZE);
}

function drawBullets()
{
	for (var p in BULLET)
	{
		drawOneBullet(BULLET[p]);
	}
	for (var i = BULLET.length-1; i>=0; i--)
	{
		if (BULLET[i].y>10000)
			BULLET.splice(i,1);
	}
}

function drawBottom()
{
	ctx.drawImage(BOTTOM_IMAGE, 0, HEIGHT - SIZE*BOTTOM_IMAGE.height, SIZE*BOTTOM_IMAGE.width, SIZE*BOTTOM_IMAGE.height);
}

function drawHead()
{
	ctx.drawImage(HEAD_IMAGE, 0,0,640,128,0,-60*SIZE,640*SIZE,128*SIZE);
}

function drawScore()//     38 84
{
	var u = [640, 660, 694, 723, 749, 781, 812, 842, 872, 898, 930];
	var t = floor(SCORE) + '';//SCORE
	var offset = 0;
	for (i in t)
	{
		var s = t[i]-'0';
		if (s==0) s+=10;
		ctx.drawImage(HEAD_IMAGE,u[s-1],38,u[s]-u[s-1],46,(30+offset/1.3)*SIZE,5*SIZE,(u[s]-u[s-1])/1.3*SIZE,46/1.3*SIZE);
		offset += u[s]-u[s-1];
	}
}

function drawAll()
{
	drawBackground();
	drawPlatForms();
	drawDoodle();
	drawBullets();
	drawBottom();
	drawHead();
	drawScore();
	
	//以下测试用
	/*
	ctx.moveTo(0,HEIGHT/2+90*HEIGHT / 1024);
	ctx.lineTo(10000,HEIGHT/2+90*HEIGHT / 1024);
	ctx.moveTo(0,HEIGHT/2);
	ctx.lineTo(10000,HEIGHT/2);
	ctx.moveTo(0,HEIGHT*7/8);
	ctx.lineTo(10000,HEIGHT*7/8);
	*/
	/*
	ctx.lineTo(ranInt(0,WIDTH),ranInt(0,HEIGHT));
	ctx.stroke();
	*/	
	/*
	var yy = HEIGHT-MOUSEY;
	if (yy>HEIGHT/2-90*HEIGHT / 1024) yy = HEIGHT/8;
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+90*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+180*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+270*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+360*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-90*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-180*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-270*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-360*HEIGHT/703,y:yy,t:'std'});
	*/
}

function getNextDistance() {
	// SCORE越低，返回值越低
	// 最大值是HEIGHT / 4
	// 30000->均值达到m
	// 初始: 0

	var m = HEIGHT / 4;
	var m_ = HEIGHT / 20;
	var d = m * SCORE / 30000;
	d += Math.random() * m_ * 0.8;

	if (d > m) d = m;
	if (d < m_) d = m_;
	return d;
}

/*计算位置、移动等*/
function findPlat()
{
	var x = DOODLE.x;
	var y = DOODLE.y;
	while (x < 0) x += WIDTH;
	while (x > WIDTH) x -= WIDTH;
	var maxy = -1000;
	var maxyt = -1;
	for (var i in PLATFORM)
	{
		if (abs(x-PLATFORM[i].x)<60*HEIGHT/703&&PLATFORM[i].y<y+3&&PLATFORM[i].y>maxy)
		{
			maxy=PLATFORM[i].y;
			maxyt=i;
		}
	}
	PLAT.y = maxy;
	PLAT.id = maxy==-1000?0:PLATFORM[maxyt].id;
}

function createRandomPlatform() {
	while (true) {
		if (PLATFORM[PLATFORM.length - 1].y > HEIGHT * 2) return;
		var y = PLATFORM[PLATFORM.length - 1].y + NEXT_DISTANCE;
		var x = WIDTH/2+ranInt(-170,170)*HEIGHT/703;
		var p = createPlatform(x, y, PLATFORM_TYPE[ranInt(0,5)],ran(80,260),0);
		PLATFORM.push(p);
		NEXT_DISTANCE = getNextDistance();
	}
}

function createPlatform(x,y,type,speed,frame)
{
	PLATFORM_ID++;
	return {id:PLATFORM_ID,x:x,y:y,t:type,speed:speed,f:frame};
}

function createBullet(x,y)
{
	BULLET.push({x:x,y:y,speed:25,frame:0});
}

function changeBulletPosition()
{
	for (var p in BULLET)
	{
		BULLET[p].y += BULLET[p].speed;
		BULLET[p].frame++;
		BULLET[p].frame%=8; 
	}
}

function doodleReflect(posy)
{
	with(DOODLE)
	{
		y=posy;
		vy = sqrt((HEIGHT*3/8-90*HEIGHT/1024)*2*(-DOODLE.ay));//*(ran(0,1)<0.2?3:1)*(ran(0,1)<0.02?200:1));//*1.732;
	//	console.log(vy);
	}
}

function hitPlatform(id)
{
	for (var p in PLATFORM)
	{
		if (PLATFORM[p].id==id) // TODO
		{
			with(PLATFORM[p])//'std','movex','movey','burn','hide','break'
			{
				//console.log(id);
				if (t == 'break')
				{
					playSound('lomise');
					f++;
					return;
				}
				doodleReflect(y);
				playSound('jump');
				if (t == 'hide')
				{
					y=-1000;//PLATFORM.splice(p,1);
					return;
				}
				if (t == 'burn')
				{
					f++;
					return;
				}
			}
			return;
		}
	}
}

function doodleDie()
{
	if (!DOODLE.died)
	{
		DOODLE.died=true;
		playSound('pada');
	}
}

function rollScreen(posy)
{
	var u = DOODLE.y - posy;//所有元素都向下移动u个像素
	DOODLE.y -= u;
	TITLE_Y += u;
	SCORE += u/(HEIGHT*3/8-90*HEIGHT / 1024)*180;

	// if (random()<1/(SCORE/4000))
	// 	PLATFORM.push(createPlatform(WIDTH/2+ran(-229,229)*SIZE,HEIGHT,PLATFORM_TYPE[ranInt(0,5)],ran(80,260),0));

	createRandomPlatform();

	for (var p in PLATFORM)
	{
		PLATFORM[p].y -= u;
	}
	for (var p in BULLET)
	{
		BULLET[p].y -= u;
	}
}

function changeDoodlePosition()//决定使用endless sea小鱼的运动模型...
{
	with(DOODLE)
	{
		var mx = MOUSEX - (SCREEN_WIDTH-WIDTH)/2;
		if (mx > WIDTH * 2) mx = WIDTH * 2;
		if (mx < -WIDTH) mx = -WIDTH;

		var mx_ = mx;
		// while (mx < 0) mx += WIDTH;
		// while (mx > WIDTH) mx -= WIDTH;
		var u1=6;//u1 u2是两个阻尼值
		var u2=80;
	//	if (mx<0) mx += x;
	//	if (mx>WIDTH) mx += x - WIDTH;
		// mx: doodle追赶的目标
		var ax1 = mx - x - vx / u1;
		var ax2 = mx + WIDTH - x - vx / u1;
		var ax3 = mx - WIDTH - x - vx / u1;
		// var t1 = Math.abs(mx - x);
		// var t2 = Math.abs(mx - x + WIDTH);
		// var t3 = Math.abs(mx - x - WIDTH);
		ax = ax1;
		// if (t1 == Math.min(t1, t2, t3)) ax = ax1;
		// if (t2 == Math.min(t1, t2, t3)) ax = ax2;
		// if (t3 == Math.min(t1, t2, t3)) ax = ax3;
		// if (mx_ >= x) {
		// 	ax = (t1 > t2 ? ax2 : ax1);
		// } else {
		// 	ax = (t1 > t3 ? ax3 : ax1);
		// }
		vx += ax;
		if (vx > 700) vx = 700;
		if (vx < -700) vx = -700;
		// console.log(vx);
		x += vx / u2;
		//vx = (mx-WIDTH/2)/15*SIZE;
		//x += vx;
		
		// while (x<0) x += WIDTH;
		// while (x>WIDTH) x -= WIDTH;
	
		vy += ay;
		y += vy;
		var u = PLAT.y;
		if (y<u) 
		{			
			hitPlatform(PLAT.id);
			//doodleReflect(u);
		}


		var v = HEIGHT/2-90*HEIGHT/1024;
		if (y>v)
		{
			rollScreen(v);
		}

		//var t = ['l','ls','r','rs','u','us'];
		if (vx>/*1*/0&&status!='u'&&status!='us') status = 'r';
		if (vx</*-1*/0&&status!='u'&&status!='us') status = 'l';
	}
}

function computeNextFrame()
{
	changeDoodlePosition();
	changeBulletPosition();
}

/*主题相关*/
function changeTheme(theme)
{
	THEME = theme;
	var sr = 'img/' + THEME +'/';
	BACKGROUND_IMAGE.src = sr + 'bg.png';
	SOURCE_IMAGE.src = sr + 'src.png';
	BOTTOM_IMAGE.src = sr + 'bt.png';
	HEAD_IMAGE.src = sr + 'head.png';
	BULLET_IMAGE.src = 'img/bullet.png';
	TITLE_IMAGE.src = 'img/doodlejump.png';
	with(DOODLE_IMAGE) {
		l.src = sr + 'l.png';
		ls.src = sr + 'ls.png';
		r.src = sr + 'r.png';
		rs.src = sr + 'rs.png';
		u.src = sr + 'u.png';
		us.src = sr + 'us.png';
	}
	var count = 12;
	IMAGE_LOADED = 0;
	TITLE_IMAGE.onload=BACKGROUND_IMAGE.onload=SOURCE_IMAGE.onload=BOTTOM_IMAGE.onload=HEAD_IMAGE.onload=BULLET_IMAGE.onload=DOODLE_IMAGE.l.onload=DOODLE_IMAGE.ls.onload=DOODLE_IMAGE.u.onload=DOODLE_IMAGE.us.onload=DOODLE_IMAGE.r.onload=DOODLE_IMAGE.rs.onload=function(){
		IMAGE_LOADED++;
		if (IMAGE_LOADED == count)
			runNewGame();
	}
}

function loadSound()
{
	for (var i in SOUND_NAME)
	{
		var t = SOUND_NAME[i];
		if (!$('#'+t).length)
		{
			$('body').append('<audio id="'+t+'" src="sound/'+t+'.ogg"></audio>');
		}
	}
}
/*事件*/
window.onresize = function()
{
	/*初始化canvas，标准尺寸:640*1024 = 5:8，放在屏幕中间，上下填充满*/
	SCREEN_WIDTH=document.documentElement.clientWidth;//屏幕宽度高度
	SCREEN_HEIGHT=document.documentElement.clientHeight;
	WIDTH = SCREEN_HEIGHT*5/8;
	HEIGHT = SCREEN_HEIGHT;
	$('body').html('');
	$('body').prepend('<canvas id="canv" tabindex="0" style="position:absolute;left:'+(SCREEN_WIDTH-WIDTH)/2+'px;top:0px;" width='+WIDTH+'px height='+HEIGHT+'px>请换个浏览器。。</canvas>');
	ctx=$('#canv')[0].getContext('2d');
	init(false);
}

function addEvent()
{
	document.addEventListener('mousemove',function(e)
	{
		MOUSEX = e.x;
		MOUSEY = e.y;
	});
	document.addEventListener('mousedown',function(e)
	{
		DOODLE.status = 'u';
		createBullet(DOODLE.x,DOODLE.y);
		playSound('pucanje'+(random()<0.5?'':2));
	});
	document.addEventListener('mouseup',function(e)
	{
		DOODLE.status = DOODLE.vx>0?'r':'l';
	});
	document.addEventListener('keyup', function(e) {
		switch (e.code) {
			case 'KeyR':
				restart(e.shiftKey);
				break;
			default:
				console.log(e.code);
		}
	});
}

function addTimer()
{
	TIMER = setInterval(function(){
		CLOCK ++;
		drawAll();
		computeNextFrame();
		findPlat();
	}, 1000/FPS);
}

function playSound(name)
{
	$('#'+name)[0].currentTime=0;
	$('#'+name)[0].play();
}

function restart(changetheme) {
	init(changetheme);
	if (!changetheme) {
		runNewGame();		
	}
}

/*运行游戏*/
function runNewGame()
{
	addEvent();
	addTimer();
}

init(true);
