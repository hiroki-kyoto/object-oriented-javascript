//@name: slide.js
//@author: 向超
//@last modified: 2013/4/9

/**********************************************【接口】类定义开始**********************************************/
//define the class: Interface
  	var Interface = function(name, methods){
			if(arguments.length != 2){ 
				throw new Error("Interface constructed with " 
				+ arguments.length + " arguments, expected 2.");
			}
			this.name = name;
			this.methods = [];
			for(var i=0, len=methods.length; i<len; i++){
				if(typeof methods[i] !== "string"){
					throw new Error("Interface constructor require the methods"
					+" to be collection of names as string.");
				}
				this.methods.push(methods[i]);
			}
		};
	//end define
	
	//static class method : ensureImplements
	Interface.ensureImplements = function(classObject, interfaces){
		if(arguments.length!=2){
			throw new Error("Interface method 'ensureImplements' "
			+"expected 2 arguments as (class, interfaces).");
		}
		//check if the args are the instances of Interface:
		for(var i=0, len=interfaces.length; i<len; i++){
			var interf = interfaces[i];
			if(interf.constructor !== Interface){
				throw new Error("Interface.ensureImplements Function expected the "
				+"interfaces argument to be instances of Interface.");
			}
			//check if the functions follow the rules made by Interface:
			for(var j=0, mlen=interf.methods.length; j<mlen; j++){
				var method = interf.methods[j];
				if(!classObject.prototype[method] || typeof classObject.prototype[method] !== "function"){
					throw new Error("Function Interface.ensureImplements: " + classObject.className
					+" does not implement the " + interf.name + " Interface, method " 
					+ method + " was not found.");
				}
			}
		}
	};
/**********************************************【接口】类定义结束**********************************************/


/**********************************【类的定义、单继承、实现接口】类的声明开始******************************/
//constructor
var Class = function(className, superClass, constructor, methods, interfaces){
	if(arguments.length!=5){
		throw new Error("Class constructor expected 5 args.");
	}

	/***************************************实现类的继承【继承方法部分】***************************************/
	function extend(subClass, superClass){
		//judge:
		if(typeof superClass !== "function"){
			throw new Error("super class expected to be function!");
		}
		var F = function(){};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
	
		//add a superClass backup
		subClass.superclass = superClass.prototype;
		if(superClass.prototype.constructor == Object.prototype.constructor){
			superClass.prototype.constructor = superClass;
		}
	}
	/***************************************实现类的继承【继承方法部分】****************************************/

	var _class;

	//build the constructor:
	if(typeof constructor !=="function"){
		throw new Error("Class define error: constructor expected to be function.");
	}
	
	//extend the superclass:
	if(superClass!=null){
		_class = function(args){
			constructor.call(this, args);
			//initial the superclass constructor: 
			_class.superclass.constructor.call(this, args);
		};
		extend(_class, superClass);
	}
	else{
		_class = constructor;
	}
	
	_class.className = className;

	//add private methods to the new Class:
	for(mName in methods){
		_class.prototype[mName] = methods[mName];
	}

	//check interfaces:
	if(interfaces!=null){
		Interface.ensureImplements(_class, interfaces);
	}

	return _class;
};
/**********************************【类的定义、单继承、实现接口】类的声明结束******************************/

/***********************************类定义的构造器约束********************************

1.在创建构造器的时候注意传入的参数必须是一个Object或者[],这样利于类的继承时进行初始化

2.继承的子类中的构造器必须拥有一个args对象，它包含超类的构造器所需要的所有初始化参数

3.尽量避免出现全局变量，如果必须要有，那么一定得将这些变量放在一个全局的对象Global中。

************************************类定义的构造器约束********************************/

var Global = {};

Global.Iimage = new Interface("Iimage", ["淡入", "淡出"]);

//BigImage constructor:
//@param:
//[object]
Global.constructor = function(args){
	this.object = $(args.object);
	this.src = this.object.attr('src');

	this.fadeIn = function(fun){
		this.object.fadeIn(fun);
		return this;
	};
	this.fadeOut = function(fun){
		this.object.fadeOut(fun);
		return this;
	};
	this.setSrc = function(src){
		this.src = src;
		this.object.attr('src', this.src);
	};
};

//BigImage methods:
Global.methods = {
	淡入: function(){
		this.fadeIn();
	},
	淡出: function(){
		this.fadeOut();
	},
	变脸: function(src){
		this.setSrc(src);
	},
	切换: function(src){
		var that = this;
		this.fadeOut(function(){
			that.setSrc(src);
		}).fadeIn();
	}
};

