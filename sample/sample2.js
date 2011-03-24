
var init = function(){
	
	VJ.init({
	});
		
	var keyupcb = function(results,id)
	{	
		if(results.status == VJ.FAIL)
		{
			$(id).addClass("validate_msg");
			$(id).removeClass("ok_msg");
			$(id).html(results.error.message);
		}
		else 
		{
			$(id).removeClass("validate_msg");
			$(id).addClass("ok_msg");
			$(id).html(results.message);	
		}
	}
	
	var text1 = $("input[name=text1]")
		.required({"priority":1, "name" : "Text1","error_msg_format" : "${0} is required!!"})
		.maxlength(10)
		.minlength(5)
		.once()
		.keyup(function()
		{
			keyupcb($(this).validate(),"#text1_error");
		});
			
	var textarea1 = $("textarea[name=textarea1]")
		.required({"priority":1, "name" : "Text1","error_msg_format" : "${0} is required!!"})
		.maxlength(100)
		.minlength(20)
		.url()
		.once()
		.keyup(function()
		{
			keyupcb($(this).validate(),"#textarea1_error");
		});	

	var radio1 = $("input[name=sex]")
		.required({"name" : "Sex","error_msg_format" : "${0} is required!! yes"})
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#sex_error");
		})
		;
	
	var checkbox1 = $("input[name=prop]")
		.required()
		.maxlength(3)
		.minlength(2)
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#prop_error");
		})
		;
	
	var select1 = $("select[name=example]")
		.required()
		.maxlength(3)
		.minlength(2)
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#example_error");
		});
	
	var submit = $("form[id=formtest]")
	.submit(function(){
		
		var results = $.validate();
		if(!$.hasErrors())
		{
			alert("Form SUCCESS");
			$("#error_msg").html(results.message);
			return false;
		}
		
		var names = results.names;
		for(var id in names)
		{
			var error = names[id];
			keyupcb(error,"#"+id+"_error");
		}
		
		$("#error_msg").html(results.message);
		
		return false;
	});
		
	var results = $.validate();
	
	
	var errorp = function(error,id)
	{	
		if(error != null)
		{
			$(id).addClass("validate_msg");
			$(id).removeClass("ok_msg");
			$(id).html(error.message);
		}
	}	
	
	var errors1 = $("input[name=text1]").errors();
	errorp(errors1[0],"#text1_error");
	//alert($("input[name=text1]").hasError());
	
	var errors2 = $("textarea[name=textarea1]").errors();
	errorp(errors2[0],"#textarea1_error");
	//alert($("textarea[name=textarea1]").hasError());
	
	
	var errors3 = $("input[name=sex]").errors();
	errorp(errors3[0],"#sex_error");
	//alert($("input[name=sex]").hasError());
	
	var errors4 = $("input[name=prop]").errors();
	errorp(errors4[0],"#prop_error");
	//alert($("input[name=prop]").hasError());
	
	var errors5 = $("select[name=example]").errors();
	errorp(errors5[0],"#example_error");
	//alert($("select[name=example]").hasError());
	
}
