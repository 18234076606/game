//游戏人物
function Person(canvas,cobj,runImg,jumpImg){
	this.x = 0;
    this.y = 0;
	this.width=106;	//人物矩形大小，也就是图片的大小，按照一定比例缩放
	this.height=80;
	this.canvas=canvas;
	this.cobj=cobj;
	this.runImg=runImg;
	this.jumpImg=jumpImg;
	this.status="runImg";	//设置人物状态
	this.state=0;	//从数组里面获取值，改变图片，实现视觉动效	
}
Person.prototype={
	draw:function(){
		this.cobj.save();
        this.cobj.translate(this.x, this.y);
		//九个参数
		this.cobj.drawImage(this[this.status][this.state],0,0,640,480,0,0,this.width,this.height);
		this.cobj.restore();
	},
	update:function(num,speed){
		if(this.status=="runImg"){
            this.state=num%15;
       }else{
            this.state=0;
        }
		this.x+=speed;
		if(this.x>this.canvas.width/4){
            this.x=this.canvas.width/4;
       }
	},
	jump:function(){
		var that = this;
        var flag=true;//加开关
        //触摸事件
        touch.on(this.canvas,"touchstart",function(){
            if(!flag){	
                return;
            }
            flag=false;
            var inita=0;
            var speeda=10;
            var currenty=that.y;//设置当前的y值
            var r=150;
            that.status="jumpImg";//更改状态
            that.state=0;
            var t=setInterval(function(){
                inita+=speeda;
                if(inita>=180){
                    that.status="runImg";	//跳跃完毕变成跑的状态
                    clearInterval(t);	//清除事件函数
                    that.y=currenty;	//恢复到跳跃前的状态
                    flag=true;	//开启开关
                }else{
                    that.y=currenty-Math.sin(inita*Math.PI/180)*r;
                }
            },50)
        })
	}
}
//游戏障碍物	564*400
function Hinder(canvas,cobj,hinderImg){
	this.x=0;
	this.y=0;
	this.canvas=canvas;
	this.cobj=cobj;
	this.width=56;
	this.height=40;
	this.hinderImg=hinderImg;
	this.state=0;	
}
Hinder.prototype={
	draw:function(){
		var cobj=this.cobj;
		cobj.save();
		cobj.translate(this.x,this.y);
		cobj.drawImage(this.hinderImg[this.state],0,0,564,400,0,0,this.width,this.height)
		cobj.restore();
	},
	//障碍物的运动方式
	update:function(speed){
        this.x-=speed;
	}
}
//粒子动画
function lizi(canvas,cobj,x,y){
    this.x=x;
    this.y=y;
    this.canvas=canvas;
    this.cobj=cobj;
    this.r=2+2*Math.random();
    this.speedx=8*Math.random()-4;
    this.speedy=8*Math.random()-4;
    this.color="red";
    this.speedl=0.3;
}
lizi.prototype={
    draw:function(){
        this.cobj.save();
        this.cobj.translate(this.x,this.y);
        this.cobj.fillStyle=this.color;
        this.cobj.beginPath();
        this.cobj.arc(0,0,this.r,0,2*Math.PI);
        this.cobj.fill();
        this.cobj.restore();
    },
    animate:function(){
        this.x+=this.speedx;
        this.y+=this.speedy;
        this.r-=this.speedl;
    }
}
	//模拟掉血
function xue(canvas,cobj,x,y){
    var arr=[];
    for(var i=0;i<20;i++){
        arr.push(new lizi(canvas,cobj,x,y));
    }
    var t=setInterval(function(){
        for(var i=0;i<arr.length;i++){
            arr[i].draw();
            arr[i].animate();
            if(arr[i].r<0){
                arr.splice(i,1);
            }
        }
        if(arr.length<1){
            clearInterval(t);
        }
    },50)
}

//游戏
function Game(canvas,cobj,runImg,jumpImg,hinderImg){
	this.canvas=canvas;
    this.hinderimg=hinderImg;
    this.cobj = cobj;
    this.speed = 8;
    this.person = new Person(canvas, cobj, runImg, jumpImg);
    this.hinderArr=[];
    this.score=0;	//分数
    this.currentscore=0;	//当前分数
    this.life=3;	//生命值
    this.step=2;	//关卡
}
Game.prototype={
	play:function(){
        var that = this;
        var back = 0;
        var personNum=0;
        var times=0;	//设置障碍物出现
        var randtime=Math.floor(3+6*Math.random())*1000;
        that.person.jump();
        var fenshu=document.querySelector(".currentscore span");
        var shengming=document.querySelector(".leftNum span");
        console.log(shengming)
        setInterval(function (){        	
        	back-=that.speed;
        	personNum++;
        	times+=50;	
            that.cobj.clearRect(0, 0, that.canvas.width, that.canvas.height);
            //随机一个事件，时间不同，障碍物出现间隔，更真实
            if(times%randtime==0){
            	//重新获取值
        		randtime=Math.floor(3+6*Math.random())*1000;
            	var hidnderObj=new Hinder(that.canvas, that.cobj, that.hinderimg);
            	//改变state的值，随机获取一张障碍物的图片
            	hidnderObj.state=Math.floor(Math.random()*that.hinderimg.length);
            	//设置障碍物的位置
            	hidnderObj.y=that.canvas.height-hidnderObj.height;
            	hidnderObj.x=that.canvas.width;
            	that.hinderArr.push(hidnderObj);
            	if(that.hinderArr.length>9){
                    that.hinderArr.shift();
                }
            }           
            for(var i=0;i<that.hinderArr.length;i++){
            	//循环的绘制障碍物
                that.hinderArr[i].draw();
                that.hinderArr[i].update(that.speed);
                //碰撞函数
                if(hitPix(that.canvas,that.cobj,that.person,that.hinderArr[i])){
                	//设置血块的位置
					xue(that.canvas,that.cobj,that.person.x+that.person.width/1.5,that.person.y+that.person.height/5);
					//同一个物体碰撞一次即可
                    if(!that.hinderArr[i].hits){	//如果当前的这么没有碰撞属性
                        that.life--;//如果碰撞，生命-1
                        if(that.life<0){
                            alert("game over!");
                            location.reload();
                        }
                        shengming.innerHTML=that.life;
                        //碰撞之后添加一个hits属性
                        that.hinderArr[i].hits="hits";  
                    }                
                }
                //没有碰撞的情况
                				if(that.hinderArr[i].x+that.hinderArr[i].width<that.person.x&&!that.hinderArr[i].hits){
					if(!that.hinderArr[i].score) {
                        ++that.score;
                        ++that.currentscore;	//当前分数
                        if(that.currentscore%that.step==0){
                            that.step=that.currentscore*2;	//关卡
                            that.currentscore=0;
                            that.speed+=2;
                        }
                        that.hinderArr[i].score="true";
                        fenshu.innerHTML=that.score;
                    }
                }
            }
            //改变state的值，获取不同的图片			
            that.person.draw();
            that.person.update(personNum,that.speed);           
			that.canvas.style.backgroundPositionX=back+"px";
        },50)
        return that.currentscore;
	}
}