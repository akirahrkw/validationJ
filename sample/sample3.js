
var init = function(){
	
	VJ.init({
	});
		
	var keyupcb = function(results,id)
	{	
		if(results.status == VJ.FAIL)
		{
			$(id).addClass("validate_msg");
			$(id).removeClass("ok_msg");
			
			var sb = "";
			var errors = results.results.errors;
			for(var i =0;i<errors.length;i++)
			{
				var error = errors[i];
				sb += error.message + " : ";
			}
			
			$(id).html(sb);
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
		.email()
		.keyup(function()
		{
			keyupcb($(this).validate(),"#text1_error");
		});	
	
}
