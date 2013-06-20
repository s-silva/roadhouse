/*
	Copyright (c) Roadhouse, 2013
*/

/* initlial environment setup */

if (!window.console) console = {log: function(){}};


var current_conv = 0
var current_conv_type = 1


/* code */


function init()
{
	$('people_report').innerHTML = "";

	for(var i=1; i<6; i++)
	{
		var ajax = new Ajax();
		ajax.get("../api/people/get.json?id=" + i, function(r){
				var o = json_decode(r);
				if(o.fname)
					$('people_report').innerHTML += "<br/><a href='javascript: people_get_friends(" + o.id + ")'>" + o.fname + " " + o.lname + " (" + o.username + ")</a> - <a href='javascript: people_add_friend(\"" + o.fullid + "\",\"" + o.id + "\")'>(Add)</a>";
					
			}, null);
	}

	socket_listener.start()


}

var socket_listener = {
    socket: null,

    start: function()
    {
        var url = "ws://" + location.host + "/socketapi";
        if ("WebSocket" in window)
        {
			socket_listener.socket = new WebSocket(url);
        } else {
            socket_listener.socket = new MozWebSocket(url);
        }
		socket_listener.socket.onmessage = function(event)
		{
			$("notifications_report").innerHTML += event.data + "<br/>";
			//socket_listener.showMessage()JSON.parse(event.data));
		}
    },

    //showMessage: function(message) {
    //    var existing = $("#m" + message.id);
    //    if (existing.length > 0) return;
    //    var node = $(message.html);
    //    node.hide();
    //    $("#inbox").append(node);
    //    node.slideDown();
    //}
};



function people_get_friends(uid)
{
	var ajax = new Ajax();
	ajax.get("../api/people/get_friends.json?id=" + uid, function(r){
			var o = json_decode(r);
			var s = "", i, p;
			for (i in o){
				p = o[i];
				s += p.fname + " " + p.lname + " (" + p.username + "),";
			}
			alert(s);
		}, null);


	var ajax = new Ajax();
	ajax.get("../api/people/get_subscriptions.json?id=" + uid, function(r){
			alert(r);
		}, null);
}


function people_add_friend(fuid, uid)
{
	var ajax = new Ajax();
	ajax.get("../api/people/add_friend.json?id=" + fuid + "&iid=" + uid, function(r){
			alert(r);
		}, null);
}


function people_createaccout()
{
	var ajax = new Ajax();
	var o = {  fname       : $('u_fname').value,
			   lname       : $('u_lname').value,
			   username    : $('u_uname').value,
			   email       : $('u_email').value,
			   password    : $('u_pass').value,
			   description : $('u_dsc').value,
			   status      : $('u_status').value };
	
	ajax.post("/api/people/create_account.json", o, function(r){
			alert(r);
		}, null);
}

function user_login()
{
	var em = document.getElementById("userlogin_email").value;
	var ps = document.getElementById("userlogin_pass").value;
	account_login(em, ps);
}


function account_login(email, pass)
{
	var ajax = new Ajax();
	
	ajax.get("/api/account/login.json?email=" + email + "&pass=" + pass, function(r){
			alert(r);
		}, null);
}

function account_logout(email, pass)
{
	var ajax = new Ajax();
	
	ajax.get("/api/account/logout.json", function(r){
			alert(r);
		}, null);
}

function account_deactivate(email, pass)
{
	var ajax = new Ajax();
	
	ajax.get("/api/account/deactivate.json", function(r){
			alert(r);
		}, null);
}


function people_search()
{
	var q = $('u_searchinput').value;
	var ajax = new Ajax();
	
	ajax.get("/api/people/search_simple.json?q=" + q, function(r){
			alert(r);
		}, null);
}


