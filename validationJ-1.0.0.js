var VJ = (function(jQuery){
	
	var opts = {
		error_msg_format 	: "error",
		success_msg_format  : "ok",
		ajax_msg_format 	: "connecting server...",
		message : {
			required : {
				error_msg_format : "required"
			},
			maxlength : {
				error_msg_format : "less than ${1} words"
			},
			minlength : {		
				error_msg_format : "more than ${1} words"
			},
			between : {	
				error_msg_format : "between ${1} and ${2} words"
			},
			max : {
				error_msg_format : "less than ${1}"
			},
			min : {	
				error_msg_format : "more than ${1}"
			},
			range : {
				error_msg_format : "between ${1} and ${2}"
			},
			email : {
				error_msg_format : "invalid Email"
			},
			url : {
				error_msg_format : "invalid url"
			},
			numeric : {
				error_msg_format : "this is not number"
			},
			alpha : {
				error_msg_format : "this is not alphabet"
			},
			alphaNumeric : {
				error_msg_format : "this is not alphabet or number"
			},
			equal : {
				error_msg_format : "not qeual"
			},
			ajaxv : {
				ajax_msg_format : "connecting server..."
			}
		}
	};

	var FAIL = 0;
	var SUCCESS = 1;
	var AJAX = 2;
	
	var main = {
		validations : [],
		exts : [],
		get : function(pjob,job)
		{
			return (this.validations[job.name] != null) ? 
				this.validations[job.name] :　this.validations[job.name] = new Validation(pjob,job);
		},
		priority : function(def,opts){
			return (opts == null) ? def : ((typeof(opts) === "object" && opts['priority'] != null) ? opts['priority'] : def);
		},
		getParams : function(opts,params)
		{
			if(opts == null){ return null;}
			var array = [];
			for(var i=0;i<params.length;i++){ array.push(opts[params[i]]); }
			return array;
		},
		getValue : function(jobj,value){
			return (value == null) ? jobj.val() : value;
		},
		isEmpty : function(value){
			return (value == null || value == "" || value == undefined) ? true : false;
		},
		isString : function(value){
			return (value != null && (typeof(value) === "string")) ? true : false;
		},
		isObject : function(value){
			return (value != null && (typeof(value) === "object")) ? true : false;
		},
		isReg : function(value){
			 return (value != null && value instanceof RegExp) ? true : false;
		},
		getfunc : function(method,type)
		{
			method = (main.exts[method] != undefined) ? main.exts[method] : eval(method);
			var type = type.toLowerCase();
			if(type == "select-one" || type == "select-multiple"){ type = "select"; }
			return (method[type] != null) ? method[type] : false ;
		},
		m : function(opts,vopts,lformat,sformat)
		{
			if(vopts != null && vopts[lformat] != undefined){
				return vopts[lformat];
			}else if(vopts != null && vopts[sformat] != undefined){
				return vopts[sformat];
			}
			return opts[lformat]
		}
	};
	
	var Message = function(defname,vOpts)
	{
		this.defname = defname;
		this.vOpts = vOpts;
		this.regs = [];
		this.rOpts = null;	
	};
	
	Message.prototype = 
	{		
		setDefname : function(defname){
			this.defname = defname; return this;
		},
		setROpts : function(rOpts){
			this.rOpts = rOpts; return this;
		},
		getName : function()
		{
			return (this.rOpts != null && this.rOpts["name"] != null) ? this.rOpts["name"] : 
			 ((this.vOpts != null && this.vOpts["name"] != null) ? this.vOpts["name"] : this.defname);
		},
		_mf : function(opts,lname,sname)
		{
			return (opts == null) ? false : 
			 ((opts[lname] != null) ? opts[lname] : ( (opts[sname] != null) ? opts[sname] :　false ) );
		},
		_getmf : function(method,lname,sname)
		{
			var mf = this._mf(this.rOpts,lname,sname);
			if(mf != false){ return mf; }
			
			mf = this._mf(this.vOpts,lname,sname);
			if(mf != false){ return mf; }

			mf = this._mf(opts.message[method],lname,sname);
			if(mf != false){ return mf; }
			
			mf = this._mf(opts,lname,sname);
			if(mf != false){ return mf; }
			
			return "error";
		},
		_getMF : function(status,method)
		{
			switch (status) {
			case SUCCESS:
				return this._getmf(method,"success_msg_format","smf");
				break;
			case FAIL:
				return this._getmf(method,"error_msg_format","emf");
				break;
			case AJAX:
				return this._getmf(method,"ajax_msg_format","amf");
				break;
			default:
				return this._getmf(method,"success_msg_format","smf");
				break;
			}
		},
		getReg : function(pattern,type)
		{
			var id = pattern + "_" + type;
			return (this.regs[id] != null) ? this.regs[id] : this.regs[id] = new RegExp(pattern,type);
		},
		resolve : function(status,method,params)
		{
			var name = this.getName();
			var mf = this._getMF(status,method).replace(/\$\{0\}/i, name);
			if(params == null || params == undefined) { return mf; }
			for(var j=0; j < params.length; j++){
				mf = mf.replace(this.getReg("\\$\\{" +(j + 1)+ "\\}","i"),params[j]);
			}

			return mf;
		}
	};
	
	var Validation = function(pjob,job)
	{
		this.pjob = pjob;
		this.job  = $(job);
		this.name = job.name;
		this.type = job.type;
		this.once 		= false;
		this.iscompared = false;
		this.rules 	 = []; this.rulemap = [];
		this.s = []; this.e = []; this.a = [];
		this.message = new Message(this.name);
		this.compare = function(a,b)
		{
			return (a.priority > b.priority) ? 1 : ((a.priority < b.priority) ? -1 : 0);
		}
	};
	
	Validation.prototype = 
	{
		setOnce : function(once) { 
			this.once = once; return this;
		},
		setOpts : function(opts){ 
			this.message.vOpts = opts; return this;
		},
		isMultiple : function(){
			return (this.type == "chekcbox" || this.type == "radio") ? true : false;
		},
		add : function(method,opts,params)
		{
			if(this.rulemap[method] != undefined){ return this; }
			var func = main.getfunc(method,this.type);
			if(!func) { alert("error : not supported validation"); return this; }
			var rule = new Rule(method,func,opts,params,main.priority(this.rules.length + 1,opts));
			this.rules.push(rule);
			this.rulemap[method] = rule;
			return this;
		},
		execute : function(value)
		{
			if(!this.iscompared){ this.iscompared = true; this.rules.sort(this.compare); }
			this.s = []; this.e = []; this.a = [];	
			for(var i=0,len = this.rules.length; i < len; i++)
			{
				var rule = this.rules[i];
				var status = rule.func(this.pjob,this.job,value,rule.params);
				var msg = this.message.setROpts(rule.opts).resolve(status,rule.method,rule.params);
				switch(status) {
				case SUCCESS:
					this.s.push({method : rule.method,status : status,message : msg});
					break;
				case FAIL:
					this.e.push({method : rule.method,status : status,message : msg});
					break;
				case AJAX:
					this.a.push({method : rule.method,status : status,message : msg});
					break;
				default:
					break;
				}
				if(status == FAIL && this.once){ break; }
			}
			return {
				successes : this.s,
				errors	  : this.e,
				ajaxes 	  : this.a
				};
		},
		ajaxresult : function(status)
		{
			var params = (this.rulemap["ajaxv"] != null) ? this.rulemap["ajaxv"].params : null;
			var msg = this.message.resolve(status,"ajaxv",params);
			this.a = [];
			switch (status) {
			case SUCCESS:
				this.s.push({method : "ajaxv",status : status,message : msg});
				break;
			case FAIL:
				this.e.push({method : "ajaxv",status : status,message : msg});
				break;
			case AJAX:
				this.a.push({method : "ajaxv",status : status,message : msg});
				break;
			default:
				break;
			}
		}
	};

	var Rule = function(method,func,opts,params,priority)
	{
		this.method = method; /* validation method name*/
		this.func   = func; /* validation method */
		this.opts   = opts;
		this.params = params;
		this.priority = priority;
	};
	
	var required = {
		text : function(pjobj,jobj,value){
			return (main.isEmpty(main.getValue(jobj,value))) ? FAIL : SUCCESS;
		},
		textarea : function(pjobj,jobj,value){
			return required.text(pjobj,jobj,value);
		},
		checkbox : function(pjobj,jobj)
		{
			var checked = false;
			pjobj.each(function(){ if(this.checked){ checked = true; }});
			return checked ? SUCCESS : FAIL;
		},
		radio : function(pjobj,jobj){
			return required.checkbox(pjobj,jobj);
		},
		select : function(pjobj,jobj,value){
			return required.text(pjobj,jobj,value);
		}
	};
	
	var maxlength = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value.length <= params[0]){ 
				return SUCCESS; 
			}else{
				return FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return maxlength.text(pjobj,jobj,value,params);
		},
		select : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){ return SUCCESS; }
			
			var array =  value.toString().split(",");
			if($.inArray("",array) != -1){ array.splice($.inArray("",array),1) }
			if(array.length <= params[0]){ 
				return SUCCESS;
			}else{
				return FAIL;
			}
		},
		checkbox : function(pjobj,jobj,value,params)
		{
			var count = 0;
			pjobj.each(function(){ if(this.checked){ count++; } });
			return (count <= params[0] ) ? SUCCESS : FAIL;
		}
	};

	var minlength = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value.length >= params[0]){ 
				return SUCCESS; 
			}else{
				return FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return minlength.text(pjobj,jobj,value,params);
		},
		select : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			
			if(main.isEmpty(value)){ return SUCCESS; }
			
			var array =  value.toString().split(",");
			if($.inArray("",array) != -1){ array.splice($.inArray("",array),1) }	
			if(array.length >= params[0]){ 
				return SUCCESS;
			}else{
				return FAIL;
			}
			
		},
		checkbox : function(pjobj,jobj,value,params)
		{
			var count = 0;
			pjobj.each(function(){ if(this.checked){ count++; } });
			return (count >= params[0] ) ? SUCCESS : FAIL;
		}
	};

	var between = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){
				return SUCCESS;
			}else if(value.length >= params[0] && value.length <= params[1]){ 
				return SUCCESS;
			}else{
				return FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return between.text(pjobj,jobj,value,params);
		},
		select : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){ return SUCCESS; }
			
			var array = value.toString().split(",");
			if($.inArray("",array) != -1){ array.splice($.inArray("",array),1) }		
			if(array.length >= params[0] && array.length <= params[1]){ return SUCCESS;}
			return FAIL;
		},
		checkbox : function(pjobj,jobj,value,params)
		{
			var count = 0;
			pjobj.each(function(){ if(this.checked){ count++; } });
			return (count >= params[0] && count <= params[1]) ? SUCCESS : FAIL;
		}
	};

	var max = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value <= params[0]){ 
				return SUCCESS; 
			}else{
				return FAIL;
			}
		}
	};

	var min = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value >= params[0]){ 
				return SUCCESS; 
			}else{
				return FAIL;
			}
		}
	};

	var range = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){
				return SUCCESS;
			}else if(value >= params[0] && value <= params[1]){ 
				return SUCCESS;
			}else{
				return FAIL;
			}
		}
	};
	
	var email = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){ 
				return SUCCESS; 
			}else if(params != null && params[0] != undefined){
				return (value.match(params[0])) ? SUCCESS : FAIL;
			}else{
				return (value.match(/[0-9a-zA-Z\._\-\+]+@[0-9a-zA-Z_\-]+(\.[0-9a-zA-Z_\-]+){1,}/i)) ? SUCCESS : FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return email.text(pjobj,jobj,value,params);
		}		
	};

	var url = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){ 
				return SUCCESS; 
			}else if(params != null && params[0] != undefined){
				return (value.match(params[0])) ? SUCCESS : FAIL;
			}else{
				return (value.match(/^https?:\/\/.+\..+$/i)) ? SUCCESS : FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return url.text(pjobj,jobj,value,params);
		}
	};
	
	var numeric = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value.match(/^[0-9]+$/i)){
				return SUCCESS;
			}else{
				return FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return numeric.text(pjobj,jobj,value,params);
		}
	};
	
	var alpha = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value.match(/^[a-zA-Z]+$/i)){ 
				return SUCCESS; 
			}else{
				return FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return alpha.text(pjobj,jobj,value,params);
		}
	};
	
	var alphaNumeric = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value) || value.match(/^[0-9a-zA-Z]+$/i)){ 
				return SUCCESS; 
			}else{
				return FAIL;
			}
		},
		textarea : function(pjobj,jobj,value,params){
			return alphaNumeric.text(pjobj,jobj,value,params);
		}
	};

	var equal = {
		text : function(pjobj,jobj,value,params)
		{
			value = main.getValue(jobj,value);
			if(main.isEmpty(value)){  return SUCCESS; }	
			var target; 
			params[0].each(function(){ target = $(this).val(); });
			if(value == target){ return SUCCESS; }
			return FAIL;
		}
	};

	var ajaxv = {
		text : function(pjobj,jobj,value,params)
		{
			jQuery.ajax(params);
			return AJAX;
		},
		textarea : function(pjobj,jobj,value,params){
			return ajaxv.text(pjobj,jobj,value,params);
		}
	};
	
	jQuery.validate = function()
	{
		var data = [];
		var names = [];
		var status = SUCCESS;
		var validations = main.validations;
		for(var i in validations)
		{
			var r = validations[i].execute();
			var vopts = validations[i].message.vOpts;	
			r.status  = (r.errors.length != 0) ? FAIL : ( (r.ajaxes.length != 0) ? AJAX : SUCCESS );
			r.error	  = (r.errors.length == 1) ? r.errors[0] : null;
			r.message = (r.status == SUCCESS) ? main.m(opts,vopts,'success_msg_format','smf') : 
				( (r.status == FAIL) ? main.m(opts,vopts,'error_msg_format','emf') : main.m(opts,vopts,'ajax_msg_format','amf'));
			
			names[validations[i].name] = r;
			status = (status == SUCCESS && r.status == FAIL) ? FAIL : ((status == SUCCESS && r.status == AJAX) ? AJAX : status);
		}

		data.names  = names;
		data.status  = status;
		data.message = (status == SUCCESS) ? opts.success_msg_format : ((status == FAIL) ? opts.error_msg_format :  opts.ajax_msg_format);
		return data;
	};

	jQuery.hasErrorsAndAjax = function()
	{	
		var validations = main.validations;
		for(var i in validations)
		{
			if(validations[i].e.length != 0 || validations[i].a.length != 0){
				return true;
			}
		}
		return false;
	};

	jQuery.hasErrors = function()
	{	
		var validations = main.validations;
		for(var i in validations){
			if(validations[i].e.length != 0){ return true; }
		}
		return false;
	};
	
	jQuery.fn.errors = function()
	{
		var self = this;
		var result = null;
		var stop = false;
		this.each(function()
		{
			var validation = main.get(self,this);
			if(stop != false){ return; }
			if(!validation.isMultiple()){ stop = true; }
			result = validation.e;
		});
		return result;
	};
	
	jQuery.fn.hasError = function()
	{
		return _hasError(this,function(validation){
			return (validation.e.length != 0) ? true : false ;
		});
	};

	jQuery.fn.hasAjax = function()
	{
		return _hasError(this,function(validation){
			return (validation.a.length != 0) ? true : false ;
		});
	};
	
	jQuery.fn.hasErrorAndAjax = function()
	{
		return _hasError(this,function(validation){
			return (validation.e.length != 0 || validation.a.length != 0) ? true : false ;
		});
	};
	
	var _hasError = function(jobj,func)
	{
		var self = this;
		var result = false;
		var stop = false;
		jobj.each(function()
		{
			var validation = main.get(self,this);
			if(stop != false){ return; }
			if(!validation.isMultiple()){ stop = true; }
			if(func(validation)){ result = true; }
		});
		return result;
	};
	
	jQuery.fn.validate = function(value)
	{
		var self 	= this;
		var data 	= [];
		var stop	= false;
				
		this.each(function()
		{
			if(stop != false){ return; }		
			var validation = main.get(self,this);
			var vopts = validation.message.vOpts;
			var results   = validation.execute(value);			
			data.results =  results;
			data.status  = (results.errors.length != 0) ? FAIL : ( (results.ajaxes.length != 0) ? AJAX : SUCCESS );
			data.error 	 = (results.errors.length == 1) ? results.errors[0] : null;
			data.message = (data.status == SUCCESS) ? main.m(opts,vopts,'success_msg_format','smf') : 
				( (data.status == FAIL) ? main.m(opts,vopts,'error_msg_format','emf') : main.m(opts,vopts,'ajax_msg_format','amf'));
			stop = true;
		});
		
		return data;
	};

	jQuery.fn.options = function(opts)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).setOpts(opts);
		});
	};
	
	jQuery.fn.required = function(opts)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).add('required',opts);
		});
	};
	
	jQuery.fn.maxlength = function(maxlength,opts)
	{
		var self = this;
		var params = [maxlength];
		return this.each(function(){
			main.get(self,this).add('maxlength',opts,params);
		});
	};

	jQuery.fn.minlength = function(minlength,opts)
	{
		var self = this;
		var params = [minlength];
		return this.each(function(){
			main.get(self,this).add('minlength',opts,params);
		});
	};

	jQuery.fn.between = function(from,to,opts)
	{
		var self = this;
		var params = [from,to];
		return this.each(function(){
			main.get(self,this).add('between',opts,params);
		});
	};
	
	jQuery.fn.max = function(max,opts)
	{
		var self = this;
		var params = [max];
		return this.each(function(){
			main.get(self,this).add('max',opts,params);
		});
	};

	jQuery.fn.min = function(min,opts)
	{
		var self = this;
		var params = [min];
		return this.each(function(){
			main.get(self,this).add('min',opts,params);
		});
	};

	jQuery.fn.range = function(min,max,opts)
	{
		var self = this;
		var params = [min,max];
		return this.each(function(){
			main.get(self,this).add('range',opts,params);
		});
	};
	
	jQuery.fn.email = function(pattern,opts)
	{
		var self   = this;
		var params = (main.isReg(pattern)) ? [pattern] : (main.getParams(pattern,["pattern"]));
			opts   = (!main.isReg(pattern) && main.isObject(pattern)) ? pattern : opts;
		return this.each(function(){
			main.get(self,this).add('email',opts,params);
		});
	};

	jQuery.fn.url = function(pattern,opts)
	{
		var self   = this;
		var params = (main.isReg(pattern)) ? [pattern] : (main.getParams(pattern,["pattern"]));
			opts   = (!main.isReg(pattern) && main.isObject(pattern)) ? pattern : opts;

		return this.each(function(){
			main.get(self,this).add('url',opts,params);
		});
	};
	
	jQuery.fn.alpha = function(opts)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).add('alpha',opts);
		});
	};

	jQuery.fn.numeric = function(opts)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).add('numeric',opts);
		});
	};

	jQuery.fn.alphaNumeric = function(opts)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).add('alphaNumeric',opts);
		});
	};

	jQuery.fn.equal = function(target,opts)
	{
		var self = this;
		var params = [target];
		return this.each(function(){
			main.get(self,this).add('equal',opts,params);
		});
	};

	jQuery.fn.ajaxv = function(ajaxopts,opts)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).add('ajaxv',opts,ajaxopts);
		});
	};
	
	jQuery.fn.ajaxvaluation = jQuery.fn.ajaxv;
	
	jQuery.fn.ajaxvmsg = function(resultstatus)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).ajaxresult(resultstatus);
		});
	};
	
	jQuery.fn.once = function(bool)
	{
		var self = this;
		return this.each(function(){
			main.get(self,this).setOnce((bool == null) ? true : bool);
		});	
	};
	
	return {
		version : "1.0.0",
		FAIL 	: 0,
		SUCCESS : 1,
		AJAX 	: 2,
		init 	: function(options){
			opts = jQuery.extend(opts,options);
		},
		getOption : function(){
			return opts;
		},
		addvalidation : function(name,func)
		{
			main.exts[name] = func;
			jQuery.fn[name] = function(obj)
			{
				var params = (obj != null && obj.params != null) ? obj.params : [];
				var opts = (obj != null && obj.opts != null) ? obj.opts : [];
				var self = this;
				return this.each(function(){
					main.get(self,this).add(name,opts,params);
				});
			};
		}
	};
	
})(jQuery);