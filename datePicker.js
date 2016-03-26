;(function(window, factory){
    if (typeof exports==="object"){
        var dom = require('zepto');
        module.exports = factory;
    } else if (typeof define==="function"){
        define(['zepto'],factory);
    } else {
        window.datePicker =  factory(window.dom);
    }
})(this,function(dom){
    var monthDays = [31,28,31,30,31,30,31,31,30,31,30,31];
    var monthName = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
    var option;
    var picker;
    var cellWidth;
    var cellHeight;
    var DATE_REG = /\d{4}\-\d{1,2}\-\d{1,2}/;
    var config = function(data){
        var selectedTime;
        if (data.target.value!==undefined){
            selectedTime = data.target.value;
        } else {
            selectedTime = data.target.innerHTML;
        }
        if (DATE_REG.test(selectedTime)){
            data.selectedTime = selectedTime; 
        };
        if (!DATE_REG.test(data.smallestTime)){
            var today =  new Date();
            data.smallestTime = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
        }
        option = data; 
        init(str2json(selectedTime?selectedTime:option.smallestTime));
    };
    var init = function(data){
        if (dom('.date-picker-bg').length==0) {
            var bg = document.createElement('div');
            bg.setAttribute('class','date-picker-bg');
            picker = document.createElement('div');
            picker.setAttribute('class','date-picker');
            cellWidth = (window.innerWidth-30)/7;
            cellHeight = (window.innerHeight-60)/10; 
            picker.style.width = cellWidth*7 + "px";
            picker.style.left = "15px";
            cellWidth = cellWidth + "px";
            cellHeight = cellHeight + "px";
            bg.appendChild(picker);
            document.body.appendChild(bg);
        }
        picker.innerHTML = getDaysHtml(data?data:str2json(option.smallestTime),option.title);
        var top = (window.innerHeight - picker.offsetHeight)/2 + 'px';
        picker.style.top = top;
        bindEvent();
    };
    var getDaysHtml = function(dateJSON,title){
        var html = "<h3 style='height:"+cellHeight+";line-height:"+cellHeight+";'>";
            html += title?title:option.title;
            html += "</h3>";
            html += "<i class='close' style='height="+cellHeight+";line-height:"+cellHeight+";width:"+cellHeight+";'></i>";
            html += "<div class='header'><span class='left'>&lt;</span><a data-month='"+dateJSON.year+"-"+dateJSON.month+"'>";
            html += dateJSON.year+'年'+monthName[dateJSON.month-1]+'月';
            html += "</a><span class='right'>&gt;</span></div>";
            html += "<div>";
            html += "<div class='weekday'>";
            html += "<i>周日</i>";
            html += "<i>周一</i>";
            html += "<i>周二</i>";
            html += "<i>周三</i>";
            html += "<i>周四</i>";
            html += "<i>周五</i>";
            html += "<i>周六</i>";
            html += "</div>";
            html += "<div class='days'>"
            html += getDayE(dateJSON);
            html += "</div>";
            html += "<div style='height:"+cellHeight+";background-color:#eaeef1;'></div>";
            html += "</div>";
        return html;
    };
    var compare = function(a,b){
        if (a.year>b.year){
            return 1;
        } else if (a.year<b.year) {
            return -1;
        } else if (a.month>b.month){
            return 1;
        } else if (a.month<b.month){
            return -1;
        } else if (a.day>b.day){
            return 1;
        } else if (a.day<b.day){
            return -1;
        } else {
            return 0;
        }
    };
    var getMonthDayCount = function(data){
        if (data.month==2 && (data.year%400==0 || (data.year%100!=0 && data.year%4==0)))
        {
            return 29;
        }
        return monthDays[data.month-1];

    };
    var json2Str = function(data){
        return data.year + "-" + data.month + "-" + data.day;
    };
    var date2Str = function(date){
        return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    };
    var json2Date = function(data){
        var date = new Date();
        date.setFullYear = data.year;
        date.setMonth = data.month-1;
        date.setDay = data.day;
        return date;
    }
    var getFirstWeekDay = function(data){
        var date = json2Date(data);
        date.setDate(1);
        return date.getDay();
    };
    var getLastWeekDay = function(data){
        var date = json2Date(data);
        date.setDate(getMonthDayCount(data));
        return date.getDay();
    };
    var getLastMonthDate = function(cData){
        var dayCount = getMonthDayCount(cData);
        var firstWDay = getFirstWeekDay(cData);
        var displayData = lastMonth(cData);
        var html = "";
        if (firstWDay!=0){
            var lastDays = getMonthDayCount(displayData);
            html += '<p>';
            for (var i=1;i<=firstWDay;i++){
                displayData.day = lastDays-firstWDay+i;
                html += "<i data-date='"+json2Str(displayData)+"' style='height:"+cellHeight+";line-height:"+cellHeight+";width:"+cellWidth+"' class='"
                html += (option.selectedTime && compare(displayData,str2json(option.smallestTime))==0)?"selected":'';
                html += (compare(displayData,str2json(option.smallestTime))<0)?'disabled':'';
                html += "'>";
                html += displayData.day + "</i>";
            }
        }
        return html;
    };
    var getCurrentMonthDate = function(cData){
        var displayData = cData;
        var dayCount = getMonthDayCount(displayData);
        var firstWDay = getFirstWeekDay(cData);
        var html = "";
        for (var i=0;i<dayCount;i++){
            if ((i+firstWDay)%7==0){
                html += "<p>";
            }
            displayData.day = i+1;
            html += "<i data-date='"+json2Str(displayData)+"' style='height:"+cellHeight+";line-height:"+cellHeight+";width:"+cellWidth+"' class='"
            html += (option.selectedTime && compare(displayData,str2json(option.selectedTime))==0)?"selected ":'';
            html += (compare(displayData,str2json(option.smallestTime))<0)?'disabled':'';
            html += "'>";
            html += (i==0?(displayData.month+'月'):displayData.day) + "</i>";
            if ((i+firstWDay)%7==6){
                html += "</p>";
            }
        }
        return html;
    };
    var getNextMonthDate = function(cData){
        var finalWDay = getLastWeekDay(cData);
        var displayData = nextMonth(cData);
        var html = "";
        if (finalWDay!=6){
            for (var i=1;i<=6-finalWDay;i++){
                displayData.day = i;
                html += "<i data-date='"+json2Str(displayData)+"' style='height:"+cellHeight+";line-height:"+cellHeight+";width:"+cellWidth+"' class='"
                html += (option.selectedTime && compare(displayData,str2json(option.selectedTime))==0)?"selected":'';
                html += (compare(displayData,str2json(option.smallestTime))<0)?'disabled':'';
                html += "'>";
                html += (i==1?(displayData.month+'月'):i) + "</i>";
                html += "</i>";
            }
            html += "</p>";
        }
        return html;
    };
    var getDayE = function(data){
        var html = getLastMonthDate(data);
        html += getCurrentMonthDate(data);
        html += getNextMonthDate(data);
        return html;
    }
    var nextMonth = function(data){
        return data.month==12?{year:data.year+1,month:1}:{year:data.year,month:data.month+1};
    };
    var getYearMonth = function(){
        var a = dom('.date-picker .header a');
        var monthYear = a.attr("data-month");
        var arr = monthYear.split('-');
        return {year:parseInt(arr[0]),month:parseInt(arr[1])};
    };
    var str2json = function(dateStr){
        var reg = /^(\d{4})\-(\d{1,2})\-(\d{1,2})$/;
        if (reg.test(dateStr)){
            var arr = dateStr.match(reg);
            return {year:parseInt(arr[1]),month:parseInt(arr[2]),day:parseInt(arr[3])};
        }
    };
    var lastMonth = function(data){
        return data.month==1?{year:data.year-1,month:12}:{year:data.year,month:data.month-1};
    };
    var bindEvent = function(){
        var bindEvent = dom.ajax?'on':'bindEvent';
        dom('.date-picker .header .left')[bindEvent]('click',function(){
            var d = lastMonth(getYearMonth());
            d.title = option.title;
            init(d);
        });
        dom('.date-picker .header .right')[bindEvent]('click',function(){
            var d = nextMonth(getYearMonth());
            d.title = option.title;
            init(d);
        });
        dom('.date-picker .days i').each(function(i,e){
            if(!dom(e).hasClass('disabled')){
                dom(e)[bindEvent]('click',function(e){ 
                    dom('.date-picker .days i.selected').removeClass('selected');
                    time = option.smallestTime;
                    changeDate(dom(this).attr('data-date'));
                    dom('.date-picker-bg').remove();
                });
            } 
        });
        dom('.date-picker .close')[bindEvent]('click',function(){
            dom('.date-picker-bg').remove();
        });
    };
    var changeDate = function(selectedDate){
        var dateJSON = str2json(selectedDate);
        var month = dateJSON.month<10?"0"+dateJSON.month:dateJSON.month;
        var day = dateJSON.day<10?"0"+dateJSON.day:dateJSON.day;
        selectedDate = dateJSON.year + "-" + month + "-" + day;
        console.log("test:"+selectedDate);
        if (option.target.value!==undefined){
            option.target.value = selectedDate;
        } else {
            option.target.innerHTML = selectedDate;
        }
        dom(option.target).change  && dom(option.target).change();
        option.callback && option.callback(selectedDate);
    };
    return config;
});
