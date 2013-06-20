var autotimesync_objs = [];
var autotimesync_init = 0;
var autotimesync_cct = 0;

function synctime_set(pitem)
{
	if(pitem != 0)
		var e = getElementsByClassName("synctime", "abbr");
	else
		var e = getElementsByClassName("synctime", "abbr", pitem);
		
	var i = 0;
	
	while(e[i])
	{
		var o = e[i];
		var m = o.getAttribute('data-mode');
		var v = new Date(o.getAttribute('data-ts') *1);
		var ft = relativetime_full(v);
		o.title = ft;
			
		if(m == '0')
			o.innerHTML = relativetime(v) + " ago";
		else if(m == '1')
			o.innerHTML = relativetime2(v);
		else if(m == '3') /* Month, Year */
			o.innerHTML = relativetime3(v);
		else
			o.innerHTML = ft;
			
		
		i++;
	}
}

function synctime_setobj(o)
{
	var m = o.getAttribute('data-mode');
	var v = new Date(o.getAttribute('data-ts') *1);
	var ft = relativetime_full(v);
	o.title = ft;
		
	if(m == '0')
		o.innerHTML = relativetime(v) + " ago";
	else if(m == '1')
		o.innerHTML = relativetime2(v);
	else
		o.innerHTML = ft;
	
}

function synctime_settimer(o)
{
	var obj = {id:o.id, ltus:1, iv:0};
	autotimesync_objs.push(obj);
	
	if(!autotimesync_init)
	{
		synctime_timer_thread();
		autotimesync_init = 1;
	}
}

function synctime_timer_thread()
{
	var o;
	var c = autotimesync_objs.length;
	var i = 0;
	
	for(i=0; i<c; i++)
	{
		o = autotimesync_objs[i];
		if(o)
		{
			if(autotimesync_cct % o.ltus == 0)
			{
				o.iv++;
				var iv = o.iv;
				
				if(iv > 6) o.ltus = 3;
				if(iv > 360) o.ltus = 150;
				synctime_setobj($(o.id));
			}
		}
	}

	autotimesync_cct++;
	setTimeout(function (){synctime_timer_thread();}, 10000); /* as you append one zero here, remove one zero from above numbers, and vice versa */
}

/*
 * returns only, ago times.
 * useful for comments and etc. not for
 * any serious data.
 */
function relativetime(otime)
{
	var ntime = new Date();
	var votime = new Date(otime.getTime());
	diff  = new Date();
	diff.setTime(Math.abs(ntime.getTime() - votime.getTime()));
	var timediff = diff.getTime();
	
	var years = Math.floor(timediff / (1000 * 60 * 60 * 24 * 365));
	var months = Math.floor(timediff / (1000 * 60 * 60 * 24 * 31));
	var weeks = Math.floor(timediff / (1000 * 60 * 60 * 24 * 7));
	var days = Math.floor(timediff / (1000 * 60 * 60 * 24)); 
	var hours = Math.floor(timediff / (1000 * 60 * 60)); 
	var mins = Math.floor(timediff / (1000 * 60)); 
	var c = Math.floor(timediff / 1000); 
	var ms = Math.floor(timediff);

	if(years > 1) return years + " years";
	if(years == 1) return "a year";
	if(months > 1) return months + " months";
	if(months == 1) return "a month"
	if(weeks > 1) return weeks + " weeks";
	if(weeks == 1) return "a week";
	if(days > 1) return days + " days";
	if(days == 1) return "a day";
	if(hours > 1) return hours + " hours";
	if(hours == 1) return "an hour";
	if(mins > 1) return mins + " minutes";
	if(mins == 1) return "a minute"
	if(c > 1) return c + " seconds";
	if(c == 1) return "a second";
	if(ms <= 1000) return "less than a second";

	/*if(c < 2) return "a second";
	if(c < 60) return c + " seconds";
	if(c < 120) return "a minute";
	if(c < (60 * 60)) return mins + " minutes";
	if(c < (60 * 60) * 2) return "an hour";
	if(c < (60 * 60) * 24) return hours + " hours";
	if(c < ((60 * 60) * 24) * 2) return "a day";
	if(c < ((60 * 60) * 24) * 7) return days + " days";
	if(c < (((60 * 60) * 24) * 8)) return "a week";
	if(c < (((60 * 60) * 24) * 7) * 4) return weeks + " weeks";
	if(c < (((60 * 60) * 24) * 31) * 2) return "a month";
	if(c < (((60 * 60) * 24) * 31) * 12) return months + " months";
	if(c < ((((60 * 60) * 24) * 31) * 12) * 2) return "a year";
	return years + " years"; /**/ 
}