function room_search()
{
	var lat = $('r_search_lat').value;
	var lng = $('r_search_long').value;
	var ajax = new Ajax();

	$('rooms_report').innerHTML = "";
	
	ajax.get("/api/rooms/get.json?lat=" + lat + "&long=" + lng + "&rad=1", function(r){
			$('rooms_report').innerHTML = "";

			var o = json_decode(r);



			var s = "<ul>", i, p;
			for (i in o){
				p = o[i];


				var enterleave = "Enter";
				var subscrieunsubscribe = "Subscribe";
				var ientered = 0;
				var isubscribed = 0;

				if(p.intheroom)
				{
					enterleave = "Leave";
					ientered = 1;
				}

				if(p.subscribed)
				{
					
					subscrieunsubscribe = "Unubscribe";
					isubscribed = 1;
				}

				s += "<li><a href='javascript: show_room_conversation(\"" + p.id + "\")'>" + p.name + " - " + p.dsc +
				"</a> <a href='javascript: room_enterleave(\"" + p.id + "\", " + ientered +
					")'>(" + enterleave + ")</a> <a href='javascript: room_subscribeunsubscribe(\"" + p.id + "\","
					+ isubscribed + ")'>(" + subscrieunsubscribe + ")</a></li>";
			}
			$('rooms_report').innerHTML = s + "</ul>";
		}, null);
}


function room_create()
{
	var ajax = new Ajax();
	var o = {  name    : $('r_name').value,
			   lat     : $('r_lat').value,
			   long    : $('r_long').value,
			   size    : $('r_size').value,
			   dsc     : $('r_dsc').value,
			   address : $('r_address').value };
	
	ajax.post("/api/rooms/create.json", o, function(r){
			alert(r);
		}, null);
}


function room_enterleave(roomid, isintheroom)
{
	var ajax = new Ajax();

	if(!isintheroom)
	{
		ajax.get("/api/rooms/enter.json?id=" + roomid, function(r){
				alert(r);
			}, null);
	}else{
		ajax.get("/api/rooms/leave.json?id=" + roomid, function(r){
			alert(r);
		}, null);
	}
}


function room_subscribeunsubscribe(roomid, issubscribed)
{
	var ajax = new Ajax();

	if(issubscribed)
	{
		ajax.get("/api/rooms/unsubscribe.json?id=" + roomid, function(r){
				alert(r);
			}, null);
	}else{
		ajax.get("/api/rooms/subscribe.json?id=" + roomid, function(r){
				alert(r);
			}, null);
	}
}


function show_conversation(obj)
{
	/* obj.id is the conversation id for later calls */

	current_conv = obj.id;
	current_conv_type = 1; /* conversation */

	if(obj.type) current_conv_type = obj.type;

	
	var s = "<ul>";
	var p, np, uname;

	for (i in obj.posts)
	{
		p = obj.posts[i];
		if(p.user)
			uname = p.user.name;

		s += "<li>" + uname + " - (" + p.rating + ") " + p.text + "</li> <a href='javascript: post_add_note(\"" + p.id + "\")'>(Note)</a>" + 
									 "<a href='javascript: post_mark(\"" + p.id + "\", \"" + 0 + "\", 1)'>(Up)</a>" + 
									 "<a href='javascript: post_mark(\"" + p.id + "\", \"" + 0 + "\", 0)'>(Down)</a>" + 
									 "<a href='javascript: post_delete(\"" + p.id + "\", \"" + 0 + "\")'>(Delete)</a>";

		if(p.notes)
		{
			s += "<ul>";
			for (j in p.notes.posts)
			{
				np = p.notes.posts[j];
				if(np.user)
					uname = np.user.name;
				s += "<li>" + uname + " - (" + np.rating + ") " + np.text + "</li> <a href='javascript: post_mark(\"" + p.id + "\", \"" + np.id + "\", 1)'>(Up)</a>" + 
											  "<a href='javascript: post_mark(\"" + p.id + "\", \"" + np.id + "\", 0)'>(Down)</a>" + 
											  "<a href='javascript: post_delete(\"" + p.id + "\", \"" + np.id + "\")'>(Delete)</a>";
			}

			s += "</ul>";
		}
	}

	s += "</ul>";
	$('conver_report').innerHTML = s;
}


function show_room_conversation(roomid)
{
	var ajax = new Ajax();
	ajax.get("/api/rooms/get_conversation.json?id=" + roomid, function(r){
				alert(r)
				show_conversation(json_decode(r));
			}, null);
}


function post_new()
{

	var ajax = new Ajax();

	ctext = $('text_newpost').value;

	/* convid, postid, text, tags, data, type */

	o = {convid: current_conv, postid: 0, type: "text", text: ctext}

	ajax.post("/api/conversations/post.json", o, function(r){
				alert(r);
			}, null);

}

