;(function(window, factory){
    if (typeof exports==="object"){
        module.exports = factory;
    } else if (typeof define==="function"){
        define([],factory);
    } else {
        window.validate =  factory();
    }
})(this,function(){
    var init = function(element,btn,option){
        element = document.querySelector(element);
        btn = document.querySelector(btn);
        btn.onclick = function(){
            validateAll(element,option);
        };
        for (var rule in option.rule){
            var e = element.querySelector("[name='"+rule+"']");
            e && bind(e,rule,option);
        }
    };
    var bind = function(e,rule,option){
        e.onblur = function(){
            validate(e,rule,option);
        };
        e.onchange = function(){
            removeTip(e);
            validate(e,rule,option);
        };
        e.onfocus = function(){
            removeTip(e);
        };
    };
    var validate = function(element,ruleName,option,isSubmit){
        var rules = option.rule[ruleName];
        var messages = option.message[ruleName];
        for (var rule in rules){
            if (execute[rule] && !execute[rule](element,rules[rule])) {
                tip(element,messages[rule]);
                isSubmit && scroll(element);
                return false;
            }
        }
        return true;
    };
    var scroll = function(element){
        var y = element.getBoundingClientRect().top;
        y += document.body.scrollTop;
        y -= 60;
        window.scrollTo(0,y);
    };
    var validateAll = function(element,option){
        var rule;
        for (rule in option.rule){
            var e = element.querySelector("[name='"+rule+"']");
            if (!e) continue;
            var result = validate(e,rule,option,true);
            if (!result){
                return false;
            }
        }
        option.handleSubmitEvent && option.handleSubmitEvent();
    };
	var execute = {
		required: function(e,n){
			return e && String(e.value||e.innerHTML).length > 0;
		},
		maxlength: function(e,n){
			return e && String(e.value||e.innerHTML).length <= n;
		},
		minlength: function(e,n){
			return e && String(e.value||e.innerHTML).length >= n;
		},
		reg: function(e,reg){
			//使用match,不用test匹配正则，chrome下test有bug
			return e && reg && reg.test(e.value||e.innerHTML);
		},
		max: function(e,n){
			var num = 0;
			try{
				num = parseInt(e.value||e.innerHTML);
			} catch(ex){num=0}
			if (!num) num = 0;
			return num<=n;
		},
		min: function(e,n){
			var num = 0;
			try{
				num = parseInt(e.value||e.innerHTML);
			} catch(ex){num=0}
			if (!num) num = 0;
			return num>=n;;
		}
	};
	var extend = function (name,func){
		execute[name] = func;
	};
    var getPosition = function(element){
        var y = element.getBoundingClientRect().top,
        x = element.getBoundingClientRect().left;
        y += document.body.scrollTop;
        x += element.offsetWidth/2;
        y += element.offsetHeight + 10;
        return [x,y];
    }
    var boxCss = function(div){
        div.style.position = "absolute";
        div.style.backgroundColor  = "#ff5f69";
        div.style.padding = "10px 15px";
        div.style.color = "#ffffff";
        div.style.borderRadius = "4px";
    };
    var triCss = function(){
        var triCss = "display: inline-block;";
        triCss += "height: 8px;";
        triCss += "position: absolute;";
        triCss += "top: -8px;";
        triCss += "width: 16px;";
        triCss += "border-left: 8px solid transparent;";
        triCss += "border-right: 8px solid transparent;";
        triCss += "border-bottom: 8px solid #ff5f69;";
        triCss += "left: 0;"
        triCss += "right: 0;";
        triCss += "margin: auto;"
        return triCss;
    };
    var tip = function(element,tip){
        if (!element){
           return false; 
        }
        var name = element.getAttribute('name');
        if (!document.querySelector(".error[for='"+name+"']")){
            var div = document.createElement("div");
            div.classList.add("error");
            div.setAttribute('for',element.getAttribute("name"));
            div.innerHTML = "<span style='"+triCss()+"'></span>"+tip;
            boxCss(div);
            var p = getPosition(element);
            div.style.top = p[1]+"px";
            document.body.appendChild(div);
            div.style.left = (p[0] - div.offsetWidth/2)+"px";
        }
    };
    var removeTip = function(element){
        var name = element.getAttribute("name");
        var error = document.querySelector(".error[for='"+name+"']");
        if (error) {
            document.body.removeChild(error);
        }
    };
	return {
		init:init,
		extend:extend,
        tip: tip,
        removeTip:removeTip
	}
});