/*
 * returns ago times combined with real times
 * flow: 
 *        less than a second, seconds, minutes, hours
 *        yesterday - <flow won't be there if yesterday was few hours or less away>
 *        week day name
 *        day, month
 *        full date
 * good for important messages and  data.
 */
function relativetime2(otime)
{
	var ntime = new Date();
	var votime = new Date(otime.getTime());
	diff  = new Date();
	diff.setTime(Math.abs(ntime.getTime() - votime.getTime()));
	var timediff = diff.getTime();
	var mmonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var mdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

	var hours = Math.floor(timediff / (1000 * 60 * 60)); 
	var mins = Math.floor(timediff / (1000 * 60)); 
	var c = Math.floor(timediff / 1000); 
	var ms = Math.floor(timediff);

	if(otime.getMonth() != ntime.getMonth()) return relativetime_ordi(otime.getDate()) + " " + mmonths[otime.getMonth()] + ", " + otime.getFullYear();
	if(otime.getDate() + 8 < ntime.getDate()) return relativetime_ordi(otime.getDate()) + " " + mmonths[otime.getMonth()];
	if(otime.getDate() + 7 < ntime.getDate()) return mdays[otime.getDay()];
	if(otime.getDate() + 1 < ntime.getDate()) return mdays[otime.getDay()];
	if(otime.getDate() < ntime.getDate()) return "yesterday";
	
	if(hours > 1) return hours + " hours ago";
	if(hours == 1) return "an hour ago";
	if(mins > 1) return mins + " minutes ago";
	if(mins == 1) return "a minute ago"
	if(c > 1) return c + " seconds ago";
	if(ms <= 1000) return "less than a second ago";
}

function relativetime3(otime)
{
	var ntime = new Date();
	var votime = new Date(otime.getTime());
	diff  = new Date();
	diff.setTime(Math.abs(ntime.getTime() - votime.getTime()));
	var timediff = diff.getTime();
	var mmonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	return mmonths[otime.getMonth()] + ", " + otime.getFullYear() ;
}

function relativetime_ordi(n)
{
	var s='th';
	if(n===1 || n==21 || n==31) s='st';
	if(n===2 || n==22) s='nd';
	if(n===3 || n==23) s='rd';
	return n+s;
}

function relativetime_addzero(n)
{
	if(n <= 9) return "0" + n;
	else return n;
}

function relativetime_addzerohour(n, m)
{
	var vs = "AM";
	
	if(n >= 12) vs = "PM";
	else if(n == 0) n = 12;
	
	var v = n;
	
	if(v <= 9) v = "0" + v;
	
	if(m)
		return vs;
	else
		return v;
}


/*
 * converts time for special details
 * output format: 10th January, 2012 at 12.03AM
 */
function relativetime_full(otime)
{
	var mmonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var mdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	var ampm = relativetime_addzerohour(otime.getHours(), 1);
	return relativetime_ordi(otime.getDate()) + " " + mmonths[otime.getMonth()] + ", " + otime.getFullYear() + " at " + relativetime_addzerohour(otime.getHours(), 0) + ":" + relativetime_addzero(otime.getMinutes()) + "" + ampm;
}




var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};