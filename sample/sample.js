
var init = function(){
	
	VJ.init({});
	
	VJ.addvalidation("test",{
		text: function(pjobj, jobj, value, params)
		{
			value = (value == null) ? jobj.val() : value;
			if (value == null || value == "") {
				return VJ.SUCCESS;
			}else if (value.match(/^123$/i)) {
				return VJ.SUCCESS;
			}
			return VJ.FAIL;
		}
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
		.maxlength(10,{"error_msg_format" : "${0}'s maxlength less than ${1}!!"})
		.minlength(5)
		.once()
		.options({"name" : "Test"})
		.keyup(function()
		{
			keyupcb($(this).validate(),"#text1_error");
		});
		
	var text2 = $("input[name=text2]")
		.required()
		//.email(new RegExp("^https?:\/\/.+$", "i"),{"error_msg_format" : "hey!! this is invalid email!!"})
		.email({"error_msg_format" : "hey!! this is invalid email!!"})
		.once()
		.keyup(function()
		{
			keyupcb($(this).validate(),"#text2_error");
		});

	var text3 = $("input[name=text3]")
		.required()
		.options({"success_msg_format" : "success!!!!!","error_msg_format" : "errooooooo!!"})
		.between(5,8,{"error_msg_format" : "too short or toooo long!!!"})
		.once()
		.keyup(function()
		{		
			var test = $(this).validate();
			//alert(test.results.successes[0].message);
			keyupcb($(this).validate(),"#text3_error");
		});

	var text12 = $("input[name=text12]")
	.required()
	.max(100,{"error_msg_format" : "${0} is less than ${1} !!"})
	.min(20)
//	.range(20,200)
	.once()
	.options({"name" : "this box","success_msg_format" : "success!!!!!"})
	.keyup(function()
	{				
		keyupcb($(this).validate(),"#text12_error");
	});
	
	var text4 = $("input[name=text4]")
		.url()
		.once()
		.keyup(function()
		{				
			keyupcb($(this).validate(),"#text4_error");
		});
	
	var text5 = $("input[name=text5]")
		.numeric({"error_msg_format" : "${0} is not numeric !!"})
		.once()
		.keyup(function()
		{				
			keyupcb($(this).validate(),"#text5_error");
		});
	
	var text6 = $("input[name=text6]")
		.alpha()
		.once()
		.keyup(function()
		{				
			keyupcb($(this).validate(),"#text6_error");
		});
	
	var text7 = $("input[name=text7]")
		.alphaNumeric()
		.once()
		.keyup(function()
		{				
			keyupcb($(this).validate(),"#text7_error");
		});
	
	var text8 = $("input[name=text8]")
		.equal($("input[name=text7]"))
		.once()
		.keyup(function()
		{				
			keyupcb($(this).validate(),"#text8_error");
		});

	var textm = $(".textm")
		.required({"priority":1, "name" : "Text1","error_msg_format" : "${0} is required!!"})
		.maxlength(10)
		.minlength(5)
		.once()
		;
	
	var text9 = $("input[name=text9]")
	.keyup(function()
	{				
		keyupcb($(this).validate(),"#text9_error");
	});	

	var text10 = $("input[name=text10]")
	.keyup(function()
	{				
		keyupcb($(this).validate(),"#text10_error");
	});	

	var keyupcbajax = function(results,id)
	{	
		if(results.status == VJ.AJAX)
		{
			$(id).addClass("validate_msg");
			$(id).removeClass("ok_msg");
			$(id).html(results.results.ajaxes[0].message);
		}
		else 
		{
			$(id).removeClass("validate_msg");
			$(id).addClass("ok_msg");
			$(id).html(results.message);
		}
	}
	
	var ajaxtext = $("input[name=ajaxtext]")
		.ajaxv(
			{
				"async": true,
				"data": null,
				"dataType ": "json",
				"type": "get",
				"url": "./ajax.json",
				"success": function(data, dataType){

					setTimeout(function(){
						//alert($("input[name=ajaxtext]").hasErrorAndAjax());
						//alert($("input[name=ajaxtext]").hasError());
						//alert($("input[name=ajaxtext]").hasAjax());
						$("input[name=ajaxtext]").ajaxvmsg(VJ.SUCCESS);
						//alert($("input[name=ajaxtext]").hasError());
						//alert($("input[name=ajaxtext]").hasAjax());
						//alert($("input[name=ajaxtext]").hasErrorAndAjax());
						$("#ajaxtext_error").html(VJ.getOption().success_msg_format);
					},3000);
				}
			}
		)
		.keyup(function()
		{				
			keyupcbajax($(this).validate(),"#ajaxtext_error");
		});	

	
	var textextend = $("input[name=textextend]")
		.test({params:[10],opts : {"error_msg_format" : "${0} is must be 123 !!"}})
		.once()
		.keyup(function()
		{				
			keyupcb($(this).validate(),"#textextend_error");
		});
	
	var textarea1 = $("textarea[name=textarea1]")
		.required({"priority":1, "name" : "Text1","error_msg_format" : "${0} is required!!"})
		.maxlength(100)
		.minlength(20)
		.url({"priority": 2, "name" : "test","error_msg_format" : "${0} is not url!!!!!"})
		.once()
		.keyup(function()
		{
			keyupcb($(this).validate(),"#textarea1_error");
		});	

	var radio1 = $("input[name=sex]")
		.required({"name" : "Sex","error_msg_format" : "${0} is required!!!!!"})
		.once()
		.options({"name" : "Sex","success_msg_format" : "OKOKOK!!!"})
		.click(function()
		{
			keyupcb($(this).validate(),"#sex_error");
		})
		.validate()
		;
	
	keyupcb(radio1,"#sex_error");

	var checkbox1 = $("input[name=prop]")
		.required()
		.maxlength(3)
		.minlength(2)
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#prop_error");
		})
		.validate();
	
	keyupcb(checkbox1,"#prop_error");

	var checkbox2 = $("input[name=prop2]")
		.required()
		.between(2,3)
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#prop2_error");
		})
		.validate();

	keyupcb(checkbox2,"#prop2_error");


	var select1 = $("select[name=example]")
		.required()
		.maxlength(3)
		.minlength(2)
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#example_error");
		})
		.validate();

	keyupcb(select1,"#example_error");

	var select2 = $("select[name=example2]")
		.required()
		.between(2,3)
		.once()
		.click(function()
		{
			keyupcb($(this).validate(),"#example2_error");
		})
		.validate();

	keyupcb(select2,"#example2_error");
	
	
	
	
}