function post_add_note(id)
{
	var ctext = prompt("Note:", "Write something");
	if(ctext)
	{
		var ajax = new Ajax();

		/* convid, postid, text, tags, data, type */

		o = {convid: current_conv, postid: id, type: "text", text: ctext}

		ajax.post("/api/conversations/post.json", o, function(r){
					alert(r);
				}, null);
	}
}


function post_mark(postid, noteid, isup)
{
	var ajax = new Ajax();

	if(isup)
	{
		ajax.get("/api/conversations/up.json?convid=" + current_conv + "&postid=" + postid + "&noteid=" + noteid, function(r){
					alert(r)
				}, null);
	}else{
		ajax.get("/api/conversations/down.json?convid=" + current_conv + "&postid=" + postid + "&noteid=" + noteid, function(r){
					alert(r)
				}, null);
	}
}

function post_delete(postid, noteid)
{
	var ajax = new Ajax();
	ajax.get("/api/conversations/delete.json?convid=" + current_conv + "&postid=" + postid + "&noteid=" + noteid, function(r){
				alert(r)
			}, null);
}



/* AJAX ------------------------------*/

function Ajax()
{
	/* constructor */

	var parent = this;
	this.xmlhttp = null;

	if (typeof(XMLHttpRequest) != undefined)
	{
		this.xmlhttp = new XMLHttpRequest;
	}else if (window.ActiveXObject){
		var ieXMLHttpVersions = ['MSXML2.XMLHttp.5.0', 'MSXML2.XMLHttp.4.0',
								'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp', 'Microsoft.XMLHttp'];
		for (var i = 0; i < ieXMLHttpVersions.length; i++) {
			try {
				this.xmlhttp = new ActiveXObject(ieXMLHttpVersions[i]);
				break;
			} catch (e) {
			}
		}
	}

	/* functions */

	this.get = function(path, success, fail)
	{
		this.xmlhttp.open("GET", path, true);
		this.xmlhttp.send(null); 
		this.xmlhttp.onreadystatechange = function()
		{
			if(parent.xmlhttp.readyState === 4)
			{
				if (parent.xmlhttp.status === 200)
				{
					if(success)
						success(parent.xmlhttp.responseText);
				}else{
					if(fail)
						fail(parent.xmlhttp.status);
				}
			}
		};
	}


	/* post jason data, ignored URI data because it's
		just ugly */

	this.post = function(path, json, success, fail)
	{
		json._xsrf = getCookie("_xsrf");

		this.xmlhttp.open("POST", path, true);
		dv = this.serialize(json);
		this.xmlhttp.setRequestHeader("Accept", "text/plain, */*");
		this.xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		this.xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		this.xmlhttp.send(dv);

		this.xmlhttp.onreadystatechange = function()
		{
			if(parent.xmlhttp.readyState === 4)
			{
				if (parent.xmlhttp.status === 200)
				{
					if(success)
						success(parent.xmlhttp.responseText);
				}else{
					if(fail)
						fail(parent.xmlhttp.status);
				}
			}
		};
	}

	/* supporting */


	this.serialize = function(obj, prefix)
	{
		var str = [];
		for(var p in obj) {
			var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			str.push(typeof v == "object" ? 
				this.serialize(v, k) :
				encodeURIComponent(k) + "=" + encodeURIComponent(v));
		}
		return str.join("&");
	}

}


/* JSON Support ------------------------------------------------------------ */

function json_decode(json)
{
	try
	{
		var psq = json.indexOf("[");
		var pcb = json.indexOf("{");
		var l = json.length;
		var p;
		
		if(psq < 0) psq = l;
		if(pcb < 0) pcb = l;

		if(psq < 0 && pcb < 0)
			p = 0;
		else
			p = Math.min(psq, pcb);


		console.log(psq);
		console.log(pcb);
		console.log(p);
		json = json.substr(p);
		return JSON.parse(json);
	}catch (e){
		console.log(e.message);
		return null;
	}
}


/* Basic supporting functions --------------------------------------------- */


function $(id)
{
	return document.getElementById(id);
}


function getCookie(name)
{
	var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
	return r ? r[1] : undefined;
}