//BigImage Class:
Global.BigImage = new Class("BigImage", null, Global.constructor, Global.methods, Global.Iimage);

//@param:
Global.param = {
	object: document.getElementById('this_pic')
};

//instance of BigImage:
Global.headBigImage = new Global.BigImage(Global.param);

//@param:
//[object, state, index]
Global.constructor = function(args){
	this.object = $(args.object);
	this.state = args.state;
	this.index = args.index;
	
	this.fadeIn = function(){
		this.object.animate({top:"0px", opacity:1});
		Global.headBigImage.切换(this.object.attr('src'));
	};
	this.fadeOut = function(){
		this.object.animate({top:"18px", opacity:0.5});
	};
	this.jumpIn = function(){
		this.object.animate({top:"0px", opacity:1});
		Global.headBigImage.变脸(this.object.attr('src'));
	};
};

Global.methods = {
	淡入: function(){
		if(this.state!="显示"){
			this.state = "显示";
			this.fadeIn();
		}
	},
	快速显示: function(){
		if(this.state!="显示"){
			this.state = "显示";
			this.jumpIn();
		}

	},
	淡出: function(){
		if(this.state!="隐藏"){
			this.state = "隐藏";
			this.fadeOut();
		}
	},
	快速隐去: function(){
		if(this.state!="隐藏"){
			this.state = "隐藏";
			this.fadeOut();
		}
	}
};

Global.ImageClass = new Class("ImageClass", null, Global.constructor, Global.methods, Global.Iimage);

//IimageCollection Interface:
Global.IimageCollection = new Interface("IimageCollection", ["自动切换", "停止切换"]);

//renew constructor and methods:
//@param:
//[images, timeout, current]
Global.constructor = function(args){
	this.images = args.images;
	this.timeout = args.timeout;
	this.current = args.current;
	this.interval = null;

	this.initial = function(){
		this.images[this.current-1].淡入();
		this.自动切换(this);
	};
	this.restore = function(){
		for(var i=0, len=this.images.length; i<len; i++){
			this.images[i].淡出();
		}
	};
};

Global.methods = {
	自动切换: function(){
		var that = this;
		this.interval = setInterval(function(){
			that.images[that.current-1].淡出();
			if(that.current==that.images.length){
				that.current = 1;
			}
			else{ that.current = that.current + 1;}
			that.images[that.current-1].淡入();
		}, that.timeout);
	},
	停止切换: function(){
		var that = this;
		clearInterval(that.interval);
		that.restore();
	}
};

//ImageCollection Class:
Global.ImageCollection = new Class("ImageCollection", null, Global.constructor, Global.methods, Global.IimageCollection);

Global.imageInstances = (function(){
	var p = [];
	var pics = $('.head-pic');
	for(var i=0; i<pics.length; i++){
		var t = {
			object: pics.eq(i),
			 state: "隐藏",
			 index: i*1+1
		};
		pics.eq(i).attr('index', 1*i+1);
		p.push(new Global.ImageClass(t));
	}
	return p;
})();

//param:
Global.param = {
	 images: Global.imageInstances,
	timeout: 6000,
	current: 1
};

Global.imageCollection = new Global.ImageCollection(Global.param);

//start the auto displaying:
Global.imageCollection.initial();

//EventBinder:
Global.IeventBinder = new Interface("IeventBinder", ["绑定事件"]);

//EventBinder constructor:
Global.constructor = function(){
	
};

//EventBinder methods:
Global.methods = {
	//@param:
	//[objects, events, handler]
	绑定事件: function(args){
		var objects = args.objects;
		var events = args.events;
		var handler = args.handler;
		
		for(var k=0,olen=objects.length; k<olen; k++){
			for(var i=0, len=events.length; i<len; i++){
				$(objects[k]).bind(events[i], handler);
			}
		}
	}
};

Global.EventBinder = new Class("EventBinder", null, Global.constructor, Global.methods, Global.IeventBinder);

Global.binder = new Global.EventBinder();

//@param:
Global.param = {
	objects: $('.head-pic'),
	 events: ["mouseover"],
	handler: function(){
		var im = new Global.ImageClass({object:this, state:"隐藏", index:0});
		Global.imageCollection.停止切换();
		im.快速显示();
	}
};

Global.binder.绑定事件(Global.param);

//@param:
Global.param = {
	objects: $('.head-pic'),
	 events: ["mouseout"],
	handler: function(){
		var im = new Global.ImageClass({object:this, state:"显示", index:0});
		im.淡出();
		Global.imageCollection.current = parseInt($(this).attr('index'));
		Global.imageCollection.自动切换();
	}
};

Global.binder.绑定事件(Global.param);

